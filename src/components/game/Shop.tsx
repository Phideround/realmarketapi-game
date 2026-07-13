import { useState } from "react";

export type ShopItem = {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  desc: string;
  tab?: "gear" | "consumables" | "indicators" | "chars" | "pets" | "cosmetics" | "luxury";
  requires?: string;
  repeatable?: boolean;
};

// Keep "Upgrade" as alias for backwards compat
export type Upgrade = ShopItem;

const GEAR: ShopItem[] = [
  { id: "coffee",    name: "Coffee",            emoji: "☕",  cost: 30,   desc: "Calm nerves. −8% HP loss." },
  { id: "mouse",     name: "Gaming Mouse",       emoji: "🖱️", cost: 60,   desc: "+5% coin gain per trade." },
  { id: "kb",        name: "Mechanical KB",      emoji: "⌨️", cost: 90,   desc: "+1 coin per streak tier." },
  { id: "monitor",   name: "Better Monitor",     emoji: "🖥️", cost: 120,  desc: "Wider chart view." },
  { id: "fiber",     name: "Fiber Internet",     emoji: "🛜", cost: 160,  desc: "+2 bonus coins per win." },
  { id: "term",      name: "Bloomberg Terminal", emoji: "📈", cost: 220,  desc: "Unlocks Indicator shop tab.", requires: "monitor" },
  { id: "cat",       name: "Lucky Cat",          emoji: "🐱", cost: 130,  desc: "+10% coin gain per trade." },
  { id: "hands",     name: "Diamond Hands",      emoji: "💎", cost: 240,  desc: "−25% HP loss on losses." },
  { id: "ai",        name: "AI Assistant",       emoji: "🤖", cost: 300,  desc: "Auto-win every 12th trade.", requires: "term" },
  { id: "desk",      name: "Trading Desk",       emoji: "🪑", cost: 380,  desc: "+20% coin score multiplier." },
  // Funny / cursed items
  { id: "girlfriend",name: "Girlfriend",         emoji: "💃", cost: 350,  desc: "40% chance she calls mid-trade. Why did you buy this?" },
  { id: "luckysocks",name: "Lucky Socks",        emoji: "🧦", cost: 70,   desc: "+2 HP whenever you build a streak of 3+." },
  { id: "therapist", name: "Therapist",          emoji: "🛋️", cost: 180,  desc: "Losses feel less painful. −15% HP loss permanently." },
  { id: "vpn",       name: "Insider VPN",         emoji: "🕵️", cost: 220, desc: "5% chance every trade to be auto-win." },
  { id: "meme_stonk",name: "Meme Stonk Book",     emoji: "📕", cost: 130, desc: "+15% coins in MEME / MEME events." },
  { id: "hedge",     name: "Hedge Fund",         emoji: "📉", cost: 900,  desc: "+50% all coin gains.",      requires: "desk" },
  { id: "quant",     name: "Quant Model",        emoji: "🧠", cost: 750,  desc: "Auto-win every 5th trade.", requires: "ai" },
  { id: "dark_pool", name: "Dark Pool Access",   emoji: "🌑", cost: 1500, desc: "No HP loss for first 10 trades per level.", requires: "hedge" },
  // Extra gear
  { id: "headset",   name: "Noise Headset",       emoji: "🎧", cost: 55,  desc: "Focus. +3% XP per trade." },
  { id: "chair",     name: "Ergonomic Chair",    emoji: "💺", cost: 120,  desc: "+2% all coin gains" },
  { id: "6monitor",  name: "6-Monitor Setup",    emoji: "🖥️", cost: 450,  desc: "+8% coin gains, +8% XP", requires: "monitor" },
  { id: "prime_data",name: "Prime Data Feed",    emoji: "📡", cost: 600,  desc: "+15% coins & +10% XP per trade", requires: "term" },
];

// ── Consumables (one-shot repeatable purchases) ──────────────────────────
const CONSUMABLES: ShopItem[] = [
  { id: "hp_potion",    name: "HP Potion",       emoji: "❤️‍🔥", cost: 40, desc: "Restore +25 HP now.", repeatable: true },
  { id: "pizza",        name: "Pizza Night",     emoji: "🍕",  cost: 45, desc: "Restore +15 HP now.", repeatable: true },
  { id: "energy_drink", name: "Energy Drink",    emoji: "🥤",  cost: 35, desc: "Restore +10 HP + streak +1.", repeatable: true },
  { id: "redbull",      name: "Red Bull",        emoji: "🦋",  cost: 30, desc: "Wings! Restore +12 HP.", repeatable: true },
  { id: "balance_loan", name: "Bank Loan",       emoji: "💵",  cost: 80, desc: "Instantly +$500 balance.", repeatable: true },
  { id: "small_bailout",name: "Small Bailout",   emoji: "🤝",  cost: 150,desc: "Instantly +$1500 balance.", repeatable: true },
  { id: "coffee_shot",  name: "Espresso Shot",   emoji: "☕",  cost: 20, desc: "Restore +8 HP quickly.", repeatable: true },
  { id: "sandwich",     name: "Trader Sandwich", emoji: "🥪",  cost: 25, desc: "Restore +12 HP.", repeatable: true },
  { id: "ramen",        name: "Cup Ramen",       emoji: "🍜",  cost: 15, desc: "Cheap. +6 HP.", repeatable: true },
  { id: "adrenaline",   name: "Adrenaline Shot", emoji: "💉",  cost: 60, desc: "Full stack +30 HP + streak +2.", repeatable: true },
];

const INDICATORS: ShopItem[] = [
  { id: "ind_vol",  name: "VOL",   emoji: "📊", cost: 30,  desc: "Volume bars at bottom of chart" },
  { id: "ind_ma",   name: "MA",    emoji: "📈", cost: 45,  desc: "Simple Moving Average line (20)", requires: "ind_vol" },
  { id: "ind_ema",  name: "EMA",   emoji: "📉", cost: 55,  desc: "Exponential Moving Average (14)",  requires: "ind_ma" },
  { id: "ind_sr",   name: "S/R",   emoji: "⚖️", cost: 65,  desc: "Support & Resistance lines",       requires: "ind_ma" },
  { id: "ind_vwap", name: "VWAP",  emoji: "💧", cost: 90,  desc: "Volume Weighted Avg Price line",   requires: "ind_vol" },
  { id: "ind_rsi",  name: "RSI",   emoji: "🔋", cost: 70,  desc: "RSI overbought/oversold label",    requires: "ind_ema" },
  { id: "ind_macd", name: "MACD",  emoji: "🌊", cost: 85,  desc: "MACD momentum signal",             requires: "ind_ema" },
  { id: "ind_atr",  name: "ATR",   emoji: "📏", cost: 70,  desc: "Avg True Range volatility display", requires: "ind_sr" },
  { id: "ind_bb",   name: "BB",    emoji: "〰",  cost: 150, desc: "Bollinger Bands (20-period)",        requires: "ind_ema" },
  { id: "ind_fib",  name: "Fib",   emoji: "🌀", cost: 200, desc: "Fibonacci retracement levels",      requires: "ind_sr" },
  { id: "ind_smc",  name: "SMC",   emoji: "🧠", cost: 260, desc: "Smart Money: FVG, Order Blocks, Liquidity Sweeps", requires: "ind_sr" },
];

const CHARS: ShopItem[] = [
  { id: "char_scalper",    name: "Scalper",       emoji: "⚡", cost: 100,  desc: "+5% all profit gains" },
  { id: "char_day",        name: "Day Trader",    emoji: "📅", cost: 140,  desc: "+5% profit on every closed trade" },
  { id: "char_degen",      name: "Degen",         emoji: "🎲", cost: 70,   desc: "High risk: double gains ― or double HP loss" },
  { id: "char_swing",      name: "Swing Trader",  emoji: "🌊", cost: 170,  desc: "+10% streak multiplier bonus",    requires: "char_day" },
  { id: "char_crypto_max", name: "Crypto Max",    emoji: "₿",  cost: 200,  desc: "+20% coins in MEME & HIGH_VOL",   requires: "char_scalper" },
  { id: "char_ai",         name: "AI Trader",     emoji: "🤖", cost: 260,  desc: "Auto-wins 1 trade in 15",          requires: "char_swing" },
  { id: "char_quant",      name: "Quantitative",  emoji: "🧠", cost: 450,  desc: "+30% all gains, based on academic models", requires: "char_ai" },
  { id: "char_fund_mgr",   name: "Fund Manager",  emoji: "🏦", cost: 650,  desc: "Never lose more than 5 HP per trade",        requires: "char_quant" },
];

const PETS: ShopItem[] = [
  { id: "pet_frog",   name: "Bull Frog",    emoji: "🐸", cost: 80,   desc: "+6% bonus on LONG wins" },
  { id: "pet_bear",   name: "Bear Cub",     emoji: "🐻", cost: 80,   desc: "−6% HP loss on SHORT losses" },
  { id: "pet_cat",    name: "Lucky Cat",    emoji: "🐱", cost: 130,  desc: "+10% coins (stacks with gear Lucky Cat)" },
  { id: "pet_whale",  name: "Baby Whale",   emoji: "🐋", cost: 170,  desc: "+10% gains on big-PnL trades" },
  { id: "pet_robot",  name: "Mini Robot",   emoji: "🤖", cost: 200,  desc: "+3% accuracy bonus each trade",         requires: "pet_cat" },
  { id: "pet_dragon", name: "Baby Dragon",  emoji: "🐉", cost: 260,  desc: "+25% coins when streak ≥5",             requires: "pet_frog" },
  { id: "pet_bull",   name: "Raging Bull",  emoji: "🐂", cost: 400, desc: "+15% all gains (passive aura)",         requires: "pet_dragon" },
  { id: "pet_shark",  name: "Market Shark", emoji: "🦈", cost: 500, desc: "Heal +5 HP per win (aggressive)",        requires: "pet_whale" },
  { id: "pet_hamster",name: "Trading Hamster", emoji: "🐹", cost: 60, desc: "Random 2% coin bonus per trade. It's just a hamster." },
  { id: "pet_parrot", name: "News Parrot",  emoji: "🦜", cost: 90,   desc: "Repeats headlines. +1 coin per news event." },
];

const COSMETICS: ShopItem[] = [
  { id: "cos_crt",    name: "CRT Monitor",    emoji: "📺", cost: 40,   desc: "Enhanced scanline effect" },
  { id: "cos_neon",   name: "Neon Theme",     emoji: "🌈", cost: 55,   desc: "Vivid neon color overrides" },
  { id: "cos_cyber",  name: "Cyber Theme",    emoji: "💻", cost: 55,   desc: "Cyberpunk blue palette",               requires: "cos_neon" },
  { id: "cos_gold",   name: "Gold Candles",   emoji: "✨", cost: 70,   desc: "Golden candle color scheme" },
  { id: "cos_japan",  name: "Japanese Room",  emoji: "⛩️", cost: 75,   desc: "Sakura-inspired chart aesthetic" },
  { id: "cos_cave",   name: "Crypto Cave",    emoji: "⛏️", cost: 100,  desc: "Underground mining theme",             requires: "cos_gold" },
  { id: "cos_moon",   name: "Moon Base",      emoji: "🌙", cost: 120,  desc: "Lunar station command center",         requires: "cos_japan" },
  { id: "cos_wall_st",name: "Wall Street",    emoji: "🏦", cost: 140,  desc: "Classic trading floor aesthetic" },
  { id: "cos_matrix", name: "Matrix Mode",    emoji: "🟩", cost: 260,  desc: "Green cascading code overlay",         requires: "cos_cyber" },
  { id: "cos_god",    name: "God Trader",     emoji: "🌟", cost: 700,  desc: "Divine golden aura on all elements",   requires: "cos_moon" },
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