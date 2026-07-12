import { fmt } from "@/game/format";
import type { ReactNode } from "react";
import type { Stats } from "@/game/types";

interface Props {
  stats: Stats;
  gameLevel: number;
  onRestart: () => void;
}

export function GameOver({ stats, gameLevel, onRestart }: Props) {
  const cause = stats.crashCause === "balance"
    ? { title: "💸 BANKRUPT", sub: "You blew up your account. The monitor cracked." }
    : { title: "GAME OVER", sub: "The market rekt you." };
  const shareText = encodeURIComponent(
    `I just reached Game Level ${gameLevel} in Pixel Trader with $${fmt(stats.profit)} profit, x${stats.bestCombo} best streak, ${stats.accuracy}% accuracy! 🎮📈 Powered by @realmarketapi`
  );
  const shareUrl = encodeURIComponent("https://realmarketapi.com/");
  const xUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
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
        <div className="pixel-panel p-4 mb-4 neon-blue-glow text-left">
          <div className="font-pixel text-[10px] text-neon-blue mb-2">🚀 BUILD TRADING SYSTEMS LIKE THIS</div>
          <div className="font-term text-xs text-muted-foreground mb-3 leading-relaxed">
            Power your own trading apps with <span className="text-neon-green">real-time market data</span> — candles, indicators, signals, websocket feeds & more.
          </div>
          <div className="flex gap-2">
            <a
              href="https://realmarketapi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 font-pixel text-[9px] text-neon-green pixel-panel neon-green-glow text-center"
            >
              🌐 RealMarketAPI
            </a>
            <a
              href="https://learn.realmarketapi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 font-pixel text-[9px] text-neon-blue pixel-panel neon-blue-glow text-center"
            >
              🎓 Academy
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