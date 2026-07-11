import type { GameEvent } from "./types";

const rid = () => Math.random().toString(36).slice(2, 9);

export const EVENT_POOL: Array<() => GameEvent> = [
  () => ({ id: rid(), kind: "WHALE", title: "🐋 WHALE ATTACK", subtitle: "Massive order incoming", bias: Math.random() < 0.5 ? 1 : -1, volMult: 2.2, ttl: 6 }),
  () => ({ id: rid(), kind: "ELON", title: "🐦 ELON TWEET", subtitle: Math.random() < 0.5 ? "to the moon 🚀" : "meh 💩", bias: Math.random() < 0.5 ? 1.3 : -1.3, volMult: 1.8, ttl: 5 }),
  () => ({ id: rid(), kind: "CPI", title: "📰 CPI RELEASE", subtitle: "Brace for volatility", bias: (Math.random() - 0.5) * 2, volMult: 3, ttl: 7 }),
  () => ({ id: rid(), kind: "FLASH_CRASH", title: "💥 FLASH CRASH", subtitle: "Everything is red", bias: -1.8, volMult: 3.5, ttl: 5 }),
  () => ({ id: rid(), kind: "SHORT_SQUEEZE", title: "🚀 SHORT SQUEEZE", subtitle: "Bears rekt", bias: 1.8, volMult: 3, ttl: 5 }),
  () => ({ id: rid(), kind: "LIQUIDATION", title: "☠️ LIQUIDATION CASCADE", subtitle: "Chaos mode", bias: Math.random() < 0.5 ? 1.5 : -1.5, volMult: 4, ttl: 6 }),
  () => ({ id: rid(), kind: "MM_TRAP", title: "🎯 MARKET MAKER TRAP", subtitle: "Don't fall for it", bias: 1, volMult: 1.2, ttl: 4 }),
  () => ({ id: rid(), kind: "ELON", title: "🐦 CELEBRITY ENDORSEMENT", subtitle: "Retail piles in", bias: 1.4, volMult: 2, ttl: 6 }),
  () => ({ id: rid(), kind: "CPI", title: "🏦 FED RATE DECISION", subtitle: "Powell speaks", bias: (Math.random() - 0.5) * 2.2, volMult: 3.2, ttl: 8 }),
  () => ({ id: rid(), kind: "CPI", title: "📉 GDP MISS", subtitle: "Recession fears", bias: -1.4, volMult: 2.4, ttl: 6 }),
  () => ({ id: rid(), kind: "CPI", title: "📈 JOBS BEAT", subtitle: "Hot labor market", bias: 1.2, volMult: 2.2, ttl: 6 }),
  () => ({ id: rid(), kind: "WHALE", title: "🧾 ETF INFLOWS", subtitle: "Institutions loading up", bias: 1.5, volMult: 1.8, ttl: 7 }),
  () => ({ id: rid(), kind: "WHALE", title: "🧻 ETF OUTFLOWS", subtitle: "Institutions dumping", bias: -1.5, volMult: 1.8, ttl: 7 }),
  () => ({ id: rid(), kind: "LIQUIDATION", title: "⛓️ EXCHANGE HACK", subtitle: "Withdrawals paused", bias: -1.6, volMult: 3.2, ttl: 6 }),
  () => ({ id: rid(), kind: "MM_TRAP", title: "🕳️ STOP HUNT", subtitle: "Wicks incoming", bias: -0.7, volMult: 2.5, ttl: 4 }),
  () => ({ id: rid(), kind: "SHORT_SQUEEZE", title: "🎢 GAMMA SQUEEZE", subtitle: "Dealer hedging spiral", bias: 1.7, volMult: 2.7, ttl: 6 }),
  () => ({ id: rid(), kind: "ELON", title: "🤖 AI HYPE CYCLE", subtitle: "Everything is AI now", bias: 1.5, volMult: 2, ttl: 6 }),
  () => ({ id: rid(), kind: "ELON", title: "🧠 MEMECOIN MANIA", subtitle: "Doge, Pepe, Wojak…", bias: 1.3, volMult: 2.8, ttl: 5 }),
  () => ({ id: rid(), kind: "CPI", title: "🛢️ OIL SHOCK", subtitle: "OPEC surprise cut", bias: 1, volMult: 2.4, ttl: 5 }),
  () => ({ id: rid(), kind: "CPI", title: "🌐 GEOPOLITICAL RISK", subtitle: "Risk-off across the board", bias: -1.2, volMult: 2.6, ttl: 6 }),
];

export const BOSSES = [
  "🇺🇸 Donald Trump",
  "🚀 Elon Musk",
  "📊 Michael Saylor",
  "🏦 Jerome Powell",
  "🐋 The Whale",
  "🎭 Market Maker",
  "⛏️ Bitcoin Miner",
  "💼 BlackRock CEO",
  "🦊 Vitalik",
  "🧠 Warren Buffett",
  "🐂 CZ",
  "🦍 Ape King",
];

const BOSS_LINES: Record<string, string> = {
  "🇺🇸 Donald Trump": "Nobody trades better than me, believe me",
  "🚀 Elon Musk": "Just tweeted. Good luck.",
  "📊 Michael Saylor": "Buying more BTC. Forever.",
  "🏦 Jerome Powell": "Rates going… up? down? yes.",
  "🐋 The Whale": "Splash.",
  "🎭 Market Maker": "You'll never see it coming",
  "⛏️ Bitcoin Miner": "Difficulty adjustment incoming",
  "💼 BlackRock CEO": "Liquidity is a strategy",
  "🦊 Vitalik": "Merge complete. Chaos begins.",
  "🧠 Warren Buffett": "Rule #1: don't lose money",
  "🐂 CZ": "Funds are safu.",
  "🦍 Ape King": "🦍🦍🦍 ONLY UP 🦍🦍🦍",
};

export const NEWS_TICKER = [
  "BTC dominance flips 60%",
  "Retail leverage at record highs",
  "Options market pricing in wild swings",
  "Analyst: 'this is the top' (again)",
  "Meme coin adds three zeros overnight",
  "Insider wallet moved 5,000 BTC",
  "New ETF filing hits the tape",
  "TradFi hedge fund liquidated on-chain",
  "Regulator warns about 'the volatility'",
  "Google trends for 'buy the dip' spikes",
  "Whale wallet awakens after 10 years",
  "Funding rates negative across majors",
  "Open interest at all-time highs",
  "MicroStrategy adds to stack",
];

export function rollEvent(): GameEvent {
  return EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)]();
}

export function rollBoss(): GameEvent {
  const b = BOSSES[Math.floor(Math.random() * BOSSES.length)];
  return {
    id: rid(),
    kind: "BOSS",
    title: `⚔️ BOSS: ${b}`,
    subtitle: BOSS_LINES[b] ?? "Survive the onslaught",
    bias: (Math.random() - 0.5) * 2.2,
    volMult: 3,
    ttl: 22,
    boss: b,
  };
}

export function rollNewsTicker(): string {
  return NEWS_TICKER[Math.floor(Math.random() * NEWS_TICKER.length)];
}
