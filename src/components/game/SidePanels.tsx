import { fmt } from "@/game/format";
import type { ReactNode } from "react";
import type { GameEvent, Stats } from "@/game/types";
import type { HeroDef } from "@/game/heroes";

function PanelTitle({ children }: { children: ReactNode }) {
  return <div className="font-pixel text-[10px] text-neon-blue mb-2 uppercase tracking-widest">{children}</div>;
}

const LEADERBOARD = [
  { name: "SATOSHI",   score: 128400 },
  { name: "DEGEN99",   score: 91200 },
  { name: "WHALE_KING",score: 74100 },
  { name: "DIAMOND",   score: 52080 },
  { name: "PAPERHND",  score: 31500 },
];

const CHAR_META: Record<string, { emoji: string; name: string; bonus: string }> = {
  char_scalper:   { emoji: "⚡",  name: "Scalper",      bonus: "+5% gains" },
  char_day:       { emoji: "📅",  name: "Day Trader",  bonus: "+5% profit" },
  char_degen:     { emoji: "🎲",  name: "Degen",       bonus: "Double or nothing" },
  char_swing:     { emoji: "🌊",  name: "Swing",       bonus: "+10% streak" },
  char_crypto_max:{ emoji: "₿",   name: "Crypto Max",  bonus: "+20% MEME" },
  char_ai:        { emoji: "🤖",  name: "AI Trader",  bonus: "Auto-win 1/12" },
  char_quant:     { emoji: "🧠",  name: "Quant",       bonus: "+30% gains" },
  char_fund_mgr:  { emoji: "🏦",  name: "Fund Mgr",   bonus: "Max 5 HP loss" },
};

const PET_META: Record<string, { emoji: string; name: string; bonus: string }> = {
  pet_frog:  { emoji: "🐸", name: "Bull Frog",   bonus: "+6% LONG wins" },
  pet_bear:  { emoji: "🐻", name: "Bear Cub",    bonus: "-6% HP loss" },
  pet_cat:   { emoji: "🐱", name: "Lucky Cat",   bonus: "+10% coins" },
  pet_whale: { emoji: "🐋", name: "Baby Whale",  bonus: "+10% big PnL" },
  pet_robot: { emoji: "🤖", name: "Mini Robot",  bonus: "+3% accuracy" },
  pet_dragon:{ emoji: "🐉", name: "Baby Dragon", bonus: "+25% coins x5" },
  pet_bull:  { emoji: "🐂", name: "Raging Bull", bonus: "+15% gains" },
  pet_shark: { emoji: "🦈", name: "Mkt Shark",   bonus: "+5 HP/win" },
};

export type MissionState = {
  id: string;
  text: string;
  reward: number;
  target: number;
  progress: number;
  completed: boolean;
};

interface LeftPanelProps {
  stats: Stats;
  owned: string[];
  missions: MissionState[];
  onClaimMission?: (id: string) => void;
  hero?: HeroDef | null;
  skillUsesLeft?: number;
}

export function LeftPanel({ stats, owned, missions, onClaimMission, hero, skillUsesLeft }: LeftPanelProps) {
  // Find the highest-tier owned character and pet
  const charKeys = Object.keys(CHAR_META);
  const activeChar = [...charKeys].reverse().find(k => owned.includes(k));
  const petKeys = Object.keys(PET_META);
  const activePet = [...petKeys].reverse().find(k => owned.includes(k));

  const gearOwned = owned.filter(id =>
    ["coffee","mouse","kb","monitor","fiber","term","cat","hands","ai","desk","hedge","quant","dark_pool"].includes(id)
  );

  const GEAR_LABELS: Record<string, string> = {
    coffee: "☕ Coffee", mouse: "🖱️ Mouse", kb: "⌨️ Mech KB", monitor: "🖥️ Monitor",
    fiber: "🛜 Fiber", term: "📈 Terminal", cat: "🐱 Lucky Cat", hands: "💎 Diam. Hands",
    ai: "🤖 AI Assist", desk: "🪑 Trading Desk", hedge: "📉 Hedge Fund",
    quant: "🧠 Quant Model", dark_pool: "🌑 Dark Pool",
  };

  return (
    <aside className="pixel-panel p-3 flex flex-col gap-3 h-full overflow-y-auto min-h-0">
      {/* Hero */}
      {hero && (
        <div>
          <PanelTitle>Your Hero</PanelTitle>
          <div
            className="pixel-panel p-2 flex items-center gap-2"
            style={{ borderColor: hero.color, boxShadow: `0 0 10px ${hero.color}40` }}
          >
            <div className="text-2xl">{hero.emoji}</div>
            <div className="font-term text-[11px] leading-tight">
              <div className="font-pixel text-[10px]" style={{ color: hero.color }}>{hero.name}</div>
              <div className="text-muted-foreground">{hero.passiveDesc}</div>
              <div className="text-neon-yellow font-pixel text-[9px] mt-0.5">
                {hero.skillName} · {skillUsesLeft ?? 0}× left
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Character */}
      <div>
        <PanelTitle>Character</PanelTitle>
        {activeChar ? (
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 pixel-panel grid place-items-center text-2xl">{CHAR_META[activeChar].emoji}</div>
            <div className="font-term text-xs">
              <div className="text-neon-green">{CHAR_META[activeChar].name}</div>
              <div className="text-muted-foreground">{CHAR_META[activeChar].bonus}</div>
              <div className="text-muted-foreground">LVL {stats.level}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 pixel-panel grid place-items-center text-2xl">🧑‍💻</div>
            <div className="font-term text-xs text-muted-foreground">Default Trader<br/>No bonuses<br/>LVL {stats.level}</div>
          </div>
        )}
      </div>

      {/* Pet */}
      <div>
        <PanelTitle>Pet</PanelTitle>
        {activePet ? (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 pixel-panel grid place-items-center text-xl animate-blink">{PET_META[activePet].emoji}</div>
            <div className="font-term text-xs">
              <div className="text-neon-yellow">{PET_META[activePet].name}</div>
              <div className="text-muted-foreground">{PET_META[activePet].bonus}</div>
            </div>
          </div>
        ) : (
          <div className="font-term text-xs text-muted-foreground">No pet equipped.<br/>Buy one in Shop!</div>
        )}
      </div>

      {/* Gear */}
      {gearOwned.length > 0 && (
        <div>
          <PanelTitle>Gear</PanelTitle>
          <ul className="font-term text-[10px] space-y-0.5 text-muted-foreground">
            {gearOwned.slice(0, 5).map(id => (
              <li key={id} className="text-neon-green">{GEAR_LABELS[id] ?? id}</li>
            ))}
            {gearOwned.length > 5 && <li>+{gearOwned.length - 5} more</li>}
          </ul>
        </div>
      )}

      {/* Missions */}
      <div className="mt-auto">
        <PanelTitle>Run Missions</PanelTitle>
        <ul className="space-y-1 font-term text-[10px]">
          {missions.map((m) => {
            const pct = Math.min(100, m.target > 0 ? (m.progress / m.target) * 100 : 0);
            return (
              <li key={m.id} className="border-b border-border/40 pb-1">
                <div className="flex justify-between mb-0.5">
                  <span className={m.completed ? "text-neon-green" : ""}>{m.text}</span>
                  <span className="text-neon-yellow">{m.reward}🪙</span>
                </div>
                <div className="h-1.5 w-full bg-terminal border border-border overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: m.completed ? "var(--neon-green)" : "var(--neon-blue)",
                    }}
                  />
                </div>
                {m.completed && !m.completed && onClaimMission && (
                  <button
                    onClick={() => onClaimMission(m.id)}
                    className="font-pixel text-[8px] text-neon-yellow mt-0.5 pixel-panel px-1"
                  >
                    CLAIM
                  </button>
                )}
                <div className="text-muted-foreground text-[9px]">
                  {m.completed ? "✓ Done" : `${Math.min(m.progress, m.target)}/${m.target}`}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export function RightPanel({ stats, event, news }: { stats: Stats; event: GameEvent | null; news: string[] }) {
  return (
    <aside className="pixel-panel p-3 flex flex-col gap-4 h-full min-h-0 overflow-y-auto">
      <div>
        <PanelTitle>Boss Status</PanelTitle>
        {event?.kind === "BOSS" ? (
          <div className="pixel-panel p-2 neon-red-glow">
            <div className="font-pixel text-[10px] text-neon-red">{event.title}</div>
            <div className="font-term text-xs text-muted-foreground">{event.subtitle}</div>
          </div>
        ) : (
          <div className="font-term text-xs text-muted-foreground">No boss active.</div>
        )}
      </div>
      <div>
        <PanelTitle>Active Buff</PanelTitle>
        {event ? (
          <div className="font-term text-xs text-neon-yellow">{event.title}</div>
        ) : (
          <div className="font-term text-xs text-muted-foreground">None</div>
        )}
      </div>
      <div>
        <PanelTitle>Combo</PanelTitle>
        <div className="font-pixel text-2xl text-neon-yellow">x{stats.combo}</div>
        <div className="font-term text-xs text-muted-foreground">Best x{stats.bestCombo}</div>
      </div>
      <div>
        <PanelTitle>Leaderboard</PanelTitle>
        <ol className="space-y-1 font-term text-xs">
          {LEADERBOARD.map((r, i) => (
            <li key={r.name} className="flex justify-between">
              <span className="text-neon-blue">#{i + 1} {r.name}</span>
              <span className="text-neon-green">${fmt(r.score)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-border/50 pt-1">
            <span className="text-neon-yellow">YOU</span>
            <span className="text-neon-yellow">${fmt(stats.profit)}</span>
          </li>
        </ol>
      </div>
      <div className="mt-auto">
        <PanelTitle>Market News</PanelTitle>
        <ul className="space-y-1 font-term text-xs text-muted-foreground max-h-40 overflow-hidden">
          {news.slice(0, 8).map((n, i) => (
            <li key={i} className={i === 0 ? "text-neon-green" : ""}>&gt; {n}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}