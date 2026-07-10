import { fmt } from "@/game/format";
import type { ReactNode } from "react";
import type { Stats } from "@/game/types";

function Stat({ label, value, color = "text-neon-green" }: { label: string; value: ReactNode; color?: string }) {
  return (
    <div className="flex flex-col items-start gap-1 px-3 py-2 pixel-panel min-w-[92px]">
      <span className="font-pixel text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={`font-pixel text-xs sm:text-sm ${color}`}>{value}</span>
    </div>
  );
}

export function HUD({ stats }: { stats: Stats }) {
  const hpPct = (stats.hp / stats.maxHp) * 100;
  const nextLvlXp = stats.level * stats.level * 25;
  const prevLvlXp = (stats.level - 1) * (stats.level - 1) * 25;
  const xpPct = ((stats.xp - prevLvlXp) / Math.max(1, nextLvlXp - prevLvlXp)) * 100;
  return (
    <div className="w-full pixel-panel p-3 flex flex-wrap gap-2 items-stretch">
      <div className="flex flex-col gap-1 flex-1 min-w-[220px] px-3 py-2 pixel-panel">
        <div className="flex justify-between font-pixel text-[10px]">
          <span className="text-neon-red">HP</span>
          <span className="text-neon-red">{stats.hp}/{stats.maxHp}</span>
        </div>
        <div className="h-3 w-full bg-terminal border-2 border-border overflow-hidden">
          <div className="h-full bg-[var(--neon-red)] transition-all" style={{ width: `${hpPct}%`, boxShadow: "0 0 12px var(--neon-red)" }} />
        </div>
        <div className="flex justify-between font-pixel text-[10px] mt-1">
          <span className="text-neon-blue">LVL {stats.level}</span>
          <span className="text-neon-blue">XP {stats.xp}</span>
        </div>
        <div className="h-2 w-full bg-terminal border-2 border-border overflow-hidden">
          <div className="h-full bg-[var(--neon-blue)] transition-all" style={{ width: `${xpPct}%`, boxShadow: "0 0 10px var(--neon-blue)" }} />
        </div>
      </div>
      <Stat label="Coins" value={`🪙 ${stats.coins}`} color="text-neon-yellow" />
      <Stat label="Balance" value={`$${fmt(stats.balance)}`} />
      <Stat label="Profit" value={`$${fmt(stats.profit)}`} color={stats.profit >= 0 ? "text-neon-green" : "text-neon-red"} />
      <Stat label="Combo" value={`x${stats.combo}`} color="text-neon-yellow" />
      <Stat label="Best" value={`x${stats.bestCombo}`} color="text-neon-magenta" />
      <Stat label="Acc" value={`${stats.accuracy}%`} color="text-neon-blue" />
      <Stat label="Mode" value={stats.mode} color="text-neon-magenta" />
    </div>
  );
}