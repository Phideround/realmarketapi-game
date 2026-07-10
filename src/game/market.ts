import type { Candle, MarketMode } from "./types";

// Deterministic-ish pseudo-random with reseed per session
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface MarketFeed {
  next(dtMs: number): Candle | null; // returns a closed candle when one forms
  peek(): Candle; // in-progress candle for smooth drawing
  history(): Candle[];
  setMode(mode: MarketMode): void;
  setBiasBoost(bias: number, volMult: number, ttlMs: number): void;
  applyShock(deltaPct: number): void;
  getMode(): MarketMode;
  getSpeedMs(): number;
  setSpeedMs(ms: number): void;
}

type RegimeState = {
  drift: number;
  vol: number;
  momentum: number;
  support: number;
  resistance: number;
  regimeTtl: number;
};

export function createSimulatedFeed(seed = Math.floor(Math.random() * 1e9)): MarketFeed {
  const rand = mulberry32(seed);
  const hist: Candle[] = [];
  let mode: MarketMode = "SIDEWAYS";
  let price = 10000;
  let candleMs = 2500;
  let elapsedInCandle = 0;
  let cur: Candle = fresh(price, Date.now());
  let regime: RegimeState = newRegime();
  let boostBias = 0;
  let boostVol = 1;
  let boostTtl = 0;

  function newRegime(): RegimeState {
    const kind = rand();
    let drift = 0;
    let vol = 0.0025;
    if (mode === "BULL") drift = 0.0012 + rand() * 0.001;
    else if (mode === "BEAR") drift = -(0.0012 + rand() * 0.001);
    else if (mode === "HIGH_VOL") { drift = (rand() - 0.5) * 0.002; vol = 0.006 + rand() * 0.004; }
    else if (mode === "MEME") { drift = (rand() - 0.5) * 0.005; vol = 0.008 + rand() * 0.006; }
    else if (mode === "BLACK_SWAN") { drift = -0.004; vol = 0.012; }
    else drift = (rand() - 0.5) * 0.0008;

    // regime sub-kind: trend / pullback / sideways / breakout
    if (kind < 0.25) drift *= 0.2; // sideways stretch
    else if (kind < 0.45) drift *= -0.5; // pullback against mode
    else if (kind < 0.65) drift *= 2; // breakout

    return {
      drift,
      vol,
      momentum: 0,
      support: price * (0.985 - rand() * 0.01),
      resistance: price * (1.015 + rand() * 0.01),
      regimeTtl: 8000 + rand() * 14000,
    };
  }

  function fresh(p: number, t: number): Candle {
    return { t, open: p, high: p, low: p, close: p, volume: 0 };
  }

  function step(dtMs: number) {
    // Sub-tick update for smooth in-progress candle
    const subDt = dtMs / 1000;
    let vol = regime.vol * boostVol;
    let drift = regime.drift + boostBias * 0.004;

    // Support/resistance nudging
    if (price < regime.support) drift += 0.001;
    if (price > regime.resistance) drift -= 0.001;

    // Random micro-move (gaussian-ish)
    const n = (rand() + rand() + rand() - 1.5) / 1.5;
    const change = price * (drift * subDt + vol * n * Math.sqrt(subDt) * 3);
    regime.momentum = regime.momentum * 0.9 + change * 0.1;
    price = Math.max(1, price + change + regime.momentum * 0.05);

    cur.close = price;
    cur.high = Math.max(cur.high, price);
    cur.low = Math.min(cur.low, price);
    cur.volume += Math.abs(change) * (0.5 + rand());
  }

  return {
    next(dtMs: number) {
      elapsedInCandle += dtMs;
      regime.regimeTtl -= dtMs;
      if (boostTtl > 0) {
        boostTtl -= dtMs;
        if (boostTtl <= 0) { boostBias = 0; boostVol = 1; }
      }
      // Multiple micro-steps for smoothness
      const steps = 4;
      for (let i = 0; i < steps; i++) step(dtMs / steps);

      if (regime.regimeTtl <= 0) regime = newRegime();

      if (elapsedInCandle >= candleMs) {
        elapsedInCandle = 0;
        const closed = { ...cur };
        hist.push(closed);
        if (hist.length > 400) hist.shift();
        cur = fresh(price, Date.now());
        return closed;
      }
      return null;
    },
    peek: () => cur,
    history: () => hist,
    setMode(m) { mode = m; regime = newRegime(); },
    getMode: () => mode,
    setBiasBoost(bias, volMult, ttlMs) { boostBias = bias; boostVol = volMult; boostTtl = ttlMs; },
    applyShock(pct) {
      price = Math.max(1, price * (1 + pct));
      cur.close = price;
      cur.high = Math.max(cur.high, price);
      cur.low = Math.min(cur.low, price);
    },
    getSpeedMs: () => candleMs,
    setSpeedMs: (ms) => { candleMs = Math.max(700, ms); },
  };
}

// Prep for future real feed swap
export interface RealMarketAPI {
  connect(): Promise<MarketFeed>;
}