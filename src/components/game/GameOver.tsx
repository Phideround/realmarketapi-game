import { fmt } from "@/game/format";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Stats } from "@/game/types";

interface Props {
  stats: Stats;
  gameLevel: number;
  onRestart: () => void;
}

const UTM = "utm_source=game&utm_medium=referral&utm_campaign=game_over";
const REGISTER_URL = `https://realmarketapi.com/register?${UTM}`;
const LEARN_URL = `https://learn.realmarketapi.com/?${UTM}`;
const CALC_URL = `https://calculator.realmarketapi.com/?${UTM}`;

export function GameOver({ stats, gameLevel, onRestart }: Props) {
  const cause = stats.crashCause === "balance"
    ? { title: "💸 BANKRUPT", sub: "You blew up your account. The monitor cracked." }
    : { title: "GAME OVER", sub: "The market rekt you." };
  const text = `I just reached Game Level ${gameLevel} in Pixel Trader with $${fmt(stats.profit)} profit, x${stats.bestCombo} best streak, ${stats.accuracy}% accuracy! 🎮📈 Powered by @realmarketapi`;

  // Game page URL (origin only), resolved on the client to stay SSR-safe.
  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") setPageUrl(`${window.location.origin}/`);
  }, []);

  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);
  const flash = (status: "copied" | "failed") => {
    setShareStatus(status);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setShareStatus("idle"), 2000);
  };

  const handleShare = async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;
    const url = pageUrl || `${window.location.origin}/`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Pixel Trader", text, url });
        return;
      } catch (err) {
        // User dismissed the share sheet: nothing to do.
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Any other failure falls through to the clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      flash("copied");
    } catch {
      flash("failed");
    }
  };

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${pageUrl ? `&url=${encodeURIComponent(pageUrl)}` : ""}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl || "https://realmarketapi.com/")}&quote=${encodeURIComponent(text)}`;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 overflow-y-auto">
      <div className="pixel-panel p-6 max-w-md w-full text-center neon-red-glow my-4">
        <div className="font-pixel text-2xl text-neon-red animate-blink mb-2">{cause.title}</div>
        <div className="font-term text-base text-muted-foreground mb-1">{cause.sub}</div>
        <div className="font-pixel text-[10px] text-neon-yellow mb-5">Reached Game Level {gameLevel}</div>

        <div className="grid grid-cols-2 gap-3 mb-5 text-left">
          <Item label="Profit"     value={`$${fmt(stats.profit)}`}             c="text-neon-green" />
          <Item label="Balance"    value={`$${fmt(stats.balance)}`}            c="text-neon-green" />
          <Item label="Wins"       value={stats.wins}                          c="text-neon-blue" />
          <Item label="Losses"     value={stats.losses}                        c="text-neon-red" />
          <Item label="Best Combo" value={`x${stats.bestCombo}`}               c="text-neon-yellow" />
          <Item label="Accuracy"   value={`${stats.accuracy}%`}               c="text-neon-magenta" />
          <Item label="Survived"   value={`${Math.floor(stats.survivalMs / 1000)}s`} c="text-neon-green" />
          <Item label="Coins"      value={`🪙 ${stats.coins}`}                c="text-neon-yellow" />
        </div>

        {/* Share buttons */}
        <div className="pixel-panel p-3 mb-4">
          <div className="font-pixel text-[9px] text-muted-foreground mb-2 uppercase tracking-wider">📣 Share your run</div>
          <button
            type="button"
            onClick={handleShare}
            aria-live="polite"
            className="w-full mb-2 py-2 font-pixel text-[9px] text-neon-yellow pixel-panel neon-yellow-glow text-center"
          >
            {shareStatus === "copied" ? "✓ COPIED!" : shareStatus === "failed" ? "✗ COPY FAILED" : "🔗 SHARE SCORE"}
          </button>
          <div className="flex gap-2">
            <a href={xUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 font-pixel text-[9px] text-neon-blue pixel-panel neon-blue-glow text-center">
              𝕏 SHARE ON X
            </a>
            <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 font-pixel text-[9px] text-neon-blue pixel-panel neon-blue-glow text-center">
              📘 FACEBOOK
            </a>
          </div>
        </div>

        {/* RealMarketAPI promo */}
        <div className="pixel-panel p-4 mb-4 neon-green-glow text-left">
          <div className="font-pixel text-[10px] text-neon-green mb-2">🚀 BUILD TRADING SYSTEMS LIKE THIS</div>
          <div className="font-term text-xs text-muted-foreground mb-3 leading-relaxed">
            Power your own trading apps with <span className="text-neon-green">real-time market data</span>: forex, gold &amp; crypto prices, candles, indicators and WebSocket feeds.
          </div>
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mb-2 py-2 font-pixel text-[9px] text-neon-green pixel-panel neon-green-glow text-center"
          >
            ▶ GET A FREE API KEY
          </a>
          <div className="flex gap-2">
            <a
              href={LEARN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 font-pixel text-[9px] text-neon-blue pixel-panel neon-blue-glow text-center"
            >
              🎓 Academy
            </a>
            <a
              href={CALC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 font-pixel text-[9px] text-neon-blue pixel-panel neon-blue-glow text-center"
            >
              🧮 Calculators
            </a>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-4 font-pixel neon-green-glow text-neon-green bg-[color-mix(in_oklab,var(--neon-green)_15%,transparent)]"
        >
          ▶ NEW RUN
        </button>
      </div>
    </div>
  );
}

function Item({ label, value, c }: { label: string; value: ReactNode; c: string }) {
  return (
    <div className="pixel-panel p-2">
      <div className="font-pixel text-[9px] text-muted-foreground">{label}</div>
      <div className={`font-pixel text-sm ${c}`}>{value}</div>
    </div>
  );
}