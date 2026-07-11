import { useEffect } from "react";
import { ARTIFACTS, TIER_COLORS, TIER_LABELS, type ArtifactDef } from "@/game/artifacts";

interface Props {
  choices: ArtifactDef[];
  onPick: (id: string) => void;
  gameLevel: number;
  collectedIds: string[];
}

export function ArtifactPicker({ choices, onPick, gameLevel, collectedIds }: Props) {
  const collected = collectedIds
    .map((id) => ARTIFACTS.find((a) => a.id === id))
    .filter(Boolean) as ArtifactDef[];

  // Keyboard shortcuts: 1/2/3 to select artifact
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < choices.length) onPick(choices[idx].id);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [choices, onPick]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="pixel-panel w-full max-w-3xl p-5 flex flex-col gap-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center">
          <div className="font-pixel text-neon-yellow text-base neon-yellow-glow">
            {gameLevel === 1 ? "CHOOSE YOUR STARTING ARTIFACT" : `LEVEL ${gameLevel} — CHOOSE AN ARTIFACT`}
          </div>
          <div className="font-term text-xs text-muted-foreground mt-1">
            Pick 1 of 3 — press <span className="text-neon-green">1</span> / <span className="text-neon-green">2</span> / <span className="text-neon-green">3</span> or click
          </div>
        </div>

        {/* Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {choices.map((a, idx) => {
            const color = TIER_COLORS[a.tier];
            return (
              <button
                key={a.id}
                onClick={() => onPick(a.id)}
                className="pixel-panel p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform text-center cursor-pointer relative"
                style={{ borderColor: color, boxShadow: `0 0 16px ${color}30` }}
              >
                <div className="absolute top-2 right-2 font-pixel text-[9px] text-muted-foreground">[{idx + 1}]</div>
                <div className="text-4xl">{a.emoji}</div>
                <div className="font-pixel text-[8px] uppercase tracking-widest" style={{ color }}>
                  {TIER_LABELS[a.tier]}
                  {a.requires && <span className="ml-1 text-neon-yellow">↑UPGRADE</span>}
                </div>
                <div className="font-pixel text-[11px] text-foreground leading-tight">{a.name}</div>
                <div className="font-term text-xs text-muted-foreground leading-snug min-h-[36px]">{a.desc}</div>
                <div className="font-pixel text-[9px] px-2 py-1 pixel-panel mt-1" style={{ color, borderColor: color }}>SELECT [{idx + 1}]</div>
              </button>
            );
          })}
        </div>

        {/* Collected artifacts */}
        {collected.length > 0 && (
          <div className="border-t border-border pt-3">
            <div className="font-pixel text-[9px] text-muted-foreground mb-2 uppercase tracking-widest">Your artifacts this run</div>
            <div className="flex flex-wrap gap-2">
              {collected.map((a) => {
                const color = TIER_COLORS[a.tier];
                return (
                  <div
                    key={a.id}
                    className="pixel-panel px-2 py-1 flex items-center gap-1"
                    style={{ borderColor: color }}
                    title={a.desc}
                  >
                    <span className="text-base">{a.emoji}</span>
                    <div>
                      <div className="font-pixel text-[8px]" style={{ color }}>{a.name}</div>
                      <div className="font-term text-[9px] text-muted-foreground max-w-[120px] truncate">{a.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
