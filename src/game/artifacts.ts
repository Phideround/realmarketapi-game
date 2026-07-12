export type ArtifactTier = "white" | "green" | "blue" | "purple";

export interface ArtifactDef {
  id: string;
  name: string;
  emoji: string;
  tier: ArtifactTier;
  desc: string;
  requires?: string; // id of a prerequisite artifact (upgrade path)
}

export const ARTIFACTS: ArtifactDef[] = [
  // ── White (Common) ────────────────────────────────────────────────────────
  { id: "w_hp",        tier: "white",  name: "Energy Bar",      emoji: "🍫", desc: "+15 HP per game-level at level start" },
  { id: "w_coins",     tier: "white",  name: "Lucky Penny",     emoji: "🪙", desc: "+15 coins per game-level at level start" },
  { id: "w_coffee",    tier: "white",  name: "Coffee Voucher",  emoji: "☕", desc: "HP loss −40% for the next 3 levels" },
  { id: "w_maxhp",     tier: "white",  name: "Gym Card",        emoji: "💪", desc: "+12 max HP immediately" },
  { id: "w_xp",        tier: "white",  name: "Study Notes",     emoji: "📚", desc: "+20% XP from every win" },
  { id: "w_bandage",   tier: "white",  name: "Bandage Roll",    emoji: "🩹", desc: "Heal +3 HP on every loss (softens blowups)" },
  { id: "w_patience",  tier: "white",  name: "Patience Manual",emoji: "🗒️", desc: "SKIP never costs coins or accuracy" },
  { id: "w_focus",     tier: "white",  name: "Focus Crystal",   emoji: "🔮", desc: "First trade of every level is guaranteed to win" },

  // ── Green (Uncommon) ──────────────────────────────────────────────────────
  { id: "g_streak",        tier: "green", name: "Hot Hand",        emoji: "🔥", desc: "+10% streak multiplier bonus" },
  { id: "g_rr",            tier: "green", name: "R:R Manual",      emoji: "📖", desc: "HP loss reduced by 20% permanently" },
  { id: "g_coffee_addict", tier: "green", name: "Coffee Addict",   emoji: "☕", desc: "+40 coins at the start of every new level" },
  { id: "g_combo_heal",    tier: "green", name: "Flow State",      emoji: "🌊", desc: "Heal +2 HP on every combo hit" },
  { id: "g_coin_bonus",    tier: "green", name: "Piggy Bank",      emoji: "🐷", desc: "+4 bonus coins per win" },
  { id: "g_reversal",      tier: "green", name: "Market Reversal", emoji: "🔄", desc: "After 3 consecutive losses, next win heals +20 HP" },
  { id: "g_insurance",     tier: "green", name: "Trade Insurance", emoji: "🟥", desc: "HP loss blocked 50% when HP is below 25" },
  { id: "g_journal",       tier: "green", name: "Trade Journal",   emoji: "📓", desc: "Accuracy >60% → +20% bonus coins each trade" },

  // ── Blue (Rare) ────────────────────────────────────────────────────────────
  { id: "b_double_coins", tier: "blue", name: "Gold Rush",      emoji: "💰", desc: "+80% coin rewards from all trades" },
  { id: "b_shield",       tier: "blue", name: "Loss Shield",    emoji: "🛡️", desc: "First loss per level does not break streak" },
  { id: "b_oracle",       tier: "blue", name: "Market Oracle",  emoji: "🔮", desc: "+25% streak multiplier bonus" },
  { id: "b_momentum",     tier: "blue", name: "Momentum",       emoji: "⚡", desc: "+4 coins per win plus +1 per combo level" },
  { id: "b_lifesteal",    tier: "blue", name: "Vampire Candle", emoji: "🧛", desc: "Heal +3 HP per win" },
  { id: "b_leverage",     tier: "blue", name: "2× Leverage",    emoji: "📈", desc: "Profit gains ×1.5 but HP loss ×1.3 on loss" },
  { id: "b_time_stop",    tier: "blue", name: "Time Stop",      emoji: "⏸️", desc: "Every 8th trade, take a free SKIP (no HP risk)" },

  // ── Purple (Epic) ──────────────────────────────────────────────────────────
  { id: "p_immortal", tier: "purple", name: "Diamond Heart",   emoji: "💎", desc: "First 4 losses per level deal no HP damage" },
  { id: "p_godmode",  tier: "purple", name: "God Mode",        emoji: "👑", desc: "+40% all profit gains permanently" },
  { id: "p_slow",     tier: "purple", name: "Time Warp",       emoji: "⏳", desc: "Candles 25% slower — easier timing" },
  { id: "p_greed",    tier: "purple", name: "Infinite Greed",  emoji: "∞",  desc: "On loss, streak drops to half instead of zero" },
  { id: "p_phoenix",  tier: "purple", name: "Phoenix Soul",    emoji: "🦅", desc: "Revive once per run with 60 HP when you die" },
  { id: "p_the_algo", tier: "purple", name: "The Algorithm",   emoji: "🤖", desc: "10% chance each trade auto-resolves as a win" },
  { id: "p_compound", tier: "purple", name: "Compound Effect", emoji: "📉", desc: "Every 10th win grants a bonus +100 coins" },

  // ── UPGRADES (require base artifact already owned) ─────────────────────────
  { id: "wu_hp",      tier: "green",  name: "Protein Shake",   emoji: "🥤", desc: "+25 HP per level instead of +15 (upgrades Energy Bar)",      requires: "w_hp" },
  { id: "wu_coffee",  tier: "blue",   name: "Espresso Shot",   emoji: "⚡☕",  desc: "HP loss −60% for 5 levels (upgrades Coffee Voucher)",       requires: "w_coffee" },
  { id: "gu_streak",  tier: "blue",   name: "Legendary Streak",emoji: "🍋", desc: "+20% streak bonus instead of +10% (upgrades Hot Hand)",     requires: "g_streak" },
  { id: "gu_rr",      tier: "blue",   name: "Risk Manager",    emoji: "📊", desc: "HP loss reduced by 35% (upgrades R:R Manual)",              requires: "g_rr" },
  { id: "bu_double",  tier: "purple", name: "Diamond Mine",    emoji: "💰💰", desc: "+150% coins (upgrades Gold Rush)",                          requires: "b_double_coins" },
  { id: "bu_shield2", tier: "purple", name: "Aegis Shield",    emoji: "🛡️⛔", desc: "First 2 losses per level are shielded (upgrades Loss Shield)",requires: "b_shield" },
  { id: "pu_immortal",tier: "purple", name: "Invincibility",   emoji: "💎💎", desc: "First 7 losses per level deal no HP (upgrades Diamond Heart)",requires: "p_immortal" },
  { id: "pu_phoenix", tier: "purple", name: "Eternal Flame",   emoji: "🔥🦅", desc: "Revive TWICE per run with 75 HP (upgrades Phoenix Soul)",    requires: "p_phoenix" },

  // ── More Common ──
  { id: "w_snack",     tier: "white", name: "Trader Snack",    emoji: "🍎", desc: "Heal +2 HP after every trade (win or loss)" },
  { id: "w_penny",     tier: "white", name: "Piggy Coin",      emoji: "🐖", desc: "+2 bonus coins every trade" },
  { id: "w_umbrella",  tier: "white", name: "Rainy Umbrella",  emoji: "☂️", desc: "First 5 losses total this run: HP loss halved" },
  { id: "w_socks",     tier: "white", name: "Fuzzy Socks",     emoji: "🧦", desc: "+1 max HP per win (up to +30)" },
  { id: "w_ledger",    tier: "white", name: "Ledger",          emoji: "📒", desc: "+10% coins on trades after 60% accuracy" },

  // ── More Uncommon ──
  { id: "g_calm",      tier: "green", name: "Zen Bell",        emoji: "🔔", desc: "Every 10s of no trade, heal +3 HP" },
  { id: "g_greed",     tier: "green", name: "Greed Sigil",     emoji: "🤑", desc: "+3 coins per streak stack (uncapped)" },
  { id: "g_hedge",     tier: "green", name: "Micro Hedge",     emoji: "⚖️", desc: "Losses reduce balance by 30% less" },
  { id: "g_moon",      tier: "green", name: "Moon Boots",      emoji: "🌕", desc: "MEME + HIGH_VOL modes give +25% coins" },

  // ── More Rare ──
  { id: "b_bailout",   tier: "blue",  name: "Bailout Voucher", emoji: "🎟", desc: "Once per level: instantly +$1000 balance if broke" },
  { id: "b_iron",      tier: "blue",  name: "Iron Stomach",    emoji: "🍺", desc: "Every 4th loss deals ZERO damage" },
  { id: "b_market_god",tier: "blue",  name: "Chart Whisperer", emoji: "🗣️", desc: "+15% streak bonus and +15% gains" },

  // ── More Epic ──
  { id: "p_infinite",  tier: "purple",name: "Infinity Stack",  emoji: "♾️", desc: "Coins earned x2. Nothing else. Just money." },
  { id: "p_yolo",      tier: "purple",name: "YOLO Charm",      emoji: "🎲", desc: "+80% gains but +30% HP loss. Full send." },
  { id: "p_market_king",tier:"purple",name: "Market King",     emoji: "👑", desc: "Every 5th win, +50 coins bonus" },
  { id: "p_meditation",tier: "purple",name: "Deep Meditation", emoji: "🧘", desc: "HP regens +1 every 5s automatically" },
];

export const TIER_COLORS: Record<ArtifactTier, string> = {
  white:  "#e2e8f0",
  green:  "#4ade80",
  blue:   "#60a5fa",
  purple: "#c084fc",
};

export const TIER_LABELS: Record<ArtifactTier, string> = {
  white:  "COMMON",
  green:  "UNCOMMON",
  blue:   "RARE",
  purple: "EPIC",
};

const TIER_WEIGHTS: Record<ArtifactTier, number> = {
  white:  40,
  green:  28,
  blue:   20,
  purple: 12,
};

/**
 * Pick `count` unique artifacts weighted by tier.
 * At higher game levels, rarer tiers (blue/purple) appear more often.
 * @param owned     - already collected artifact ids (will not be offered again)
 * @param gameLevel - current game level (1 = starter weights, scales up)
 */
export function rollArtifacts(count = 3, owned: string[] = [], gameLevel = 1): ArtifactDef[] {
  const ownedSet = new Set(owned);
  const pool = ARTIFACTS.filter((a) => {
    if (ownedSet.has(a.id)) return false;            // already have it
    if (a.requires && !ownedSet.has(a.requires)) return false; // prereq missing
    return true;
  });
  if (pool.length === 0) return [];

  // Tier weights — gated by level so rare tiers don’t appear too early
  const lv = Math.max(1, gameLevel);
  const tierWeights: Record<ArtifactTier, number> = {
    white:  Math.max(8,  50 - lv * 5),
    green:  Math.max(15, 32 - lv),
    blue:   lv < 2 ? 0 : Math.min(40, (lv - 1) * 6),       // appears lv 2+
    purple: lv < 4 ? 0 : Math.min(35, 3 + (lv - 3) * 6),   // appears lv 4+
  };

  const weightedPick = (avoid: Set<string>): ArtifactDef => {
    const candidates = pool.filter((a) => !avoid.has(a.id));
    if (!candidates.length) return pool[Math.floor(Math.random() * pool.length)];
    const total = candidates.reduce((s, a) => s + tierWeights[a.tier], 0);
    let r = Math.random() * total;
    for (const a of candidates) { r -= tierWeights[a.tier]; if (r <= 0) return a; }
    return candidates[candidates.length - 1];
  };

  const result: ArtifactDef[] = [];
  const used = new Set(owned);
  while (result.length < count && result.length < pool.length) {
    const a = weightedPick(used);
    used.add(a.id);
    result.push(a);
  }
  return result;
}
