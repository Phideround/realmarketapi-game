import type { GameEvent } from "./types";

const rid = () => Math.random().toString(36).slice(2, 9);

export const EVENT_POOL: Array<() => GameEvent> = [
  () => ({ id: rid(), kind: "WHALE", title: "🐋 WHALE ATTACK", subtitle: "Massive order incoming", bias: Math.random() < 0.5 ? 1 : -1, volMult: 2.2, ttl: 6 }),
  () => ({ id: rid(), kind: "ELON", title: "🐦 ELON TWEET", subtitle: Math.random() < 0.5 ? "to the moon" : "meh", bias: Math.random() < 0.5 ? 1.3 : -1.3, volMult: 1.8, ttl: 5 }),
  () => ({ id: rid(), kind: "CPI", title: "📰 CPI RELEASE", subtitle: "Brace for volatility", bias: (Math.random() - 0.5) * 2, volMult: 3, ttl: 7 }),
  () => ({ id: rid(), kind: "FLASH_CRASH", title: "💥 FLASH CRASH", subtitle: "Everything is red", bias: -1.8, volMult: 3.5, ttl: 5 }),
  () => ({ id: rid(), kind: "SHORT_SQUEEZE", title: "🚀 SHORT SQUEEZE", subtitle: "Bears rekt", bias: 1.8, volMult: 3, ttl: 5 }),
  () => ({ id: rid(), kind: "LIQUIDATION", title: "☠️ LIQUIDATION CASCADE", subtitle: "Chaos mode", bias: Math.random() < 0.5 ? 1.5 : -1.5, volMult: 4, ttl: 6 }),
  () => ({ id: rid(), kind: "MM_TRAP", title: "🎯 MARKET MAKER TRAP", subtitle: "Don't fall for it", bias: 1, volMult: 1.2, ttl: 4 }),
];

export const BOSSES = ["🐋 Whale", "🏦 Hedge Fund", "🎭 Market Maker", "👴 Jerome Powell", "⛏️ Bitcoin Miner"];

export function rollEvent(): GameEvent {
  return EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)]();
}

export function rollBoss(): GameEvent {
  const b = BOSSES[Math.floor(Math.random() * BOSSES.length)];
  return { id: rid(), kind: "BOSS", title: `⚔️ BOSS: ${b}`, subtitle: "Survive the onslaught", bias: (Math.random() - 0.5) * 2, volMult: 2.5, ttl: 20, boss: b };
}