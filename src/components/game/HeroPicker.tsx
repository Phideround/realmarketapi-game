import { useEffect } from "react";
import { HEROES } from "@/game/heroes";

interface Props {
  onPick: (id: string) => void;
}

export function HeroPicker({ onPick }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < HEROES.length) onPick(HEROES[idx].id);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPick]);

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 overflow-y-auto p-4 flex items-start sm:items-center justify-center">
      <div className="pixel-panel w-full max-w-5xl p-5 my-4 flex flex-col gap-4">
        <div className="text-center">
          <div className="font-pixel text-neon-yellow text-base neon-yellow-glow">CHOOSE YOUR TRADER</div>
          <div className="font-term text-xs text-muted-foreground mt-1">
            Each hero has a unique passive and an active skill (press <span className="text-neon-green">Q</span> in-game).
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HEROES.map((h, idx) => (
            <button
              key={h.id}
              onClick={() => onPick(h.id)}
              className="pixel-panel p-4 flex flex-col gap-2 items-center text-center hover:scale-105 transition-transform relative"
              style={{ borderColor: h.color, boxShadow: `0 0 16px ${h.color}30` }}
            >
              <div className="absolute top-2 right-2 font-pixel text-[9px] text-muted-foreground">[{idx + 1}]</div>
              <div className="text-4xl">{h.emoji}</div>
              <div className="font-pixel text-[11px]" style={{ color: h.color }}>{h.name}</div>
              <div className="font-term text-[10px] text-muted-foreground italic">"{h.tagline}"</div>
              <div className="font-term text-xs text-foreground leading-snug min-h-[36px]">{h.passiveDesc}</div>
              <div className="pixel-panel px-2 py-1 w-full" style={{ borderColor: h.color }}>
                <div className="font-pixel text-[9px]" style={{ color: h.color }}>{h.skillName}</div>
                <div className="font-term text-[10px] text-muted-foreground leading-snug">{h.skillDesc}</div>
                <div className="font-pixel text-[8px] text-neon-yellow mt-1">CD: {Math.round(h.cooldownMs / 1000)}s</div>
              </div>
              <div className="font-pixel text-[9px] px-2 py-1 pixel-panel" style={{ color: h.color, borderColor: h.color }}>PICK [{idx + 1}]</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
