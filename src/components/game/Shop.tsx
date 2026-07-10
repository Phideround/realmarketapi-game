import { useState } from "react";

type Upgrade = { id: string; name: string; emoji: string; cost: number; desc: string };

const UPGRADES: Upgrade[] = [
  { id: "coffee", name: "Coffee", emoji: "☕", cost: 100, desc: "Faster reactions" },
  { id: "mouse", name: "Gaming Mouse", emoji: "🖱️", cost: 200, desc: "Faster execution" },
  { id: "monitor", name: "Better Monitor", emoji: "🖥️", cost: 350, desc: "Wider chart view" },
  { id: "term", name: "Bloomberg Terminal", emoji: "📈", cost: 600, desc: "Unlock indicators" },
  { id: "ai", name: "AI Assistant", emoji: "🤖", cost: 900, desc: "Prediction hints" },
  { id: "cat", name: "Lucky Cat", emoji: "🐱", cost: 400, desc: "+10% coins" },
  { id: "hands", name: "Diamond Hands", emoji: "💎", cost: 750, desc: "-25% HP loss" },
  { id: "kb", name: "Mechanical KB", emoji: "⌨️", cost: 300, desc: "Combo bonus" },
  { id: "fiber", name: "Fiber Internet", emoji: "🛜", cost: 500, desc: "Lower latency" },
  { id: "desk", name: "Trading Desk", emoji: "🪑", cost: 1200, desc: "Score multiplier" },
];

export function Shop({ coins, onBuy, owned, onClose }: { coins: number; owned: string[]; onBuy: (u: Upgrade) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"shop" | "indicators" | "chars" | "pets" | "cosmetics">("shop");
  return (
    <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center p-4">
      <div className="pixel-panel w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 border-b-2 border-border">
          <div className="font-pixel text-neon-green text-sm">🛒 PIXEL SHOP</div>
          <div className="font-pixel text-neon-yellow text-xs">🪙 {coins}</div>
          <button onClick={onClose} className="font-pixel text-neon-red text-xs px-3 py-1 pixel-panel">X</button>
        </div>
        <div className="flex gap-1 p-2 border-b-2 border-border overflow-x-auto">
          {(["shop", "indicators", "chars", "pets", "cosmetics"] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)}
              className={`font-pixel text-[10px] px-3 py-2 uppercase ${tab === k ? "neon-green-glow text-neon-green" : "text-muted-foreground"}`}>
              {k}
            </button>
          ))}
        </div>
        <div className="p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {tab === "shop" && UPGRADES.map((u) => {
            const has = owned.includes(u.id);
            return (
              <button key={u.id} disabled={has || coins < u.cost} onClick={() => onBuy(u)}
                className="pixel-panel p-3 text-left disabled:opacity-40 hover:neon-green-glow transition">
                <div className="text-2xl">{u.emoji}</div>
                <div className="font-pixel text-[10px] text-neon-green mt-2">{u.name}</div>
                <div className="font-term text-xs text-muted-foreground min-h-8">{u.desc}</div>
                <div className="font-pixel text-[10px] text-neon-yellow mt-2">{has ? "OWNED" : `🪙 ${u.cost}`}</div>
              </button>
            );
          })}
          {tab === "indicators" && ["EMA","RSI","MACD","VWAP","VOL","ATR","S/R","MA"].map((n) => (
            <div key={n} className="pixel-panel p-3">
              <div className="font-pixel text-[10px] text-neon-blue">{n}</div>
              <div className="font-term text-xs text-muted-foreground">Locked</div>
            </div>
          ))}
          {tab === "chars" && ["Scalper","Swing Trader","Day Trader","Degen","AI Trader","Crypto Max"].map((n) => (
            <div key={n} className="pixel-panel p-3"><div className="text-2xl">🧑‍💼</div><div className="font-pixel text-[10px] text-neon-green mt-2">{n}</div></div>
          ))}
          {tab === "pets" && ["🐸 Bull Frog","🐻 Bear Cub","🐋 Baby Whale","🐱 Lucky Cat","🤖 Mini Robot","🐉 Baby Dragon"].map((n) => (
            <div key={n} className="pixel-panel p-3 text-center"><div className="text-3xl">{n.split(" ")[0]}</div><div className="font-pixel text-[10px] text-neon-yellow mt-2">{n.split(" ").slice(1).join(" ")}</div></div>
          ))}
          {tab === "cosmetics" && ["CRT Monitor","Neon Theme","Cyber Theme","Golden Candles","Rainbow","Japanese Room","Crypto Cave","Moon Base","Wall Street"].map((n) => (
            <div key={n} className="pixel-panel p-3"><div className="font-pixel text-[10px] text-neon-magenta">{n}</div><div className="font-term text-xs text-muted-foreground">Cosmetic</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { Upgrade };