import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/game/useGame";
import { CandleChart } from "@/components/game/CandleChart";
import { HUD } from "@/components/game/HUD";
import { ActionBar } from "@/components/game/ActionBar";
import { LeftPanel, RightPanel, type MissionState } from "@/components/game/SidePanels";
import { EventOverlay } from "@/components/game/EventOverlay";
import { Shop, type ShopItem } from "@/components/game/Shop";
import { GameOver } from "@/components/game/GameOver";
import { ArtifactPicker } from "@/components/game/ArtifactPicker";
import { ArtifactGallery } from "@/components/game/ArtifactGallery";
import { HeroPicker } from "@/components/game/HeroPicker";
import { rollArtifacts, type ArtifactDef } from "@/game/artifacts";
import { sfx } from "@/game/sfx";
import { music } from "@/game/music";
import realMarketLogo from "@/assets/realmarketapi-logo.png.asset.json";
import type { Stats } from "@/game/types";
import { Analytics } from "@vercel/analytics/react";

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
  { label: "realmarketapi.com", url: "https://realmarketapi.com/?utm_source=game", icon: "🌐" },
  { label: "X / Twitter", url: "https://x.com/realmarketapi", icon: "𝕏" },
  { label: "Facebook", url: "https://www.facebook.com/realmarketapi", icon: "📘" },
  { label: "Bluesky", url: "https://bsky.app/profile/realmarketapi.bsky.social", icon: "☁️" },
  { label: "Mastodon", url: "https://mastodon.social/@realmarketapi", icon: "🐘" },
  { label: "Threads", url: "https://www.threads.com/@realmarketapi2026", icon: "🧵" },
  { label: "Instagram", url: "https://www.instagram.com/realmarketapi2026/", icon: "📷" },
];

// ── Mission system ────────────────────────────────────────────────────────────
type MissionDef = {
  id: string;
  text: string;
  reward: number;
  target: number;
  getProgress: (s: Stats, gl: number) => number;
};
// Internal state extends MissionState with the getProgress closure.
type LiveMission = MissionState & { getProgress: (s: Stats, gl: number) => number };
const MISSION_POOL: MissionDef[] = [
  { id: "win5", text: "Win 5 trades", reward: 30, target: 5, getProgress: (s) => s.wins },
  { id: "win10", text: "Win 10 trades", reward: 60, target: 10, getProgress: (s) => s.wins },
  { id: "combo5", text: "Reach x5 combo", reward: 50, target: 5, getProgress: (s) => s.bestCombo },
  { id: "combo10", text: "Reach x10 combo", reward: 100, target: 10, getProgress: (s) => s.bestCombo },
  { id: "survive3", text: "Survive 3 min", reward: 80, target: 180, getProgress: (s) => Math.floor(s.survivalMs / 1000) },
  { id: "level2", text: "Reach Game Level 2", reward: 150, target: 2, getProgress: (_, gl) => gl },
  { id: "profit500", text: "Earn $500 profit", reward: 60, target: 500, getProgress: (s) => s.profit },
  { id: "acc70", text: "70% accuracy (10+)", reward: 80, target: 70, getProgress: (s) => s.wins + s.losses >= 10 ? s.accuracy : 0 },
  { id: "nolose", text: "Win 3 in a row", reward: 40, target: 3, getProgress: (s) => s.combo },
  { id: "win25", text: "Win 25 trades", reward: 150, target: 25, getProgress: (s) => s.wins },
  { id: "combo15", text: "Reach x15 combo", reward: 200, target: 15, getProgress: (s) => s.bestCombo },
  { id: "survive5", text: "Survive 5 min", reward: 140, target: 300, getProgress: (s) => Math.floor(s.survivalMs / 1000) },
  { id: "level3", text: "Reach Game Level 3", reward: 250, target: 3, getProgress: (_, gl) => gl },
  { id: "level5", text: "Reach Game Level 5", reward: 500, target: 5, getProgress: (_, gl) => gl },
  { id: "profit2k", text: "Earn $2000 profit", reward: 200, target: 2000, getProgress: (s) => s.profit },
  { id: "profit10k", text: "Earn $10000 profit", reward: 600, target: 10000, getProgress: (s) => s.profit },
  { id: "acc80", text: "80% accuracy (20+)", reward: 200, target: 80, getProgress: (s) => s.wins + s.losses >= 20 ? s.accuracy : 0 },
  { id: "streak7", text: "Win 7 in a row", reward: 120, target: 7, getProgress: (s) => s.combo },
  { id: "streak10", text: "Win 10 in a row", reward: 220, target: 10, getProgress: (s) => s.combo },
  { id: "coin_hoard", text: "Hoard 500 coins", reward: 100, target: 500, getProgress: (s) => s.coins },
  { id: "balance_5k", text: "Balance ≥ $5000", reward: 150, target: 5000, getProgress: (s) => s.balance },
  { id: "balance_20k", text: "Balance ≥ $20000", reward: 500, target: 20000, getProgress: (s) => s.balance },
  { id: "no_hp_loss", text: "Keep HP ≥ 90 after 15 trades", reward: 180, target: 1, getProgress: (s) => (s.wins + s.losses >= 15 && s.hp >= 90) ? 1 : 0 },
];
function generateMissions(): LiveMission[] {
  const shuffled = [...MISSION_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6).map(m => ({ ...m, progress: 0, completed: false }));
}

function Game() {
  const g = useGame();
  const [shopOpen, setShopOpen] = useState(false);
  const [owned, setOwned] = useState<string[]>([]);
  const [musicOn, setMusicOn] = useState(false);
  const [hotkeysOpen, setHotkeysOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // ── Mission state ─────────────────────────────────────────────────────────
  // Init empty so SSR/CSR match; populate after mount to avoid hydration mismatch
  const [missions, setMissions] = useState<LiveMission[]>([]);
  useEffect(() => { setMissions(generateMissions()); }, []);
  const missionAwardedRef = useRef(new Set<string>());

  // ── Game phase + artifact state ────────────────────────────────────────────
  type Phase = "hero_pick" | "artifact_pick" | "playing";
  const [phase, setPhase] = useState<Phase>("hero_pick");
  const [artifactChoices, setArtifactChoices] = useState<ArtifactDef[]>([]);
  const [collectedArtifacts, setCollectedArtifacts] = useState<string[]>([]);
  const [pendingLevelUp, setPendingLevelUp] = useState(false);
  const [confirmNewGame, setConfirmNewGame] = useState(false);

  // Indicator IDs — passed to chart for overlays
  const INDICATOR_IDS = ["ind_ema", "ind_ma", "ind_sr", "ind_vol", "ind_rsi", "ind_macd", "ind_vwap", "ind_atr", "ind_bb", "ind_fib", "ind_smc"];
  const ownedIndicators = owned.filter((id) => INDICATOR_IDS.includes(id));

  // Keep useGame's gear-effect ref in sync
  useEffect(() => { g.setOwnedItems(owned); }, [owned, g]);

  // Mission tracking
  useEffect(() => {
    setMissions(prev => prev.map(m => {
      if (m.completed) return m;
      const progress = m.getProgress(g.stats, g.gameLevel);
      const completed = progress >= m.target;
      if (completed && !missionAwardedRef.current.has(m.id)) {
        missionAwardedRef.current.add(m.id);
        g.addCoins(m.reward);
      }
      return { ...m, progress, completed };
    }));
  }, [g.stats.wins, g.stats.combo, g.stats.bestCombo, g.stats.survivalMs, g.stats.profit, g.stats.accuracy, g.gameLevel]);

  // Watch for level target reached
  useEffect(() => {
    if (g.levelReached && !pendingLevelUp) {
      setPendingLevelUp(true);
      setShopOpen(true);
      sfx.boss();
    }
  }, [g.levelReached, pendingLevelUp]);

  useEffect(() => () => music.stop(), []);

  // Pause the market until a hero is chosen on initial load
  useEffect(() => {
    if (phase === "hero_pick") g.setPaused(true);
  }, [phase, g]);

  const toggleMusic = useCallback(() => {
    if (music.isRunning()) { music.stop(); setMusicOn(false); }
    else { music.start(); setMusicOn(true); }
  }, []);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      // Block trading hotkeys if an overlay is open
      const overlayOpen = shopOpen || hotkeysOpen || confirmNewGame;
      if (!overlayOpen) {
        if (k === "a") g.predict("LONG");
        else if (k === "d") g.predict("SHORT");
        else if (k === "r" || k === "p") g.setPaused((p) => !p);
      }
      if (k === "b") setShopOpen((s) => !s);
      if (k === "c") g.setScanlines((s) => !s);
      if (k === "m") toggleMusic();
      if (k === "h") setHotkeysOpen((s) => !s);
      if (k === "g") setGalleryOpen((s) => !s);
      if (k === "escape") { setShopOpen(false); setHotkeysOpen(false); setConfirmNewGame(false); setGalleryOpen(false); }
      if (k === "n") setConfirmNewGame(true);
      if (k === "q") g.activateSkill();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [g, shopOpen, hotkeysOpen, confirmNewGame, toggleMusic]);

  const doStartNewGame = useCallback(() => {
    g.reset();
    sfx.coin();
    setOwned([]);
    setCollectedArtifacts([]);
    setPendingLevelUp(false);
    setShopOpen(false);
    setArtifactChoices([]);
    setPhase("hero_pick");
    g.setPaused(true);
    setMissions(generateMissions());
    missionAwardedRef.current.clear();
  }, [g]);

  const handleHeroPick = useCallback((id: string) => {
    g.setHeroId(id);
    setPhase("playing");
    g.setPaused(false);
    sfx.coin();
  }, [g]);

  const handleArtifactPick = useCallback((id: string) => {
    setCollectedArtifacts((prev) => [...prev, id]);
    g.addArtifact(id);
    setPhase("playing");
    g.setPaused(false);
    sfx.coin();
  }, [g]);

  const handleShopClose = useCallback(() => {
    setShopOpen(false);
    if (pendingLevelUp) {
      setPendingLevelUp(false);
      g.nextLevel();
      const choices = rollArtifacts(3, collectedArtifacts, g.gameLevel + 1);
      setArtifactChoices(choices);
      setPhase("artifact_pick");
    }
  }, [pendingLevelUp, g, collectedArtifacts]);

  const buy = useCallback((u: ShopItem) => {
    const alreadyOwned = owned.includes(u.id);
    if (g.stats.coins < u.cost) return;
    if (alreadyOwned && !u.repeatable) return;
    if (!u.repeatable) setOwned((o) => [...o, u.id]);
    g.spendCoins(u.cost);
    // Handle special repeatable effects immediately
    if (u.id === "hp_potion") {
      g.applyItemEffect("hp_potion");
    }
    sfx.coin();
  }, [g, owned]);

  return (
    <>
      <Analytics />
      <div className={`h-dvh w-full bg-background text-foreground flex flex-col overflow-hidden ${g.shake ? (g.tiltLevel >= 2 ? "animate-heavy-shake" : "animate-shake") : ""
        } ${g.tiltLevel === 1 ? "tilt-1" : g.tiltLevel === 2 ? "tilt-2" : g.tiltLevel === 3 ? "tilt-3" : ""}`}>
        {/* Screen crack overlay at tilt 3 */}
        {g.tiltLevel >= 3 && (
          <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
            {/* Simulated cracks using thin divs */}
            <div style={{ position: "absolute", top: "10%", left: "25%", width: "2px", height: "40%", background: "rgba(255,60,60,0.3)", transform: "rotate(12deg)", boxShadow: "0 0 6px rgba(255,0,0,0.5)" }} />
            <div style={{ position: "absolute", top: "5%", left: "60%", width: "1px", height: "55%", background: "rgba(255,255,255,0.25)", transform: "rotate(-8deg)" }} />
            <div style={{ position: "absolute", top: "30%", left: "45%", width: "1px", height: "35%", background: "rgba(255,60,60,0.25)", transform: "rotate(20deg)" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(200,0,0,0.25) 100%)" }} />
          </div>
        )}
        <div className={`flex-1 min-h-0 flex flex-col gap-2 px-2 sm:px-3 py-2 overflow-hidden ${g.scanlines ? "crt-overlay" : ""}`}>
          {/* Top bar */}
          <header className="flex items-center gap-3 flex-wrap">
            <div className="font-pixel text-neon-green text-sm sm:text-lg neon-green-glow pixel-panel px-3 py-2">
              PIXEL TRADER
            </div>
            <a
              href="https://realmarketapi.com/?utm_source=game"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-panel flex items-center gap-2 px-2 py-1 hover:neon-blue-glow transition"
              title="Powered by RealMarketAPI"
            >
              <img src={realMarketLogo.url} alt="RealMarketAPI" className="w-7 h-7" style={{ imageRendering: "pixelated" }} />
              <span className="font-pixel text-[9px] text-neon-blue leading-tight">
                powered by<br />RealMarketAPI
              </span>
            </a>
            <div className="overflow-hidden flex-1 min-w-[180px] pixel-panel py-2">
              <div className="whitespace-nowrap animate-marquee font-term text-sm text-neon-yellow">
                {g.news.slice(0, 5).join("   •   ")}
              </div>
            </div>
            <button onClick={() => setConfirmNewGame(true)} className="font-pixel text-[10px] text-neon-green px-3 py-2 pixel-panel neon-green-glow">🆕 NEW GAME</button>
            {g.hero && (
              <button
                onClick={g.activateSkill}
                disabled={Date.now() < g.skillCooldownEnd}
                className="font-pixel text-[10px] px-3 py-2 pixel-panel"
                style={{ color: g.hero.color, borderColor: g.hero.color, opacity: Date.now() < g.skillCooldownEnd ? 0.5 : 1 }}
                title={`${g.hero.skillName} — ${g.hero.skillDesc}`}
              >
                {g.hero.emoji} [Q] {g.hero.skillName}
                {Date.now() < g.skillCooldownEnd && ` (${Math.ceil((g.skillCooldownEnd - Date.now())/1000)}s)`}
              </button>
            )}
            <button onClick={() => setShopOpen(true)} className="font-pixel text-[10px] text-neon-yellow px-3 py-2 pixel-panel neon-yellow-glow">🛒 SHOP 🪙{g.stats.coins}</button>
            <button onClick={() => setGalleryOpen(true)} className="font-pixel text-[10px] text-neon-magenta px-3 py-2 pixel-panel">
              🏛 ARTIFACTS {collectedArtifacts.length > 0 ? `(${collectedArtifacts.length})` : ""}
            </button>
            <button onClick={() => g.setPaused((p) => !p)} className="font-pixel text-[10px] text-neon-blue px-3 py-2 pixel-panel">{g.paused ? "▶ RESUME" : "⏸ PAUSE"}</button>
            <button onClick={toggleMusic} className="font-pixel text-[10px] text-neon-magenta px-3 py-2 pixel-panel">{musicOn ? "🔊 MUSIC" : "🔇 MUSIC"}</button>
            <button onClick={() => g.setScanlines((s) => !s)} className="font-pixel text-[10px] text-muted-foreground px-3 py-2 pixel-panel">
              {g.scanlines ? "CRT ON" : "CRT OFF"}
            </button>
            <button onClick={() => setHotkeysOpen(true)} className="font-pixel text-[10px] text-neon-blue px-3 py-2 pixel-panel">⌨ [H]</button>
          </header>

          <HUD stats={g.stats} gameLevel={g.gameLevel} levelTarget={g.levelTarget} />

          {/* Tilt warning banner */}
          {g.tiltLevel >= 2 && (
            <div className={`pixel-panel px-3 py-2 text-center font-pixel text-[10px] ${g.tiltLevel >= 3 ? "neon-red-glow text-neon-red animate-blink" : "text-neon-yellow"
              }`}>
              {g.tiltLevel >= 3
                ? "💥 SCREEN CRACKING — YOU'RE ON MAXIMUM TILT!"
                : "🔥 PC OVERHEATING — You are tilted. Take a breath."}
            </div>
          )}

          {/* Main grid — takes all remaining height */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[200px_1fr_220px] gap-2 overflow-hidden">
            <div className="hidden lg:block overflow-hidden"><LeftPanel stats={g.stats} owned={owned} missions={missions} /></div>

            <main className="flex flex-col gap-2 min-h-0 overflow-hidden">
              <div className={`relative flex-1 min-h-0 pixel-panel ${g.flash === "red" ? "animate-flash-red" : g.flash === "green" ? "animate-flash-green" : ""
                }`}>
                <CandleChart
                  feed={g.feed}
                  tick={g.tick}
                  entryPrice={g.pending?.entry ?? null}
                  entryDir={g.pending?.dir ?? null}
                  ownedIndicators={ownedIndicators}
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

            <div className="hidden lg:block overflow-hidden"><RightPanel stats={g.stats} event={g.event} news={g.news} /></div>
          </div>

          {/* Bottom hints + compact footer */}
          <div className="shrink-0 flex items-center justify-between gap-2 px-1">
            <div className="font-term text-xs text-muted-foreground">
              <span className="text-neon-green">A</span> LONG · <span className="text-neon-red">D</span> SHORT · <span className="text-muted-foreground">S</span> skip · <span className="text-neon-blue">B</span> shop · <span className="text-neon-blue">R</span> pause · <span className="text-neon-blue">M</span> music · <span className="text-neon-blue">H</span> hotkeys
            </div>
            <a href="https://realmarketapi.com/?utm_source=game" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 pixel-panel px-2 py-1 hover:neon-blue-glow transition shrink-0">
              <img src={realMarketLogo.url} alt="RealMarketAPI" className="w-5 h-5" style={{ imageRendering: "pixelated" }} />
              <span className="font-pixel text-[8px] text-neon-blue">realmarketapi.com</span>
            </a>
          </div>
        </div>

        {shopOpen && <Shop coins={g.stats.coins} owned={owned} onBuy={buy} onClose={handleShopClose} />}
        {galleryOpen && <ArtifactGallery collectedIds={collectedArtifacts} onClose={() => setGalleryOpen(false)} />}
        {g.stats.gameOver && <GameOver stats={g.stats} gameLevel={g.gameLevel} onRestart={doStartNewGame} />}

        {/* Artifact picker overlay */}
        {phase === "artifact_pick" && !g.stats.gameOver && artifactChoices.length > 0 && (
          <ArtifactPicker choices={artifactChoices} onPick={handleArtifactPick} gameLevel={g.gameLevel} collectedIds={collectedArtifacts} />
        )}
        {phase === "hero_pick" && !g.stats.gameOver && (
          <HeroPicker onPick={handleHeroPick} />
        )}

        {/* Hotkey help overlay */}
        {hotkeysOpen && (
          <div className="fixed inset-0 z-[60] bg-black/85 grid place-items-center p-4">
            <div className="pixel-panel p-6 max-w-sm w-full neon-blue-glow">
              <div className="font-pixel text-neon-blue text-sm mb-4">⌨ HOTKEYS</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-term text-xs text-muted-foreground mb-4">
                {[
                  ["A", "LONG"], ["D", "SHORT"], ["S", "skip"], ["R / P", "pause/resume"],
                  ["B", "shop"], ["G", "artifacts"], ["N", "new game"], ["M", "music"],
                  ["C", "CRT toggle"], ["H", "this help"], ["ESC", "close dialog"],
                  ["1/2/3", "pick artifact"],
                ].map(([key, action]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-neon-green font-pixel text-[10px] min-w-[40px]">{key}</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setHotkeysOpen(false)} className="w-full py-2 font-pixel text-[10px] text-neon-blue pixel-panel">CLOSE [H/ESC]</button>
            </div>
          </div>
        )}

        {/* New-game confirmation dialog */}
        {confirmNewGame && (
          <div className="fixed inset-0 z-[60] bg-black/85 grid place-items-center p-4">
            <div className="pixel-panel p-6 max-w-sm w-full text-center neon-yellow-glow">
              <div className="font-pixel text-neon-yellow text-sm mb-3">⚠ START NEW GAME?</div>
              <div className="font-term text-xs text-muted-foreground mb-6">
                All current progress — coins, artifacts, and streak — will be lost.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setConfirmNewGame(false); doStartNewGame(); }}
                  className="flex-1 py-3 font-pixel text-[10px] text-neon-green pixel-panel neon-green-glow"
                >
                  ✓ CONFIRM
                </button>
                <button
                  onClick={() => setConfirmNewGame(false)}
                  className="flex-1 py-3 font-pixel text-[10px] text-neon-red pixel-panel neon-red-glow"
                >
                  ✗ CANCEL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
