import { useEffect, useRef } from "react";
import type { MarketFeed } from "@/game/market";

type Props = {
  feed: MarketFeed;
  tick: number;
  className?: string;
  entryPrice?: number | null;
  entryDir?: "LONG" | "SHORT" | null;
  ownedIndicators?: string[];
};

function calcEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = data[0];
  for (const d of data) { prev = d * k + prev * (1 - k); out.push(prev); }
  return out;
}
function calcSMA(data: number[], period: number): number[] {
  return data.map((_, i) => {
    if (i < period - 1) return NaN;
    return data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
  });
}

export function CandleChart({ feed, tick, className, entryPrice, entryDir, ownedIndicators = [] }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const parent = c.parentElement!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      c.width = parent.clientWidth * dpr;
      c.height = parent.clientHeight * dpr;
      c.style.width = parent.clientWidth + "px";
      c.style.height = parent.clientHeight + "px";
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    // background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0b0e1a");
    bg.addColorStop(1, "#050710");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const history = feed.history();
    const cur = feed.peek();
    const all = [...history, cur];
    const view = all.slice(-80).filter((k) => Number.isFinite(k.close) && Number.isFinite(k.high) && Number.isFinite(k.low));
    if (view.length < 1) return;

    const highs = view.map((k) => k.high);
    const lows = view.map((k) => k.low);
    let max = Math.max(...highs);
    let min = Math.min(...lows);
    if (max === min) { max += 1; min -= 1; }
    const pad = (max - min) * 0.15 || max * 0.01;
    max += pad; min -= pad;

    const cwPx = W / view.length;
    const bodyW = Math.max(2 * (window.devicePixelRatio || 1), cwPx * 0.62);
    const yOf = (p: number) => H - ((p - min) / (max - min)) * H;

    // grid
    ctx.strokeStyle = "rgba(120,130,180,0.10)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      const y = (H / 6) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let i = 1; i < 10; i++) {
      const x = (W / 10) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    // price axis labels
    ctx.fillStyle = "rgba(180,200,220,0.55)";
    ctx.font = `${11 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
    for (let i = 0; i <= 5; i++) {
      const p = max - ((max - min) / 5) * i;
      ctx.fillText(p.toFixed(1), 6, (H / 5) * i + 12);
    }

    // ── Volume bars (below candles) ───────────────────────────────────────────
    if (ownedIndicators.includes("ind_vol")) {
      const volHeight = H * 0.12;
      const maxVol = Math.max(...view.map((k) => k.volume || 1));
      view.forEach((k, i) => {
        const x = i * cwPx + cwPx / 2;
        const vH = ((k.volume || 1) / maxVol) * volHeight;
        ctx.fillStyle = k.close >= k.open ? "rgba(74,222,128,0.25)" : "rgba(244,63,94,0.25)";
        ctx.fillRect(x - bodyW / 2, H - vH, bodyW, vH);
      });
    }

    // candles
    view.forEach((k, i) => {
      const x = i * cwPx + cwPx / 2;
      const up = k.close >= k.open;
      const color = up ? "#4ade80" : "#f43f5e";
      const glow = up ? "rgba(74,222,128,0.55)" : "rgba(244,63,94,0.55)";
      // wick
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, (window.devicePixelRatio || 1));
      ctx.beginPath();
      ctx.moveTo(x, yOf(k.high));
      ctx.lineTo(x, yOf(k.low));
      ctx.stroke();
      // body
      const bodyTop = yOf(Math.max(k.open, k.close));
      const bodyBot = yOf(Math.min(k.open, k.close));
      ctx.fillStyle = color;
      ctx.shadowColor = glow;
      ctx.shadowBlur = i === view.length - 1 ? 16 : 4;
      ctx.fillRect(x - bodyW / 2, bodyTop, bodyW, Math.max(1, bodyBot - bodyTop));
      ctx.shadowBlur = 0;
    });

    // ── EMA overlay ─────────────────────────────────────────────────────────────
    if (ownedIndicators.includes("ind_ema")) {
      const ema = calcEMA(view.map((k) => k.close), 14);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5 * (window.devicePixelRatio || 1);
      ctx.setLineDash([]);
      ctx.beginPath();
      let started = false;
      ema.forEach((v, i) => {
        if (!Number.isFinite(v)) return;
        const x = i * cwPx + cwPx / 2;
        if (!started) { ctx.moveTo(x, yOf(v)); started = true; }
        else ctx.lineTo(x, yOf(v));
      });
      ctx.stroke();
      // Label
      ctx.font = `${10 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
      ctx.fillStyle = "#f59e0b";
      ctx.fillText("EMA14", 4, 38);
    }

    // ── MA overlay ──────────────────────────────────────────────────────────────
    if (ownedIndicators.includes("ind_ma")) {
      const sma = calcSMA(view.map((k) => k.close), 20);
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 1.5 * (window.devicePixelRatio || 1);
      ctx.setLineDash([]);
      ctx.beginPath();
      let started = false;
      sma.forEach((v, i) => {
        if (!Number.isFinite(v)) return;
        const x = i * cwPx + cwPx / 2;
        if (!started) { ctx.moveTo(x, yOf(v)); started = true; }
        else ctx.lineTo(x, yOf(v));
      });
      ctx.stroke();
      ctx.font = `${10 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
      ctx.fillStyle = "#a78bfa";
      ctx.fillText("MA20", 4, 52);
    }

    // ── VWAP overlay ─────────────────────────────────────────────────────────────
    if (ownedIndicators.includes("ind_vwap")) {
      let cumPV = 0, cumVol = 0;
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5 * (window.devicePixelRatio || 1);
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      view.forEach((k, i) => {
        const v = k.volume || 1;
        cumPV += ((k.high + k.low + k.close) / 3) * v;
        cumVol += v;
        const vwap = cumPV / cumVol;
        const x = i * cwPx + cwPx / 2;
        if (i === 0) ctx.moveTo(x, yOf(vwap));
        else ctx.lineTo(x, yOf(vwap));
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `${10 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("VWAP", 4, 66);
    }

    // ── S/R lines ───────────────────────────────────────────────────────────────
    if (ownedIndicators.includes("ind_sr")) {
      const recent = view.slice(-20);
      const hi = Math.max(...recent.map((k) => k.high));
      const lo = Math.min(...recent.map((k) => k.low));
      ctx.lineWidth = 1 * (window.devicePixelRatio || 1);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "rgba(74,222,128,0.6)";
      ctx.beginPath(); ctx.moveTo(0, yOf(lo)); ctx.lineTo(W, yOf(lo)); ctx.stroke();
      ctx.strokeStyle = "rgba(244,63,94,0.6)";
      ctx.beginPath(); ctx.moveTo(0, yOf(hi)); ctx.lineTo(W, yOf(hi)); ctx.stroke();
      ctx.setLineDash([]);
      const dpr = window.devicePixelRatio || 1;
      ctx.font = `${10 * dpr}px "VT323", monospace`;
      ctx.fillStyle = "rgba(74,222,128,0.8)";
      ctx.fillText(`SUP ${lo.toFixed(1)}`, 4, yOf(lo) - 3);
      ctx.fillStyle = "rgba(244,63,94,0.8)";
      ctx.fillText(`RES ${hi.toFixed(1)}`, 4, yOf(hi) + 12);
    }

    // ── Bollinger Bands ─────────────────────────────────────────────────────────
    if (ownedIndicators.includes("ind_bb") && view.length >= 20) {
      const period = 20;
      const closes = view.map((k) => k.close);
      const bands: Array<{ mid: number; up: number; dn: number }> = [];
      for (let i = 0; i < closes.length; i++) {
        if (i < period - 1) { bands.push({ mid: NaN, up: NaN, dn: NaN }); continue; }
        const slice = closes.slice(i - period + 1, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / period;
        const std = Math.sqrt(slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period);
        bands.push({ mid: mean, up: mean + 2 * std, dn: mean - 2 * std });
      }
      const drawBand = (vals: number[], color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1 * (window.devicePixelRatio || 1);
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        let started = false;
        vals.forEach((v, i) => {
          if (!Number.isFinite(v)) return;
          const x = i * cwPx + cwPx / 2;
          if (!started) { ctx.moveTo(x, yOf(v)); started = true; }
          else ctx.lineTo(x, yOf(v));
        });
        ctx.stroke();
        ctx.setLineDash([]);
      };
      drawBand(bands.map(b => b.up), "rgba(251,191,36,0.6)");
      drawBand(bands.map(b => b.dn), "rgba(251,191,36,0.6)");
      drawBand(bands.map(b => b.mid), "rgba(251,191,36,0.35)");
      const dpr = window.devicePixelRatio || 1;
      ctx.font = `${10 * dpr}px "VT323", monospace`;
      ctx.fillStyle = "rgba(251,191,36,0.8)";
      ctx.fillText("BB20", 4, 80);
    }

    // ── Fibonacci retracement ───────────────────────────────────────────────────
    if (ownedIndicators.includes("ind_fib") && view.length >= 10) {
      const window20 = view.slice(-30);
      const swingHigh = Math.max(...window20.map(k => k.high));
      const swingLow  = Math.min(...window20.map(k => k.low));
      const range = swingHigh - swingLow;
      const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
      const fibColors = ["#f87171","#fb923c","#fbbf24","#a3e635","#34d399","#22d3ee","#818cf8"];
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      fibLevels.forEach((ratio, fi) => {
        const price = swingHigh - range * ratio;
        const fy = yOf(price);
        ctx.strokeStyle = fibColors[fi] + "70";
        ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke();
        const dpr = window.devicePixelRatio || 1;
        ctx.font = `${9 * dpr}px "VT323", monospace`;
        ctx.fillStyle = fibColors[fi] + "cc";
        ctx.fillText(`${(ratio * 100).toFixed(1)}% ${price.toFixed(1)}`, W * 0.62, fy - 3);
      });
      ctx.setLineDash([]);
    }

    // ── SMC: FVG + Order Blocks + Liquidity Sweeps ──────────────────────────────
    if (ownedIndicators.includes("ind_smc") && view.length >= 4) {
      const dpr = window.devicePixelRatio || 1;
      ctx.font = `${9 * dpr}px "VT323", monospace`;

      // Fair Value Gaps (show last 5)
      let fvgCount = 0;
      for (let i = view.length - 3; i >= 1 && fvgCount < 5; i--) {
        const c0 = view[i - 1], c2 = view[i + 1];
        // Bullish FVG: gap between c0.high and c2.low
        if (c0.high < c2.low - (max - min) * 0.003) {
          const x0 = (i - 1) * cwPx;
          const xEnd = W;
          ctx.fillStyle = "rgba(74,222,128,0.08)";
          ctx.fillRect(x0, yOf(c2.low), xEnd - x0, yOf(c0.high) - yOf(c2.low));
          ctx.strokeStyle = "rgba(74,222,128,0.4)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(x0, yOf(c0.high)); ctx.lineTo(xEnd, yOf(c0.high)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x0, yOf(c2.low));  ctx.lineTo(xEnd, yOf(c2.low));  ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(74,222,128,0.7)";
          ctx.fillText("FVG", x0 + 2, yOf((c0.high + c2.low) / 2) + 4);
          fvgCount++;
        }
        // Bearish FVG: gap between c0.low and c2.high
        if (c0.low > c2.high + (max - min) * 0.003) {
          const x0 = (i - 1) * cwPx;
          const xEnd = W;
          ctx.fillStyle = "rgba(244,63,94,0.08)";
          ctx.fillRect(x0, yOf(c0.low), xEnd - x0, yOf(c2.high) - yOf(c0.low));
          ctx.strokeStyle = "rgba(244,63,94,0.4)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(x0, yOf(c0.low));  ctx.lineTo(xEnd, yOf(c0.low));  ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x0, yOf(c2.high)); ctx.lineTo(xEnd, yOf(c2.high)); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(244,63,94,0.7)";
          ctx.fillText("FVG", x0 + 2, yOf((c0.low + c2.high) / 2) + 4);
          fvgCount++;
        }
      }

      // Order Blocks: last bullish/bearish before a 3-candle impulse
      for (let i = 2; i < view.length - 2; i++) {
        const bullImpulse = view[i].close > view[i].open && view[i+1].close > view[i+1].open && view[i-1].close < view[i-1].open;
        const bearImpulse = view[i].close < view[i].open && view[i+1].close < view[i+1].open && view[i-1].close > view[i-1].open;
        if (bullImpulse) {
          const ob = view[i - 1];
          const x = (i - 1) * cwPx;
          ctx.strokeStyle = "rgba(96,165,250,0.7)";
          ctx.lineWidth = 1.5 * dpr;
          ctx.setLineDash([]);
          ctx.strokeRect(x, yOf(Math.max(ob.open, ob.close)), cwPx, Math.abs(yOf(ob.open) - yOf(ob.close)));
          ctx.fillStyle = "rgba(96,165,250,0.5)";
          ctx.fillText("OB", x + 2, yOf(Math.max(ob.open, ob.close)) + 10 * dpr);
        }
        if (bearImpulse) {
          const ob = view[i - 1];
          const x = (i - 1) * cwPx;
          ctx.strokeStyle = "rgba(251,146,60,0.7)";
          ctx.lineWidth = 1.5 * dpr;
          ctx.strokeRect(x, yOf(Math.max(ob.open, ob.close)), cwPx, Math.abs(yOf(ob.open) - yOf(ob.close)));
          ctx.fillStyle = "rgba(251,146,60,0.5)";
          ctx.fillText("OB", x + 2, yOf(Math.max(ob.open, ob.close)) + 10 * dpr);
        }
      }

      // Liquidity Sweeps: candle pierced prev high/low but closed back inside
      if (view.length >= 5) {
        const prev4 = view.slice(-6, -1);
        const prevHigh = Math.max(...prev4.map(k => k.high));
        const prevLow  = Math.min(...prev4.map(k => k.low));
        const last = view[view.length - 1];
        const cx = (view.length - 1) * cwPx + cwPx / 2;
        if (last.high > prevHigh * 1.002 && last.close < prevHigh) {
          // Bearish sweep of high
          ctx.strokeStyle = "#f87171";
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          ctx.moveTo(cx - 6 * dpr, yOf(last.high) - 10 * dpr);
          ctx.lineTo(cx, yOf(last.high));
          ctx.lineTo(cx + 6 * dpr, yOf(last.high) - 10 * dpr);
          ctx.stroke();
          ctx.fillStyle = "#f87171";
          ctx.fillText("SWEEP", cx - 14 * dpr, yOf(last.high) - 14 * dpr);
        }
        if (last.low < prevLow * 0.998 && last.close > prevLow) {
          // Bullish sweep of low
          ctx.strokeStyle = "#4ade80";
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          ctx.moveTo(cx - 6 * dpr, yOf(last.low) + 10 * dpr);
          ctx.lineTo(cx, yOf(last.low));
          ctx.lineTo(cx + 6 * dpr, yOf(last.low) + 10 * dpr);
          ctx.stroke();
          ctx.fillStyle = "#4ade80";
          ctx.fillText("SWEEP", cx - 14 * dpr, yOf(last.low) + 22 * dpr);
        }
      }
    }

    // latest price line
    const lastY = yOf(cur.close);
    ctx.strokeStyle = "rgba(250,204,21,0.6)";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, lastY); ctx.lineTo(W, lastY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(W - 78, lastY - 10, 74, 20);
    ctx.fillStyle = "#0b0e1a";
    ctx.font = `bold ${12 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
    ctx.fillText(cur.close.toFixed(2), W - 72, lastY + 6);

    // Entry line for pending position
    if (entryPrice != null && Number.isFinite(entryPrice)) {
      const eY = yOf(entryPrice);
      const isLong = entryDir === "LONG";
      const color = isLong ? "#4ade80" : "#f43f5e";
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 * (window.devicePixelRatio || 1);
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(0, eY); ctx.lineTo(W, eY); ctx.stroke();
      ctx.setLineDash([]);
      // Shaded pnl region between entry and current
      ctx.fillStyle = (cur.close >= entryPrice) === isLong
        ? "rgba(74,222,128,0.10)"
        : "rgba(244,63,94,0.10)";
      ctx.fillRect(0, Math.min(eY, lastY), W, Math.abs(lastY - eY));
      // Label pill on the left
      const label = `${isLong ? "▲ LONG" : "▼ SHORT"} @ ${entryPrice.toFixed(2)}`;
      const dpr = window.devicePixelRatio || 1;
      ctx.font = `bold ${11 * dpr}px "VT323", monospace`;
      const w = ctx.measureText(label).width + 12;
      ctx.fillStyle = color;
      ctx.fillRect(4, eY - 10, w, 20);
      ctx.fillStyle = "#0b0e1a";
      ctx.fillText(label, 10, eY + 5);

      // ── TP / SL lines ────────────────────────────────────────────────────────
      const tpPrice = entryPrice * (isLong ? 1.015 : 0.985);
      const slPrice = entryPrice * (isLong ? 0.990 : 1.010);
      const tpY = yOf(tpPrice);
      const slY = yOf(slPrice);
      const dpr2 = window.devicePixelRatio || 1;

      // TP line
      ctx.strokeStyle = "rgba(74,222,128,0.9)";
      ctx.lineWidth = 1.5 * dpr2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(0, tpY); ctx.lineTo(W, tpY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(W - 38, tpY - 9, 36, 18);
      ctx.fillStyle = "#0b0e1a";
      ctx.font = `bold ${10 * dpr2}px "VT323", monospace`;
      ctx.fillText("TP", W - 30, tpY + 5);

      // SL line
      ctx.strokeStyle = "rgba(244,63,94,0.9)";
      ctx.lineWidth = 1.5 * dpr2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(0, slY); ctx.lineTo(W, slY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(W - 38, slY - 9, 36, 18);
      ctx.fillStyle = "#0b0e1a";
      ctx.fillText("SL", W - 30, slY + 5);
    }

    // Pattern label (top-right, above price pill)
    try {
      const pat = feed.currentPattern();
      const prog = Math.round(feed.patternProgress() * 100);
      const dpr = window.devicePixelRatio || 1;
      ctx.font = `${12 * dpr}px "VT323", monospace`;
      const text = `PATTERN: ${pat}  ${prog}%`;
      const tw = ctx.measureText(text).width + 10;
      ctx.fillStyle = "rgba(11,14,26,0.75)";
      ctx.fillRect(W - tw - 6, 6, tw, 22);
      ctx.strokeStyle = "rgba(120,180,255,0.4)";
      ctx.strokeRect(W - tw - 6, 6, tw, 22);
      ctx.fillStyle = "#8fb6ff";
      ctx.fillText(text, W - tw - 1, 22);
    } catch { /* older feeds without pattern methods */ }
  }, [tick, feed, entryPrice, entryDir]);

  return (
    <div className={"relative w-full h-full " + (className ?? "")}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}