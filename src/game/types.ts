export type Candle = {
  t: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type MarketMode =
  | "BULL"
  | "BEAR"
  | "SIDEWAYS"
  | "HIGH_VOL"
  | "MEME"
  | "BLACK_SWAN";

export type Prediction = "LONG" | "SHORT" | "SKIP";

export type GameEvent = {
  id: string;
  kind:
    | "WHALE"
    | "ELON"
    | "CPI"
    | "FLASH_CRASH"
    | "SHORT_SQUEEZE"
    | "LIQUIDATION"
    | "MM_TRAP"
    | "BOSS";
  title: string;
  subtitle?: string;
  bias: number; // -1..+1 pressure applied to next candles
  volMult: number; // multiplier on volatility
  ttl: number; // seconds remaining
  boss?: string;
};

export type FloatingText = {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  createdAt: number;
};

export type Stats = {
  hp: number;
  maxHp: number;
  coins: number;
  balance: number;
  profit: number;
  xp: number;
  level: number;
  combo: number;
  bestCombo: number;
  wins: number;
  losses: number;
  skips: number;
  accuracy: number;
  reactionMs: number;
  survivalMs: number;
  mode: MarketMode;
  gameOver: boolean;
  levelCoinsEarned: number;
  crashCause?: "hp" | "balance" | null;
};