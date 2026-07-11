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
import { music } from "@/game/music";
import realMarketLogo from "@/assets/realmarketapi-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pixel Trader — Retro Trading Roguelike" },
      { name: "description", content: "A pixel-art trading roguelike. Predict candle patterns, dodge whales, survive volatility. Powered by RealMarketAPI." },
    ],
  }),
  component: Game,
});

const SOCIALS: Array<{ label: string; url: string; icon: string }> = [
  { label: "realmarketapi.com", url: "https://realmarketapi.com/", icon: "🌐" },
  { label: "X / Twitter", url: "https://x.com/realmarketapi", icon: "𝕏" },
  { label: "Facebook", url: "https://www.facebook.com/realmarketapi", icon: "📘" },
  { label: "Bluesky", url: "https://bsky.app/profile/realmarketapi.bsky.social", icon: "☁️" },
  { label: "Mastodon", url: "https://mastodon.social/@realmarketapi", icon: "🐘" },
  { label: "Threads", url: "https://www.threads.com/@realmarketapi2026", icon: "🧵" },
  { label: "Instagram", url: "https://www.instagram.com/realmarketapi2026/", icon: "📷" },
];

function Game() {
  const g = useGame();
  const [shopOpen, setShopOpen] = useState(false);
  const [owned, setOwned] = useState<string[]>([]);
  const [musicOn, setMusicOn] = useState(false);

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

  useEffect(() => () => music.stop(), []);

  const toggleMusic = useCallback(() => {
    if (music.isRunning()) { music.stop(); setMusicOn(false); }
    else { music.start(); setMusicOn(true); }
  }, []);

  const startNewGame = useCallback(() => {
    g.reset();
    sfx.coin();
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
          <a
            href="https://realmarketapi.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-panel flex items-center gap-2 px-2 py-1 hover:neon-blue-glow transition"
            title="Powered by RealMarketAPI"
          >
            <img src={realMarketLogo.url} alt="RealMarketAPI" className="w-7 h-7" style={{ imageRendering: "pixelated" }} />
            <span className="font-pixel text-[9px] text-neon-blue leading-tight">
              powered by<br/>RealMarketAPI
            </span>
          </a>
          <div className="overflow-hidden flex-1 min-w-[180px] pixel-panel py-2">
            <div className="whitespace-nowrap animate-marquee font-term text-sm text-neon-yellow">
              {g.news.slice(0, 5).join("   •   ")}
            </div>
          </div>
          <button onClick={startNewGame} className="font-pixel text-[10px] text-neon-green px-3 py-2 pixel-panel neon-green-glow">🆕 NEW GAME</button>
          <button onClick={() => setShopOpen(true)} className="font-pixel text-[10px] text-neon-yellow px-3 py-2 pixel-panel neon-yellow-glow">🛒 SHOP</button>
          <button onClick={() => g.setPaused((p) => !p)} className="font-pixel text-[10px] text-neon-blue px-3 py-2 pixel-panel">{g.paused ? "▶ RESUME" : "⏸ PAUSE"}</button>
          <button onClick={toggleMusic} className="font-pixel text-[10px] text-neon-magenta px-3 py-2 pixel-panel">{musicOn ? "🔊 MUSIC" : "🔇 MUSIC"}</button>
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
              <CandleChart
                feed={g.feed}
                tick={g.tick}
                entryPrice={g.pending?.entry ?? null}
                entryDir={g.pending?.dir ?? null}
              />
              <EventOverlay event={g.event} floats={g.floats} />
              <div className="absolute top-2 left-2 font-pixel text-[10px] text-neon-blue pixel-panel px-2 py-1">
                {g.stats.mode}
              </div>
              <div className="absolute bottom-2 left-2 font-pixel text-[10px] text-neon-yellow pixel-panel px-2 py-1">
                ⏱ {Math.floor(g.stats.survivalMs / 1000)}s
              </div>
            </div>
            <ActionBar onPredict={g.predict} pending={g.pending} disabled={g.stats.gameOver || g.paused} />
          </main>

          <div className="hidden lg:block"><RightPanel stats={g.stats} event={g.event} news={g.news} /></div>
        </div>

        <div className="font-term text-xs text-muted-foreground text-center py-1">
          Press <span className="text-neon-green">A</span>/<span className="text-neon-yellow">S</span>/<span className="text-neon-red">D</span> to trade · <span className="text-neon-blue">B</span> shop · <span className="text-neon-blue">P</span> pause · <span className="text-neon-blue">C</span> CRT
        </div>

        {/* Footer with socials + credits */}
        <footer className="pixel-panel p-4 mt-2 flex flex-col md:flex-row gap-4 items-center justify-between">
          <a href="https://realmarketapi.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <img src={realMarketLogo.url} alt="RealMarketAPI" className="w-12 h-12 group-hover:scale-105 transition" style={{ imageRendering: "pixelated" }} />
            <div>
              <div className="font-pixel text-[11px] text-neon-blue">RealMarketAPI</div>
              <div className="font-term text-xs text-muted-foreground">Real-time market data feeds for builders</div>
            </div>
          </a>
          <div className="flex flex-wrap gap-2 justify-center">
            {SOCIALS.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
                 className="pixel-panel px-2 py-1 flex items-center gap-1 hover:neon-blue-glow font-term text-xs text-neon-blue">
                <span>{s.icon}</span><span className="hidden sm:inline">{s.label}</span>
              </a>
            ))}
          </div>
          <div className="font-term text-xs text-muted-foreground text-center">
            Support: <a href="mailto:support@realmarketapi.com" className="text-neon-green hover:underline">support@realmarketapi.com</a>
          </div>
        </footer>
      </div>

      {shopOpen && <Shop coins={g.stats.coins} owned={owned} onBuy={buy} onClose={() => setShopOpen(false)} />}
      {g.stats.gameOver && <GameOver stats={g.stats} onRestart={g.reset} />}
    </div>
  );
}
