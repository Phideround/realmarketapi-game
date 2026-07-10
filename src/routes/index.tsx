import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useGame } from "@/game/useGame";
import { CandleChart } from "@/components/game/CandleChart";
import { HUD } from "@/components/game/HUD";
import { ActionBar } from "@/components/game/ActionBar";
import { LeftPanel, RightPanel } from "@/components/game/SidePanels";
import { EventOverlay } from "@/components/game/EventOverlay";
import { Shop, type Upgrade } from "@/components/game/Shop";
import { GameOver } from "@/components/game/GameOver";
import { sfx } from "@/game/sfx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pixel Trader — Retro Trading Roguelike" },
      { name: "description", content: "A pixel-art trading roguelike. Predict candles, dodge whales, survive volatility." },
    ],
  }),
  component: Game,
});

function Game() {
  const g = useGame();
  const [shopOpen, setShopOpen] = useState(false);
  const [owned, setOwned] = useState<string[]>([]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === "a") g.predict("LONG");
      else if (k === "d") g.predict("SHORT");
      else if (k === "s") g.predict("SKIP");
      else if (k === "p") g.setPaused((p) => !p);
      else if (k === "b") setShopOpen((s) => !s);
      else if (k === "c") g.setScanlines((s) => !s);
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [g]);

  const buy = useCallback((u: Upgrade) => {
    if (g.stats.coins < u.cost || owned.includes(u.id)) return;
    setOwned((o) => [...o, u.id]);
    g.spendCoins(u.cost);
    sfx.coin();
  }, [g, owned]);

  return (
    <div className={`min-h-screen w-full bg-background text-foreground p-2 sm:p-4 ${g.shake ? "animate-shake" : ""}`}>
      <div className={`max-w-[1600px] mx-auto flex flex-col gap-3 ${g.scanlines ? "crt-overlay" : ""}`}>
        {/* Top bar */}
        <header className="flex items-center gap-3 flex-wrap">
          <div className="font-pixel text-neon-green text-sm sm:text-lg neon-green-glow pixel-panel px-3 py-2">
            PIXEL TRADER
          </div>
          <div className="overflow-hidden flex-1 pixel-panel py-2">
            <div className="whitespace-nowrap animate-marquee font-term text-sm text-neon-yellow">
              {g.news.slice(0, 5).join("   •   ")}
            </div>
          </div>
          <button onClick={() => setShopOpen(true)} className="font-pixel text-[10px] text-neon-yellow px-3 py-2 pixel-panel neon-yellow-glow">🛒 SHOP</button>
          <button onClick={() => g.setPaused((p) => !p)} className="font-pixel text-[10px] text-neon-blue px-3 py-2 pixel-panel">{g.paused ? "▶ RESUME" : "⏸ PAUSE"}</button>
          <button onClick={() => g.setScanlines((s) => !s)} className="font-pixel text-[10px] text-muted-foreground px-3 py-2 pixel-panel">
            {g.scanlines ? "CRT ON" : "CRT OFF"}
          </button>
        </header>

        <HUD stats={g.stats} />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] gap-3">
          <div className="hidden lg:block"><LeftPanel stats={g.stats} /></div>

          <main className="flex flex-col gap-3">
            <div className={`relative pixel-panel h-[380px] sm:h-[460px] ${g.flash === "red" ? "animate-flash-red" : ""} ${g.flash === "green" ? "animate-flash-green" : ""}`}>
              <CandleChart feed={g.feed} tick={g.tick} />
              <EventOverlay event={g.event} floats={g.floats} />
              <div className="absolute top-2 left-2 font-pixel text-[10px] text-neon-blue pixel-panel px-2 py-1">
                {g.stats.mode}
              </div>
              <div className="absolute top-2 right-2 font-pixel text-[10px] text-neon-yellow pixel-panel px-2 py-1">
                ⏱ {Math.floor(g.stats.survivalMs / 1000)}s
              </div>
            </div>
            <ActionBar onPredict={g.predict} pending={g.pending} disabled={g.stats.gameOver || g.paused} />
          </main>

          <div className="hidden lg:block"><RightPanel stats={g.stats} event={g.event} news={g.news} /></div>
        </div>

        <footer className="font-term text-xs text-muted-foreground text-center py-2">
          Press <span className="text-neon-green">A</span>/<span className="text-neon-yellow">S</span>/<span className="text-neon-red">D</span> to trade · <span className="text-neon-blue">B</span> shop · <span className="text-neon-blue">P</span> pause · <span className="text-neon-blue">C</span> CRT
        </footer>
      </div>

      {shopOpen && <Shop coins={g.stats.coins} owned={owned} onBuy={buy} onClose={() => setShopOpen(false)} />}
      {g.stats.gameOver && <GameOver stats={g.stats} onRestart={g.reset} />}
    </div>
  );
}
