import type { Stats } from "@/game/types";

export function GameOver({ stats, onRestart }: { stats: Stats; onRestart: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
      <div className="pixel-panel p-6 max-w-md w-full text-center neon-red-glow">
        <div className="font-pixel text-2xl text-neon-red animate-blink mb-4">GAME OVER</div>
        <div className="font-term text-lg text-muted-foreground mb-6">The market rekt you.</div>
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <Item label="Profit" value={`$${stats.profit.toLocaleString()}`} c="text-neon-green" />
          <Item label="Balance" value={`$${stats.balance.toLocaleString()}`} c="text-neon-green" />
          <Item label="Wins" value={stats.wins} c="text-neon-blue" />
          <Item label="Losses" value={stats.losses} c="text-neon-red" />
          <Item label="Best Combo" value={`x${stats.bestCombo}`} c="text-neon-yellow" />
          <Item label="Accuracy" value={`${stats.accuracy}%`} c="text-neon-magenta" />
          <Item label="Survived" value={`${Math.floor(stats.survivalMs / 1000)}s`} c="text-neon-green" />
          <Item label="Coins" value={`🪙 ${stats.coins}`} c="text-neon-yellow" />
        </div>
        <button onClick={onRestart} className="w-full py-4 font-pixel neon-green-glow text-neon-green bg-[color-mix(in_oklab,var(--neon-green)_15%,transparent)]">
          ▶ NEW RUN
        </button>
      </div>
    </div>
  );
}

function Item({ label, value, c }: { label: string; value: React.ReactNode; c: string }) {
  return (
    <div className="pixel-panel p-2">
      <div className="font-pixel text-[9px] text-muted-foreground">{label}</div>
      <div className={`font-pixel text-sm ${c}`}>{value}</div>
    </div>
  );
}