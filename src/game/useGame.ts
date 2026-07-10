import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSimulatedFeed, type MarketFeed } from "./market";
import type { Candle, FloatingText, GameEvent, MarketMode, Prediction, Stats } from "./types";
import { rollBoss, rollEvent } from "./events";
import { sfx } from "./sfx";

const MODES: MarketMode[] = ["BULL", "BEAR", "SIDEWAYS", "HIGH_VOL", "MEME", "BLACK_SWAN"];

type Pending = { dir: Exclude<Prediction, "SKIP">; entry: number; at: number } | null;

const xpToLevel = (xp: number) => Math.floor(1 + Math.sqrt(xp / 25));

export function useGame() {
  const feedRef = useRef<MarketFeed | null>(null);
  if (!feedRef.current) feedRef.current = createSimulatedFeed();

  const [tick, setTick] = useCandles();
  const [stats, setStats] = useState<Stats>(() => initialStats());
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<"red" | "green" | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [scanlines, setScanlines] = useState(true);
  const [paused, setPaused] = useState(false);
  const [news, setNews] = useState<string[]>(["Welcome to Pixel Trader — predict the next candle."]);

  const startRef = useRef(Date.now());
  const lastEventRef = useRef(Date.now());
  const lastBossRef = useRef(Date.now());
  const lastDiffRef = useRef(Date.now());

  const pushFloat = useCallback((text: string, color: string) => {
    const f: FloatingText = {
      id: Math.random().toString(36).slice(2),
      text, color,
      x: 50 + Math.random() * 20 - 10,
      y: 40 + Math.random() * 20 - 10,
      createdAt: Date.now(),
    };
    setFloats((prev) => [...prev.slice(-12), f]);
    setTimeout(() => setFloats((prev) => prev.filter((x) => x.id !== f.id)), 1050);
  }, []);

  const addNews = useCallback((msg: string) => {
    setNews((n) => [msg, ...n].slice(0, 20));
  }, []);

  const resolvePending = useCallback((closed: Candle) => {
    setPending((p) => {
      if (!p) return null;
      const delta = closed.close - p.entry;
      const win = (p.dir === "LONG" && delta > 0) || (p.dir === "SHORT" && delta < 0);
      setStats((s) => {
        const pnl = Math.abs(delta / p.entry) * 1000 * (1 + s.combo * 0.05);
        let ns = { ...s };
        if (win) {
          const gain = Math.round(pnl);
          ns.wins += 1;
          ns.combo += 1;
          ns.bestCombo = Math.max(ns.bestCombo, ns.combo);
          ns.coins += 5 + Math.floor(ns.combo * 1.5);
          ns.xp += 10 + ns.combo * 2;
          ns.profit += gain;
          ns.balance += gain;
          ns.hp = Math.min(ns.maxHp, ns.hp + (ns.combo % 5 === 0 ? 5 : 0));
          sfx.win(); sfx.coin();
          pushFloat(`+$${gain}`, "var(--neon-green)");
          if (ns.combo >= 3) pushFloat(`x${ns.combo} COMBO`, "var(--neon-yellow)");
          setFlash("green");
        } else {
          const loss = Math.round(pnl * 0.6);
          const hpLoss = 10 + Math.min(15, Math.floor(pnl / 40));
          ns.losses += 1;
          ns.combo = 0;
          ns.hp = Math.max(0, ns.hp - hpLoss);
          ns.profit = Math.max(0, ns.profit - loss);
          ns.balance = Math.max(0, ns.balance - loss);
          sfx.lose();
          pushFloat(`-${hpLoss} HP`, "var(--neon-red)");
          setFlash("red");
          setShake(true);
          setTimeout(() => setShake(false), 400);
        }
        ns.level = xpToLevel(ns.xp);
        const total = ns.wins + ns.losses;
        ns.accuracy = total ? Math.round((ns.wins / total) * 100) : 0;
        if (ns.hp <= 0) { ns.gameOver = true; setPaused(true); }
        setTimeout(() => setFlash(null), 400);
        return ns;
      });
      return null;
    });
  }, [pushFloat]);

  // Main game loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!paused && feedRef.current) {
        const closed = feedRef.current.next(dt);
        if (closed) resolvePending(closed);
        setTick((t) => (t + 1) & 0xffff);

        const nowMs = Date.now();
        setStats((s) => ({ ...s, survivalMs: nowMs - startRef.current }));

        // Difficulty ramp every 60s
        if (nowMs - lastDiffRef.current > 60000) {
          lastDiffRef.current = nowMs;
          const f = feedRef.current;
          f.setSpeedMs(f.getSpeedMs() - 150);
          addNews("⚡ Difficulty increased — candles speed up.");
        }

        // Random events every 18–30s
        if (nowMs - lastEventRef.current > 18000 + Math.random() * 12000) {
          lastEventRef.current = nowMs;
          const e = rollEvent();
          setEvent(e);
          feedRef.current.setBiasBoost(e.bias, e.volMult, e.ttl * 1000);
          sfx.event();
          addNews(`${e.title} — ${e.subtitle ?? ""}`);
          if (e.kind === "FLASH_CRASH") { sfx.crash(); feedRef.current.applyShock(-0.02); setShake(true); setTimeout(() => setShake(false), 500); }
          if (e.kind === "SHORT_SQUEEZE") feedRef.current.applyShock(0.02);
          if (e.kind === "WHALE") feedRef.current.applyShock(e.bias > 0 ? 0.015 : -0.015);
          setTimeout(() => setEvent(null), e.ttl * 1000);
        }

        // Boss every 5 min
        if (nowMs - lastBossRef.current > 5 * 60000) {
          lastBossRef.current = nowMs;
          const b = rollBoss();
          setEvent(b);
          feedRef.current.setBiasBoost(b.bias, b.volMult, b.ttl * 1000);
          sfx.boss();
          addNews(b.title);
          setTimeout(() => setEvent(null), b.ttl * 1000);
        }

        // Random market mode rotation every 45s
        if (Math.random() < 0.0006) {
          const m = MODES[Math.floor(Math.random() * MODES.length)];
          feedRef.current.setMode(m);
          setStats((s) => ({ ...s, mode: m }));
          addNews(`Market regime: ${m}`);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused, resolvePending, setTick, addNews]);

  const predict = useCallback((p: Prediction) => {
    if (stats.gameOver) return;
    sfx.click();
    if (p === "SKIP") {
      setStats((s) => ({ ...s, skips: s.skips + 1 }));
      return;
    }
    const feed = feedRef.current!;
    const entry = feed.peek().close;
    setPending({ dir: p, entry, at: Date.now() });
  }, [stats.gameOver]);

  const reset = useCallback(() => {
    feedRef.current = createSimulatedFeed();
    setStats(initialStats());
    setEvent(null);
    setFloats([]);
    setPending(null);
    setPaused(false);
    startRef.current = Date.now();
    lastEventRef.current = Date.now();
    lastBossRef.current = Date.now();
    lastDiffRef.current = Date.now();
    setNews(["New run — good luck."]);
  }, []);

  const spendCoins = useCallback((n: number) => {
    setStats((s) => ({ ...s, coins: Math.max(0, s.coins - n) }));
  }, []);

  const feed = feedRef.current!;
  return useMemo(() => ({
    feed, stats, event, floats, shake, flash, pending, scanlines, paused, news, tick,
    setScanlines, setPaused, predict, reset, spendCoins,
  }), [feed, stats, event, floats, shake, flash, pending, scanlines, paused, news, tick, predict, reset, spendCoins]);
}

function initialStats(): Stats {
  return {
    hp: 100, maxHp: 100, coins: 50, balance: 1000, profit: 0,
    xp: 0, level: 1, combo: 0, bestCombo: 0,
    wins: 0, losses: 0, skips: 0, accuracy: 0,
    reactionMs: 0, survivalMs: 0, mode: "SIDEWAYS", gameOver: false,
  };
}

function useCandles() {
  const [t, setT] = useState(0);
  return [t, setT] as const;
}