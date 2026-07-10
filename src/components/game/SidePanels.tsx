import type { ReactNode } from "react";
import type { GameEvent, Stats } from "@/game/types";

function PanelTitle({ children }: { children: ReactNode }) {
  return <div className="font-pixel text-[10px] text-neon-blue mb-2 uppercase tracking-widest">{children}</div>;
}

const LEADERBOARD = [
  { name: "SATOSHI", score: 128400 },
  { name: "DEGEN99", score: 91200 },
  { name: "WHALE_KING", score: 74100 },
  { name: "DIAMOND", score: 52080 },
  { name: "PAPERHND", score: 31500 },
];

const MISSIONS = [
  { text: "Win 5 trades", reward: "+30 🪙" },
  { text: "Reach x5 combo", reward: "+50 🪙" },
  { text: "Survive 3 minutes", reward: "+80 🪙" },
  { text: "Beat a boss", reward: "+120 🪙" },
];

export function LeftPanel({ stats }: { stats: Stats }) {
  return (
    <aside className="pixel-panel p-3 flex flex-col gap-4 h-full">
      <div>
        <PanelTitle>Player</PanelTitle>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 pixel-panel grid place-items-center text-2xl">🧑‍💻</div>
          <div className="font-term text-sm">
            <div className="text-neon-green">Day Trader</div>
            <div className="text-muted-foreground">LVL {stats.level}</div>
          </div>
        </div>
      </div>
      <div>
        <PanelTitle>Pet</PanelTitle>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 pixel-panel grid place-items-center text-xl animate-blink">🐸</div>
          <div className="font-term text-xs text-muted-foreground">Bull Frog<br/>+5% coins</div>
        </div>
      </div>
      <div>
        <PanelTitle>Equipped</PanelTitle>
        <ul className="font-term text-xs space-y-1 text-muted-foreground">
          <li>☕ Coffee — <span className="text-neon-green">+reaction</span></li>
          <li>⌨️ Mech KB — <span className="text-neon-green">+combo</span></li>
          <li>🖥️ CRT Monitor — <span className="text-neon-blue">cosmetic</span></li>
        </ul>
      </div>
      <div className="mt-auto">
        <PanelTitle>Daily Missions</PanelTitle>
        <ul className="space-y-1 font-term text-xs">
          {MISSIONS.map((m) => (
            <li key={m.text} className="flex justify-between border-b border-border/40 py-1">
              <span>{m.text}</span>
              <span className="text-neon-yellow">{m.reward}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export function RightPanel({ stats, event, news }: { stats: Stats; event: GameEvent | null; news: string[] }) {
  return (
    <aside className="pixel-panel p-3 flex flex-col gap-4 h-full">
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
              <span className="text-neon-green">${r.score.toLocaleString()}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-border/50 pt-1">
            <span className="text-neon-yellow">YOU</span>
            <span className="text-neon-yellow">${stats.profit.toLocaleString()}</span>
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