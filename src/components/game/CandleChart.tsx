import { useEffect, useRef } from "react";
import type { MarketFeed } from "@/game/market";

type Props = { feed: MarketFeed; tick: number; className?: string };

export function CandleChart({ feed, tick, className }: Props) {
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
  }, [tick, feed]);

  return (
    <div className={"relative w-full h-full " + (className ?? "")}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}