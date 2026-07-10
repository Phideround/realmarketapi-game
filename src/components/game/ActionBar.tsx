import type { Prediction } from "@/game/types";

type Props = {
  onPredict: (p: Prediction) => void;
  pending: { dir: "LONG" | "SHORT"; entry: number } | null;
  disabled?: boolean;
};

const base = "flex-1 py-6 sm:py-7 font-pixel text-sm sm:text-lg uppercase tracking-widest select-none active:translate-y-1 transition-transform";

export function ActionBar({ onPredict, pending, disabled }: Props) {
  return (
    <div className="w-full pixel-panel p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between font-pixel text-[10px] text-muted-foreground">
        <span>PREDICT NEXT CANDLE</span>
        <span className="text-neon-yellow">
          {pending ? `PENDING: ${pending.dir} @ ${pending.entry.toFixed(2)}` : "READY"}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          disabled={disabled}
          onClick={() => onPredict("LONG")}
          className={`${base} neon-green-glow bg-[color-mix(in_oklab,var(--neon-green)_18%,transparent)] text-neon-green disabled:opacity-40`}
        >
          🟢 LONG
        </button>
        <button
          disabled={disabled}
          onClick={() => onPredict("SKIP")}
          className={`${base} neon-yellow-glow bg-[color-mix(in_oklab,var(--neon-yellow)_15%,transparent)] text-neon-yellow disabled:opacity-40`}
        >
          ⚪ SKIP
        </button>
        <button
          disabled={disabled}
          onClick={() => onPredict("SHORT")}
          className={`${base} neon-red-glow bg-[color-mix(in_oklab,var(--neon-red)_18%,transparent)] text-neon-red disabled:opacity-40`}
        >
          🔴 SHORT
        </button>
      </div>
      <div className="font-term text-[13px] text-muted-foreground text-center">
        Hotkeys: <span className="text-neon-green">A</span> / <span className="text-neon-yellow">S</span> / <span className="text-neon-red">D</span>
      </div>
    </div>
  );
}