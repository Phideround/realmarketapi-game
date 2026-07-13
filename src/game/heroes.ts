export type HeroSkillId = "sleep" | "prophet" | "heal" | "double_coins" | "rewind" | "shield" | "print_money" | "diamond_hands";

export interface HeroDef {
  id: string;
  name: string;
  emoji: string;
  color: string;
  tagline: string;
  passiveDesc: string;
  skillName: string;
  skillDesc: string;
  skillId: HeroSkillId;
  /** Total uses of the active skill per run (replaces cooldown). */
  uses: number;
  // passive multipliers/mods applied automatically in game math
  passive: {
    coinMult?: number;      // multiplies coin gains
    gainMult?: number;      // multiplies profit gains
    hpLossMult?: number;    // multiplies HP loss on loss
    startCoins?: number;    // bonus starting coins
    startHp?: number;       // bonus starting HP / maxHp
    lossMult?: number;      // multiplies balance loss on losing trade
    riskPct?: number;       // custom risk % of balance per trade (default 0.08)
    xpMult?: number;
  };
}

export const HEROES: HeroDef[] = [
  {
    id: "zen",
    name: "Zen Master",
    emoji: "🧘",
    color: "#7dd3fc",
    tagline: "Calm mind, calm chart.",
    passiveDesc: "−15% HP loss. +10% coins.",
    skillName: "😴 SLEEP",
    skillDesc: "Pause the chart 5s, heal +20 HP. Great for a market timeout.",
    skillId: "sleep",
    uses: 5,
    passive: { hpLossMult: 0.85, coinMult: 1.10 },
  },
  {
    id: "prophet",
    name: "The Prophet",
    emoji: "🔮",
    color: "#c084fc",
    tagline: "I see the next candle.",
    passiveDesc: "+5% XP. +5% accuracy bonus coins.",
    skillName: "✨ VISION",
    skillDesc: "Your NEXT trade is guaranteed to win.",
    skillId: "prophet",
    uses: 4,
    passive: { xpMult: 1.05, coinMult: 1.05 },
  },
  {
    id: "diamond",
    name: "Diamond Hands",
    emoji: "💎",
    color: "#60a5fa",
    tagline: "Never sell. Never fold.",
    passiveDesc: "+30 max HP. −25% HP loss.",
    skillName: "❤️ FULL HEAL",
    skillDesc: "Restore HP to full instantly.",
    skillId: "heal",
    uses: 3,
    passive: { hpLossMult: 0.75, startHp: 30 },
  },
  {
    id: "whale",
    name: "The Whale",
    emoji: "🐋",
    color: "#4ade80",
    tagline: "The market moves for me.",
    passiveDesc: "+25% coin gains. Start with +100 coins.",
    skillName: "💰 DOUBLE UP",
    skillDesc: "Next 3 wins pay DOUBLE coins.",
    skillId: "double_coins",
    uses: 4,
    passive: { coinMult: 1.25, startCoins: 100 },
  },
  {
    id: "hacker",
    name: "The Hacker",
    emoji: "👨‍💻",
    color: "#22d3ee",
    tagline: "sudo rm -rf market",
    passiveDesc: "+15% gains. Smaller risk per trade.",
    skillName: "🔄 REBOOT",
    skillDesc: "Wipe the chart — regenerate a fresh pattern.",
    skillId: "rewind",
    uses: 3,
    passive: { gainMult: 1.15, riskPct: 0.05 },
  },
  {
    id: "degen",
    name: "The Degen",
    emoji: "🎰",
    color: "#f472b6",
    tagline: "YOLO. Wagmi. Or ngmi.",
    passiveDesc: "+60% gains. +50% risk per trade. Chaos build.",
    skillName: "🚀 MONEY PRINTER",
    skillDesc: "+300 coins right now. Force next trade auto-win.",
    skillId: "print_money",
    uses: 3,
    passive: { gainMult: 1.60, riskPct: 0.12, coinMult: 1.10 },
  },
  {
    id: "titan",
    name: "Wall St. Titan",
    emoji: "🏦",
    color: "#fbbf24",
    tagline: "Rules? I write them.",
    passiveDesc: "−40% balance loss. +200 starting coins.",
    skillName: "🛡 BAILOUT",
    skillDesc: "Immune to next 3 losses (HP + balance).",
    skillId: "shield",
    uses: 4,
    passive: { lossMult: 0.60, startCoins: 200 },
  },
  {
    id: "ape",
    name: "Ape King",
    emoji: "🦍",
    color: "#fb923c",
    tagline: "🦍🦍🦍 STONKS 🦍🦍🦍",
    passiveDesc: "+20% coins, +10% gains, +15 max HP.",
    skillName: "💪 DIAMOND SMASH",
    skillDesc: "Full HP + gain a temporary shield for 3 losses.",
    skillId: "diamond_hands",
    uses: 3,
    passive: { coinMult: 1.20, gainMult: 1.10, startHp: 15 },
  },
];

export function heroById(id: string | null | undefined): HeroDef | null {
  return HEROES.find((h) => h.id === id) ?? null;
}
