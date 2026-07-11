import { useState } from "react";

export type ShopItem = {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  desc: string;
  tab?: "gear" | "indicators" | "chars" | "pets" | "cosmetics";
  requires?: string;
  repeatable?: boolean;
};

// Keep "Upgrade" as alias for backwards compat
export type Upgrade = ShopItem;

const GEAR: ShopItem[] = [
  { id: "coffee",    name: "Coffee",            emoji: "☕",  cost: 80,   desc: "Calm nerves. −8% HP loss." },
  { id: "mouse",     name: "Gaming Mouse",       emoji: "🖱️", cost: 180,  desc: "+5% coin gain per trade." },
  { id: "kb",        name: "Mechanical KB",      emoji: "⌨️", cost: 280,  desc: "+1 coin per streak tier." },
  { id: "monitor",   name: "Better Monitor",     emoji: "🖥️", cost: 350,  desc: "Wider chart view." },
  { id: "fiber",     name: "Fiber Internet",     emoji: "🛜", cost: 480,  desc: "+2 bonus coins per win." },
  { id: "term",      name: "Bloomberg Terminal", emoji: "📈", cost: 600,  desc: "Unlocks Indicator shop tab.", requires: "monitor" },
  { id: "cat",       name: "Lucky Cat",          emoji: "🐱", cost: 380,  desc: "+10% coin gain per trade." },
  { id: "hands",     name: "Diamond Hands",      emoji: "💎", cost: 700,  desc: "−25% HP loss on losses." },
  { id: "ai",        name: "AI Assistant",       emoji: "🤖", cost: 850,  desc: "Auto-win every 12th trade.", requires: "term" },
  { id: "desk",      name: "Trading Desk",       emoji: "🪑", cost: 1100, desc: "+20% coin score multiplier." },
  // Funny / cursed items
  { id: "girlfriend",name: "Girlfriend",         emoji: "💃", cost: 999,  desc: "She needs attention. 40% chance she calls mid-trade. Makes game harder. Why did you buy this?" },
  { id: "redbull",   name: "Red Bull",           emoji: "🦋", cost: 120,  desc: "Wings! −10% HP loss for next 5 trades.", repeatable: true },
  { id: "luckysocks",name: "Lucky Socks",        emoji: "🧦", cost: 200,  desc: "+2 HP whenever you build a streak of 3+." },
  { id: "therapist", name: "Therapist",          emoji: "🛋️", cost: 500,  desc: "Losses feel less painful. −15% HP loss permanently." },
  // Late-game items
  { id: "hp_potion", name: "HP Potion",          emoji: "❤️‍🔥", cost: 150, desc: "Restore +25 HP now.", repeatable: true },
  { id: "hedge",     name: "Hedge Fund",         emoji: "📉", cost: 3000, desc: "+50% all coin gains.",      requires: "desk" },
  { id: "quant",     name: "Quant Model",        emoji: "🧠", cost: 2500, desc: "Auto-win every 5th trade.", requires: "ai" },
  { id: "dark_pool", name: "Dark Pool Access",   emoji: "🌑", cost: 5000, desc: "No HP loss for first 10 trades per level.", requires: "hedge" },
];

const INDICATORS: ShopItem[] = [
  { id: "ind_vol",  name: "VOL",   emoji: "📊", cost: 80,  desc: "Volume bars at bottom of chart" },
  { id: "ind_ma",   name: "MA",    emoji: "📈", cost: 120, desc: "Simple Moving Average line (20)", requires: "ind_vol" },
  { id: "ind_ema",  name: "EMA",   emoji: "📉", cost: 150, desc: "Exponential Moving Average (14)",  requires: "ind_ma" },
  { id: "ind_sr",   name: "S/R",   emoji: "⚖️", cost: 180, desc: "Support & Resistance lines",       requires: "ind_ma" },
  { id: "ind_vwap", name: "VWAP",  emoji: "💧", cost: 280, desc: "Volume Weighted Avg Price line",   requires: "ind_vol" },
  { id: "ind_rsi",  name: "RSI",   emoji: "🔋", cost: 200, desc: "RSI overbought/oversold label",    requires: "ind_ema" },
  { id: "ind_macd", name: "MACD",  emoji: "🌊", cost: 250, desc: "MACD momentum signal",             requires: "ind_ema" },
  { id: "ind_atr",  name: "ATR",   emoji: "📏", cost: 200, desc: "Avg True Range volatility display", requires: "ind_sr" },
  // Late
  { id: "ind_bb",   name: "BB",    emoji: "〰",  cost: 450, desc: "Bollinger Bands (20-period)",        requires: "ind_ema" },
  { id: "ind_fib",  name: "Fib",   emoji: "🌀", cost: 600, desc: "Fibonacci retracement levels",      requires: "ind_sr" },
  { id: "ind_smc",  name: "SMC",   emoji: "🧠", cost: 800, desc: "Smart Money: FVG, Order Blocks, Liquidity Sweeps", requires: "ind_sr" },
];

const CHARS: ShopItem[] = [
  { id: "char_scalper",    name: "Scalper",       emoji: "⚡", cost: 300,  desc: "+5% all profit gains" },
  { id: "char_day",        name: "Day Trader",    emoji: "📅", cost: 400,  desc: "+5% profit on every closed trade" },
  { id: "char_degen",      name: "Degen",         emoji: "🎲", cost: 200,  desc: "High risk: double gains ― or double HP loss" },
  { id: "char_swing",      name: "Swing Trader",  emoji: "🌊", cost: 500,  desc: "+10% streak multiplier bonus",    requires: "char_day" },
  { id: "char_crypto_max", name: "Crypto Max",    emoji: "₿",  cost: 600,  desc: "+20% coins in MEME & HIGH_VOL",   requires: "char_scalper" },
  { id: "char_ai",         name: "AI Trader",     emoji: "🤖", cost: 800,  desc: "Auto-wins 1 trade in 15",          requires: "char_swing" },
  // Late
  { id: "char_quant",      name: "Quantitative",  emoji: "🧠", cost: 1500, desc: "+30% all gains, based on academic models", requires: "char_ai" },
  { id: "char_fund_mgr",   name: "Fund Manager",  emoji: "🏦", cost: 2000, desc: "Never lose more than 5 HP per trade",        requires: "char_quant" },
];

const PETS: ShopItem[] = [
  { id: "pet_frog",   name: "Bull Frog",    emoji: "🐸", cost: 250,  desc: "+6% bonus on LONG wins" },
  { id: "pet_bear",   name: "Bear Cub",     emoji: "🐻", cost: 250,  desc: "−6% HP loss on SHORT losses" },
  { id: "pet_cat",    name: "Lucky Cat",    emoji: "🐱", cost: 380,  desc: "+10% coins (stacks with gear Lucky Cat)" },
  { id: "pet_whale",  name: "Baby Whale",   emoji: "🐋", cost: 500,  desc: "+10% gains on big-PnL trades" },
  { id: "pet_robot",  name: "Mini Robot",   emoji: "🤖", cost: 600,  desc: "+3% accuracy bonus each trade",         requires: "pet_cat" },
  { id: "pet_dragon", name: "Baby Dragon",  emoji: "🐉", cost: 800,  desc: "+25% coins when streak ≥5",             requires: "pet_frog" },
  // Late
  { id: "pet_bull",   name: "Raging Bull",  emoji: "🐂", cost: 1200, desc: "+15% all gains (passive aura)",         requires: "pet_dragon" },
  { id: "pet_shark",  name: "Market Shark", emoji: "🦈", cost: 1500, desc: "Heal +5 HP per win (aggressive)",        requires: "pet_whale" },
];

const COSMETICS: ShopItem[] = [
  { id: "cos_crt",    name: "CRT Monitor",    emoji: "📺", cost: 100,  desc: "Enhanced scanline effect" },
  { id: "cos_neon",   name: "Neon Theme",     emoji: "🌈", cost: 150,  desc: "Vivid neon color overrides" },
  { id: "cos_cyber",  name: "Cyber Theme",    emoji: "💻", cost: 150,  desc: "Cyberpunk blue palette",               requires: "cos_neon" },
  { id: "cos_gold",   name: "Gold Candles",   emoji: "✨", cost: 200,  desc: "Golden candle color scheme" },
  { id: "cos_japan",  name: "Japanese Room",  emoji: "⛩️", cost: 220,  desc: "Sakura-inspired chart aesthetic" },
  { id: "cos_cave",   name: "Crypto Cave",    emoji: "⛏️", cost: 300,  desc: "Underground mining theme",             requires: "cos_gold" },
  { id: "cos_moon",   name: "Moon Base",      emoji: "🌙", cost: 350,  desc: "Lunar station command center",         requires: "cos_japan" },
  { id: "cos_wall_st",name: "Wall Street",    emoji: "🏦", cost: 400,  desc: "Classic trading floor aesthetic" },
  // Late
  { id: "cos_matrix", name: "Matrix Mode",    emoji: "🟩", cost: 800,  desc: "Green cascading code overlay",         requires: "cos_cyber" },
  { id: "cos_god",    name: "God Trader",     emoji: "🌟", cost: 2000, desc: "Divine golden aura on all elements",   requires: "cos_moon" },
];

type Tab = "gear" | "indicators" | "chars" | "pets" | "cosmetics";

function ItemCard({ item, owned, coins, onBuy }: { item: ShopItem; owned: string[]; coins: number; onBuy: (i: ShopItem) => void }) {
  const has = owned.includes(item.id) && !item.repeatable;
  const isLocked = !!item.requires && !owned.includes(item.requires);
  const canAfford = coins >= item.cost;
  const reqItem = item.requires ? [...GEAR, ...INDICATORS, ...CHARS, ...PETS, ...COSMETICS].find(i => i.id === item.requires) : null;
  return (
    <button
      disabled={has || isLocked || !canAfford}
      onClick={() => onBuy(item)}
      className={`pixel-panel p-3 text-left flex flex-col gap-1 transition w-full ${
        isLocked ? "opacity-30 cursor-not-allowed" : "hover:neon-green-glow disabled:opacity-40"
      }`}
    >
      <div className="text-2xl">{item.emoji}</div>
      <div className="font-pixel text-[10px] text-neon-green mt-1">{item.name}</div>
      <div className="font-term text-xs text-muted-foreground min-h-[32px] leading-snug">{item.desc}</div>
      {isLocked && reqItem && (
        <div className="font-pixel text-[8px] text-neon-red mt-1">🔐 Requires: {reqItem.name}</div>
      )}
      <div className="font-pixel text-[10px] text-neon-yellow mt-1">
        {has ? "✓ OWNED" : isLocked ? "🔐 LOCKED" : canAfford ? `🪙 ${item.cost}` : `🔒 ${item.cost}`}
      </div>
    </button>
  );
}

export function Shop({ coins, onBuy, owned, onClose }: { coins: number; owned: string[]; onBuy: (u: ShopItem) => void; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("gear");

  const tabItems: Record<Tab, ShopItem[]> = {
    gear: GEAR,
    indicators: INDICATORS,
    chars: CHARS,
    pets: PETS,
    cosmetics: COSMETICS,
  };

  const TAB_LABELS: Record<Tab, string> = {
    gear: "⚙ GEAR",
    indicators: "📉 INDICATORS",
    chars: "🧑 CHARS",
    pets: "🐾 PETS",
    cosmetics: "🎨 COSMETICS",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 grid place-items-center p-4">
      <div className="pixel-panel w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b-2 border-border shrink-0">
          <div className="font-pixel text-neon-green text-sm">🛒 PIXEL SHOP</div>
          <div className="font-pixel text-neon-yellow text-xs">🪙 {coins}</div>
          <button onClick={onClose} className="font-pixel text-neon-red text-xs px-3 py-1 pixel-panel hover:neon-red-glow">✕ CLOSE</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b-2 border-border overflow-x-auto shrink-0">
          {(Object.keys(tabItems) as Tab[]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`font-pixel text-[9px] sm:text-[10px] px-2 sm:px-3 py-2 uppercase whitespace-nowrap ${
                tab === k ? "neon-green-glow text-neon-green pixel-panel" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {TAB_LABELS[k]}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {tabItems[tab].map((item) => (
            <ItemCard key={item.id} item={item} owned={owned} coins={coins} onBuy={onBuy} />
          ))}
        </div>
      </div>
    </div>
  );
}