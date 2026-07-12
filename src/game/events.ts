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
  () => ({ id: rid(), kind: "ELON",        title: "🤡 MEMECOIN MANIA",       subtitle: "Doge, Pepe, Wojak…",                   bias: 1.3,  volMult: 2.8, ttl: 5 }),
  () => ({ id: rid(), kind: "CPI",          title: "🛢️ OIL SHOCK",             subtitle: "OPEC surprise cut",                    bias: 1,    volMult: 2.4, ttl: 5 }),
  () => ({ id: rid(), kind: "CPI",          title: "🌐 GEOPOLITICAL RISK",      subtitle: "Risk-off across the board",            bias: -1.2, volMult: 2.6, ttl: 6 }),
  // New events
  () => ({ id: rid(), kind: "MM_TRAP",      title: "🎩 MANIPULATION WEEK",     subtitle: "Market makers playing both sides",     bias: (Math.random()-0.5)*3, volMult: 3.5, ttl: 10 }),
  () => ({ id: rid(), kind: "ELON",         title: "📱 WE'RE WATCHING YOUR MOBILE", subtitle: "Your data sold. Market moved.",    bias: -1.0, volMult: 2.0, ttl: 5 }),
  () => ({ id: rid(), kind: "LIQUIDATION",  title: "🤡 CLOWN CANDLE",          subtitle: "Nobody knows why. Classic crypto.",    bias: (Math.random()-0.5)*4, volMult: 5, ttl: 4 }),
  () => ({ id: rid(), kind: "MM_TRAP",      title: "🔄 FAKEOUT DETECTED",       subtitle: "Stop hunted. Again.",                 bias: -(Math.random()*1.5+0.5), volMult: 2.2, ttl: 5 }),
  () => ({ id: rid(), kind: "CPI",          title: "💤 BORING MARKET",          subtitle: "Everyone’s asleep… or are they?",      bias: 0,    volMult: 0.5, ttl: 8 }),
  () => ({ id: rid(), kind: "WHALE",        title: "🦖 DEAD CAT BOUNCE",        subtitle: "Is this the bottom? (No)",            bias: 0.8,  volMult: 2.0, ttl: 5 }),
  () => ({ id: rid(), kind: "LIQUIDATION",  title: "🏦 BANK RUN FEAR",          subtitle: "Panic withdrawal detected",           bias: -1.8, volMult: 3.0, ttl: 6 }),
  () => ({ id: rid(), kind: "ELON",         title: "🍕 LUNCH BREAK PUMP",       subtitle: "Bored traders buying dips",           bias: 1.0,  volMult: 1.4, ttl: 4 }),
  () => ({ id: rid(), kind: "MM_TRAP",      title: "🧾 WASH TRADING ALERT",     subtitle: "Volume is fake. Prices real.",        bias: (Math.random()-0.5)*2, volMult: 1.8, ttl: 5 }),
  () => ({ id: rid(), kind: "CPI",          title: "🧬 ALGO MALFUNCTION",       subtitle: "Trading bots arguing",               bias: (Math.random()-0.5)*3, volMult: 4.0, ttl: 5 }),
  // ── Funny/absurd events ─────────────────────────────────────────────────
  () => ({ id: rid(), kind: "FLASH_CRASH",  title: "☄️ METEOR INCOMING!",      subtitle: "Everyone is panic-selling and screaming outside!", bias: -2.0, volMult: 4.5, ttl: 6 }),
  () => ({ id: rid(), kind: "FLASH_CRASH",  title: "🌪 TORNADO WARNING",        subtitle: "The chart is spinning. Literally.",       bias: (Math.random()-0.5)*4, volMult: 4.0, ttl: 6 }),
  () => ({ id: rid(), kind: "ELON",         title: "👽 UFO OVER NASDAQ",         subtitle: "Traders looking out the window instead of screens", bias: 1.5, volMult: 3.0, ttl: 5 }),
  () => ({ id: rid(), kind: "MM_TRAP",      title: "🐸 PEPE ARMY CHARGES",       subtitle: "Retail memelords bought everything",       bias: 2.0, volMult: 3.0, ttl: 5 }),
  () => ({ id: rid(), kind: "LIQUIDATION",  title: "🚽 TOILET PAPER SHORTAGE",    subtitle: "Somehow this crashed the market",         bias: -1.2, volMult: 2.5, ttl: 5 }),
  () => ({ id: rid(), kind: "ELON",         title: "🍔 CEO ORDERS BURGER",       subtitle: "Insider signal? Analysts arguing.",       bias: 0.8, volMult: 1.5, ttl: 4 }),
  () => ({ id: rid(), kind: "WHALE",        title: "🎩 SATOSHI WALLET MOVES",    subtitle: "10-year dormant coins just woke up",      bias: -1.5, volMult: 3.0, ttl: 6 }),
  () => ({ id: rid(), kind: "FLASH_CRASH",  title: "🐕 DOGGY-COIN RUG PULL",     subtitle: "Dev walked the dog. And your coins.",     bias: -1.8, volMult: 3.2, ttl: 5 }),
  () => ({ id: rid(), kind: "ELON",         title: "🎤 CELEB DIVORCE RALLY",     subtitle: "Alimony flows into crypto",               bias: 1.3, volMult: 2.0, ttl: 5 }),
  () => ({ id: rid(), kind: "MM_TRAP",      title: "🐛 TRADING BOT BUG",         subtitle: "Buy button became sell button",           bias: (Math.random()-0.5)*3.5, volMult: 3.5, ttl: 4 }),
  () => ({ id: rid(), kind: "SHORT_SQUEEZE",title: "🧻 REDDIT ATTACK",          subtitle: "r/WSB decides today is the day",           bias: 2.2, volMult: 3.5, ttl: 6 }),
  () => ({ id: rid(), kind: "CPI",          title: "🐢 SLOW NEWS DAY",           subtitle: "Nothing happens. It's weird.",             bias: 0, volMult: 0.4, ttl: 8 }),
  () => ({ id: rid(), kind: "ELON",         title: "☕ MONDAY MORNING PUMP",     subtitle: "Everyone's caffeinated and buying",        bias: 1.1, volMult: 1.6, ttl: 5 }),
  () => ({ id: rid(), kind: "LIQUIDATION",  title: "🎃 SPOOKY WICK",             subtitle: "The chart formed a ghost pattern",         bias: -1.0, volMult: 2.8, ttl: 4 }),
  () => ({ id: rid(), kind: "WHALE",        title: "🐳 WHALE FART",              subtitle: "Small movement, big splash",               bias: (Math.random()-0.5)*2, volMult: 2.0, ttl: 4 }),
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
  // Memes
  "😂 I'm trading crypto because I'm broke. I'm broke because I'm trading crypto.",
  "💼 McDonald's is hiring. Your move.",
  "🍕 Sir, this is a Wendy's. But I'll take your order.",
  "🚀 When crypto pumps: I'm a genius. When it dumps: the market is wrong.",
  "📉 Bought the dip. It dipped again. Bought again. Still dipping…",
  "🤔 Just ONE more trade. Just ONE more. Okay one more after this.",
  "📝 Loss = learning opportunity (according to my therapist)",
  "🏁 Zoom out bro. Just zoom out.",
  "🪙 My portfolio is a horror movie and I'm the villain.",
  "👨‍💻 Wife sold house. Bought DOGE at 0.70. Classic.",
  "👹 The market can stay irrational longer than you can stay solvent.",
  "🪀 WAGMI... right? RIGHT?!",
  "🔥 This is fine. Everything is fine. (chart goes vertical)",
  "⚠️ Not financial advice. But if it was, still not responsible.",
  "🤯 Stonks only go up (source: made it up)",
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

// ── Streak narrator lines ─────────────────────────────────────────────────────
export const STREAK_NARRATOR: Record<number, string[]> = {
  3:  ["🔥 You're reading the market perfectly!", "💡 Pattern recognition: UNLOCKED", "🎯 Three in a row! You've got this!"],
  5:  ["💎 Diamond hands AND a diamond mind!", "🚀 Five wins! Are you even human?", "📈 The market bows to you right now!"],
  7:  ["👑 LEGENDARY! The charts fear you!", "⚡ Seven-win streak. Chefs kiss.", "🌟 You're in the ZONE. Don't stop!"],
  10: ["🏆 TEN WINS. Call your mom. She'd be proud.", "🤖 Are you a trading bot? This is illegal.", "🥇 x10 COMBO. Retire already!"],
  15: ["🦍 APE BRAIN ASCENDED. Pure instinct.", "🌍 The market is your puppet right now.", "🎰 At this point you're just cheating."],
};

export function rollNarratorLine(combo: number): string | null {
  const milestones = [15, 10, 7, 5, 3];
  for (const m of milestones) {
    if (combo === m) {
      const lines = STREAK_NARRATOR[m];
      return lines[Math.floor(Math.random() * lines.length)];
    }
  }
  return null;
}

// ── Tilt lines (consecutive losses) ──────────────────────────────────────────
export const TILT_LINES: Record<number, string[]> = {
  3: ["😤 Three losses. Breathe.", "💢 The market is testing you.", "📉 Bad run — stay disciplined."],
  5: ["🔥 PC OVERHEATING. Fan at max.", "😡 FIVE losses. Walk away.", "💀 Tilt detected. Danger zone."],
  7: ["💥 YOUR MONITOR CRACKS. Keep going?", "🩸 Seven losses. The screen bleeds.", "🔨 You just punched the keyboard."],
};
