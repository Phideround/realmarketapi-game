import type { Candle, MarketMode } from "./types";

// Pattern-driven market simulator. Instead of pure random walk,
// the price follows chart patterns (uptrend, H&S, flags, wedges, cup&handle...)
// with noise layered on top. Patterns give the game a "readable" feel.

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type PatternKind =
  | "UPTREND" | "DOWNTREND"
  | "DOUBLE_TOP" | "DOUBLE_BOTTOM"
  | "HEAD_SHOULDERS" | "INV_HEAD_SHOULDERS"
  | "BULL_FLAG" | "BEAR_FLAG"
  | "ASC_TRIANGLE" | "DESC_TRIANGLE"
  | "RISING_WEDGE" | "FALLING_WEDGE"
  | "CUP_HANDLE"
  | "BREAKOUT_UP" | "BREAKOUT_DOWN"
  | "CONSOLIDATION"
  | "PARABOLIC" | "CAPITULATION";

export interface MarketFeed {
  next(dtMs: number): Candle | null;
  peek(): Candle;
  history(): Candle[];
  setMode(mode: MarketMode): void;
  setBiasBoost(bias: number, volMult: number, ttlMs: number): void;
  applyShock(deltaPct: number): void;
  getMode(): MarketMode;
  getSpeedMs(): number;
  setSpeedMs(ms: number): void;
  currentPattern(): PatternKind;
  patternProgress(): number;
  prime(candles: number): void;
}

const PATTERN_POOL: PatternKind[] = [
  "UPTREND","DOWNTREND","DOUBLE_TOP","DOUBLE_BOTTOM",
  "HEAD_SHOULDERS","INV_HEAD_SHOULDERS","BULL_FLAG","BEAR_FLAG",
  "ASC_TRIANGLE","DESC_TRIANGLE","RISING_WEDGE","FALLING_WEDGE",
  "CUP_HANDLE","BREAKOUT_UP","BREAKOUT_DOWN","CONSOLIDATION",
  "PARABOLIC","CAPITULATION",
];

// Returns fractional target price relative to pattern anchor. u ∈ [0,1]
function patternShape(p: PatternKind, u: number): number {
  const τ = Math.PI * 2;
  switch (p) {
    case "UPTREND": return 0.06 * u;
    case "DOWNTREND": return -0.06 * u;
    case "DOUBLE_TOP": return 0.05 * Math.sin(u * τ) - 0.03 * u;
    case "DOUBLE_BOTTOM": return -0.05 * Math.sin(u * τ) + 0.03 * u;
    case "HEAD_SHOULDERS": {
      // three bumps: shoulder, head, shoulder, then breakdown
      const b1 = 0.03 * Math.exp(-Math.pow((u - 0.2) * 6, 2));
      const b2 = 0.06 * Math.exp(-Math.pow((u - 0.5) * 6, 2));
      const b3 = 0.03 * Math.exp(-Math.pow((u - 0.8) * 6, 2));
      return b1 + b2 + b3 - 0.05 * u;
    }
    case "INV_HEAD_SHOULDERS": {
      const b1 = -0.03 * Math.exp(-Math.pow((u - 0.2) * 6, 2));
      const b2 = -0.06 * Math.exp(-Math.pow((u - 0.5) * 6, 2));
      const b3 = -0.03 * Math.exp(-Math.pow((u - 0.8) * 6, 2));
      return b1 + b2 + b3 + 0.05 * u;
    }
    case "BULL_FLAG": return u < 0.55 ? 0.05 * u : 0.028 - 0.02 * (u - 0.55) + 0.08 * (u - 0.55);
    case "BEAR_FLAG": return u < 0.55 ? -0.05 * u : -0.028 + 0.02 * (u - 0.55) - 0.08 * (u - 0.55);
    case "ASC_TRIANGLE": return 0.02 * u + 0.015 * Math.sin(u * τ * 3);
    case "DESC_TRIANGLE": return -0.02 * u + 0.015 * Math.sin(u * τ * 3);
    case "RISING_WEDGE": return 0.04 * u + 0.01 * Math.sin(u * τ * 4) - (u > 0.85 ? 0.06 * (u - 0.85) * 6 : 0);
    case "FALLING_WEDGE": return -0.04 * u - 0.01 * Math.sin(u * τ * 4) + (u > 0.85 ? 0.06 * (u - 0.85) * 6 : 0);
    case "CUP_HANDLE": return -0.05 * Math.sin(Math.PI * Math.min(u * 1.2, 1)) + (u > 0.85 ? 0.04 * (u - 0.85) * 6 : 0);
    case "BREAKOUT_UP": return u < 0.6 ? 0.005 * Math.sin(u * τ * 3) : 0.09 * (u - 0.6);
    case "BREAKOUT_DOWN": return u < 0.6 ? 0.005 * Math.sin(u * τ * 3) : -0.09 * (u - 0.6);
    case "CONSOLIDATION": return 0.008 * Math.sin(u * τ * 4);
    case "PARABOLIC": return 0.1 * Math.pow(u, 2.2);
    case "CAPITULATION": return -0.1 * Math.pow(u, 2.2);
  }
}

const PATTERN_MODE_WEIGHT: Record<MarketMode, Partial<Record<PatternKind, number>>> = {
  BULL: { UPTREND: 3, BULL_FLAG: 2, ASC_TRIANGLE: 2, CUP_HANDLE: 2, BREAKOUT_UP: 2, INV_HEAD_SHOULDERS: 1.5, PARABOLIC: 1 },
  BEAR: { DOWNTREND: 3, BEAR_FLAG: 2, DESC_TRIANGLE: 2, HEAD_SHOULDERS: 2, BREAKOUT_DOWN: 2, CAPITULATION: 1 },
  SIDEWAYS: { CONSOLIDATION: 3, DOUBLE_TOP: 1.5, DOUBLE_BOTTOM: 1.5, ASC_TRIANGLE: 1, DESC_TRIANGLE: 1 },
  HIGH_VOL: { BREAKOUT_UP: 1.5, BREAKOUT_DOWN: 1.5, PARABOLIC: 1, CAPITULATION: 1, RISING_WEDGE: 1, FALLING_WEDGE: 1 },
  MEME: { PARABOLIC: 3, CAPITULATION: 2, BREAKOUT_UP: 1.5, BULL_FLAG: 1 },
  BLACK_SWAN: { CAPITULATION: 4, BEAR_FLAG: 2, DOWNTREND: 2, HEAD_SHOULDERS: 1 },
};

export function createSimulatedFeed(seed = Math.floor(Math.random() * 1e9)): MarketFeed {
  const rand = mulberry32(seed);
  const hist: Candle[] = [];
  let mode: MarketMode = "SIDEWAYS";
  let price = 10000;
  let candleMs = 2500;
  let elapsedInCandle = 0;
  let cur: Candle = fresh(price, Date.now());
  let boostBias = 0, boostVol = 1, boostTtl = 0;

  // Pattern engine
  let pattern: PatternKind = "CONSOLIDATION";
  let patternAnchor = price;
  let patternDurationMs = 20000;
  let patternElapsed = 0;

  function pickPattern(): PatternKind {
    const w = PATTERN_MODE_WEIGHT[mode] ?? {};
    const entries: Array<[PatternKind, number]> = PATTERN_POOL.map((p) => [p, (w[p] ?? 0.4)]);
    const total = entries.reduce((a, [, v]) => a + v, 0);
    let r = rand() * total;
    for (const [p, v] of entries) { r -= v; if (r <= 0) return p; }
    return "CONSOLIDATION";
  }

  function newPattern() {
    pattern = pickPattern();
    patternAnchor = price;
    patternDurationMs = 12000 + rand() * 22000;
    patternElapsed = 0;
  }

  function fresh(p: number, t: number): Candle {
    return { t, open: p, high: p, low: p, close: p, volume: 0 };
  }

  function step(dtMs: number) {
    const subDt = Math.max(0, dtMs) / 1000;
    patternElapsed += dtMs;
    const u0 = Math.min(1, Math.max(0, patternElapsed / patternDurationMs));
    const u1 = Math.min(1, Math.max(0, (patternElapsed + dtMs) / patternDurationMs));
    const targetPrev = patternAnchor * (1 + patternShape(pattern, u0));
    const targetNext = patternAnchor * (1 + patternShape(pattern, u1));
    const targetDelta = targetNext - targetPrev;

    // Noise
    const baseVol = mode === "HIGH_VOL" || mode === "MEME" ? 0.004 : mode === "BLACK_SWAN" ? 0.008 : 0.0022;
    const vol = baseVol * boostVol;
    const n = (rand() + rand() + rand() - 1.5) / 1.5;
    const noise = price * vol * n * Math.sqrt(subDt) * 3;

    // Bias from events
    const biasPush = price * (boostBias * 0.003) * subDt;

    let next = price + targetDelta + noise + biasPush;
    if (!Number.isFinite(next)) next = price;
    price = Math.max(1, next);

    cur.close = price;
    cur.high = Math.max(cur.high, price);
    cur.low = Math.min(cur.low, price);
    cur.volume += Math.abs(targetDelta + noise || 0) * (0.5 + rand());
  }

  function advance(dtMs: number): Candle | null {
    elapsedInCandle += dtMs;
    if (boostTtl > 0) {
      boostTtl -= dtMs;
      if (boostTtl <= 0) { boostBias = 0; boostVol = 1; }
    }
    const subs = 4;
    for (let i = 0; i < subs; i++) step(dtMs / subs);
    if (patternElapsed >= patternDurationMs) newPattern();

    if (elapsedInCandle >= candleMs) {
      elapsedInCandle = 0;
      const closed = { ...cur };
      hist.push(closed);
      if (hist.length > 400) hist.shift();
      cur = fresh(price, Date.now());
      return closed;
    }
    return null;
  }

  newPattern();

  return {
    next: advance,
    peek: () => cur,
    history: () => hist,
    setMode(m) { mode = m; newPattern(); },
    getMode: () => mode,
    setBiasBoost(b, v, ttl) { boostBias = b; boostVol = v; boostTtl = ttl; },
    applyShock(pct) {
      price = Math.max(1, price * (1 + pct));
      cur.close = price;
      cur.high = Math.max(cur.high, price);
      cur.low = Math.min(cur.low, price);
      patternAnchor = price; // re-anchor after shock
    },
    getSpeedMs: () => candleMs,
    setSpeedMs: (ms) => { candleMs = Math.max(700, ms); },
    currentPattern: () => pattern,
    patternProgress: () => Math.min(1, patternElapsed / patternDurationMs),
    prime(n: number) {
      // Fast-forward to build initial history of `n` closed candles.
      let safety = n * 8;
      while (hist.length < n && safety-- > 0) advance(candleMs);
    },
  };
}

export interface RealMarketAPI { connect(): Promise<MarketFeed>; }
