import type { FloatingText, GameEvent } from "@/game/types";

export function EventOverlay({ event, floats }: { event: GameEvent | null; floats: FloatingText[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {event && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pixel-panel px-5 py-3 neon-yellow-glow animate-shake">
          <div className="font-pixel text-sm text-neon-yellow">{event.title}</div>
          {event.subtitle && <div className="font-term text-sm text-muted-foreground text-center mt-1">{event.subtitle}</div>}
        </div>
      )}
      {floats.map((f) => (
        <div
          key={f.id}
          className="absolute font-pixel text-lg animate-float-up"
          style={{ left: `${f.x}%`, top: `${f.y}%`, color: f.color, textShadow: `0 0 8px ${f.color}` }}
        >
          {f.text}
        </div>
      ))}
    </div>
  );
}