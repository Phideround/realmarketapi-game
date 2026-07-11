import { ARTIFACTS, TIER_COLORS, TIER_LABELS, type ArtifactTier } from "@/game/artifacts";

interface Props {
  collectedIds: string[];
  onClose: () => void;
}

const TIER_ORDER: ArtifactTier[] = ["purple", "blue", "green", "white"];

export function ArtifactGallery({ collectedIds, onClose }: Props) {
  const collectedSet = new Set(collectedIds);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 grid place-items-center p-3 overflow-y-auto">
      <div className="pixel-panel w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b-2 border-border shrink-0">
          <div className="font-pixel text-neon-yellow text-sm">🏛 ARTIFACT CODEX</div>
          <div className="font-term text-xs text-muted-foreground">
            {collectedIds.length}/{ARTIFACTS.length} collected
          </div>
          <button
            onClick={onClose}
            className="font-pixel text-neon-red text-xs px-3 py-1 pixel-panel hover:neon-red-glow"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Collected section */}
        {collectedIds.length > 0 && (
          <div className="p-3 border-b border-border/50 shrink-0">
            <div className="font-pixel text-[9px] text-neon-green mb-2 uppercase tracking-widest">
              ✓ Your Run Artifacts ({collectedIds.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {collectedIds.map((id) => {
                const a = ARTIFACTS.find((x) => x.id === id);
                if (!a) return null;
                const color = TIER_COLORS[a.tier];
                return (
                  <div
                    key={id}
                    className="pixel-panel px-2 py-1 flex items-center gap-1.5"
                    style={{ borderColor: color, boxShadow: `0 0 8px ${color}40` }}
                    title={a.desc}
                  >
                    <span className="text-lg">{a.emoji}</span>
                    <div>
                      <div className="font-pixel text-[8px]" style={{ color }}>{a.name}</div>
                      <div className="font-term text-[9px] text-muted-foreground max-w-[100px] truncate">{a.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full codex — grouped by tier */}
        <div className="overflow-y-auto p-3 flex flex-col gap-4">
          {TIER_ORDER.map((tier) => {
            const tierArtifacts = ARTIFACTS.filter((a) => a.tier === tier);
            const color = TIER_COLORS[tier];
            return (
              <div key={tier}>
                <div
                  className="font-pixel text-[9px] uppercase tracking-widest mb-2 flex items-center gap-2"
                  style={{ color }}
                >
                  <span style={{ display: "inline-block", width: 8, height: 8, background: color, borderRadius: 1 }} />
                  {TIER_LABELS[tier]} ({tierArtifacts.filter((a) => collectedSet.has(a.id)).length}/{tierArtifacts.length})
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {tierArtifacts.map((a) => {
                    const owned = collectedSet.has(a.id);
                    const upgradeBase = a.requires ? ARTIFACTS.find((x) => x.id === a.requires) : null;
                    return (
                      <div
                        key={a.id}
                        className={`pixel-panel p-2 flex flex-col gap-1 transition-all ${
                          owned ? "" : "opacity-35"
                        }`}
                        style={owned ? { borderColor: color, boxShadow: `0 0 10px ${color}30` } : {}}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">{a.emoji}</span>
                          {owned && (
                            <span className="font-pixel text-[8px] text-neon-green ml-auto">✓</span>
                          )}
                        </div>
                        <div className="font-pixel text-[9px] leading-tight" style={{ color: owned ? color : undefined }}>
                          {a.name}
                        </div>
                        {upgradeBase && (
                          <div className="font-pixel text-[7px] text-neon-yellow">↑ Upgrades {upgradeBase.name}</div>
                        )}
                        <div className="font-term text-[10px] text-muted-foreground leading-snug">
                          {a.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
