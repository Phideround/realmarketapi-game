import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSimulatedFeed, type MarketFeed } from "./market";
import type { Candle, FloatingText, GameEvent, MarketMode, Prediction, Stats } from "./types";
import { rollBoss, rollEvent, rollNewsTicker, rollNarratorLine, TILT_LINES } from "./events";
import { sfx } from "./sfx";
import { heroById, type HeroDef, type HeroSkillId } from "./heroes";

const MODES: MarketMode[] = ["BULL", "BEAR", "SIDEWAYS", "HIGH_VOL", "MEME", "BLACK_SWAN"];
const INITIAL_CANDLES = 40;
const BASE_TARGET = 120; // coins needed at game-level 1; scales exponentially
// levelTarget = BASE_TARGET * level * (1 + (level-1)*0.3)

type Pending = { dir: Exclude<Prediction, "SKIP">; entry: number; at: number } | null;

const xpToLevel = (xp: number) => Math.floor(1 + Math.sqrt(xp / 25));

function makeFeed() {
  const f = createSimulatedFeed();
  f.prime(INITIAL_CANDLES);
  return f;
}

export function useGame() {
  const feedRef = useRef<MarketFeed | null>(null);
  if (!feedRef.current) feedRef.current = makeFeed();

  const [tick, setTick] = useState(0);
  const [stats, setStats] = useState<Stats>(() => initialStats());
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<"red" | "green" | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [scanlines, setScanlines] = useState(true);
  const [paused, setPaused] = useState(false);
  const [news, setNews] = useState<string[]>(["Welcome to Pixel Trader — predict the next candle."]);
  const [tiltLevel, setTiltLevel] = useState(0); // 0=ok, 1=warm, 2=hot, 3=on fire

  // ── Level / Artifact state ──────────────────────────────────────────────────
  const [gameLevel, setGameLevel] = useState(1);
  const [levelReached, setLevelReached] = useState(false);
  const [activeArtifacts, setActiveArtifacts] = useState<string[]>([]);
  const artifactsRef = useRef<string[]>([]);
  const gameLevelRef = useRef(1);

  // Per-run artifact effect counters (refs = no re-render needed)
  const shieldUsedRef = useRef(0);          // b_shield / bu_shield2: remaining free blocks
  const immortalRemainingRef = useRef(0);
  const freeCoffeeLevelsRef = useRef(0);
  const phoenixUsedRef = useRef(0);          // p_phoenix: 0 = unused, pu_phoenix can be 2
  const consecutiveLossesRef = useRef(0);   // g_reversal tracking
  const reversalReadyRef = useRef(false);   // g_reversal: next win heals
  const totalTradesRef = useRef(0);         // b_time_stop, p_compound tracking
  const compoundWinsRef = useRef(0);        // p_compound: wins this block of 10
  const firstTradeRef = useRef(true);       // w_focus: first trade guaranteed win
  const nextTradeWinRef = useRef(false);    // hero skill "prophet" & "print_money": force next trade win
  const doubleCoinsRef = useRef(0);         // hero skill "double_coins": remaining double-coin wins
  const totalLossesRef = useRef(0);         // for w_umbrella (first 5 losses total halved)
  const iron4Ref = useRef(0);               // for b_iron (every 4th loss = 0 dmg)
  const bailoutUsedThisLevelRef = useRef(false); // for b_bailout
  const lastTradeAtRef = useRef(Date.now()); // for g_calm regen
  const hpLossMultRef = useRef(1.0);        // difficulty scaler
  const eventIntervalBaseRef = useRef(16000);

  // Hero
  const [heroId, setHeroIdState] = useState<string | null>(null);
  const heroRef = useRef<HeroDef | null>(null);
  const [skillCooldownEnd, setSkillCooldownEnd] = useState(0);
  const setHeroId = useCallback((id: string | null) => {
    heroRef.current = heroById(id);
    setHeroIdState(id);
    // Apply starting bonuses
    const h = heroRef.current;
    if (!h) return;
    setStats((s) => ({
      ...s,
      coins: s.coins + (h.passive.startCoins ?? 0),
      maxHp: s.maxHp + (h.passive.startHp ?? 0),
      hp: s.hp + (h.passive.startHp ?? 0),
    }));
  }, []);

  // TP/SL intra-candle check
  const pendingRef = useRef<Pending>(null);
  const tpSlTriggeredRef = useRef(false);
  const pendingEnterCandleRef = useRef<number>(-1); // candle `t` when trade was entered

  // Gear items from the shop — updated from index.tsx
  const ownedItemsRef = useRef<string[]>([]);
  const setOwnedItems = useCallback((items: string[]) => {
    ownedItemsRef.current = items;
  }, []);

  const startRef = useRef(Date.now());
  const lastEventRef = useRef(Date.now());
  const lastBossRef = useRef(Date.now());
  const lastDiffRef = useRef(Date.now());
  const lastTickerRef = useRef(Date.now());
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const trackedTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, ms);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  useEffect(() => () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current.clear();
  }, []);

  // Keep pendingRef in sync for intra-candle TP/SL check
  useEffect(() => { pendingRef.current = pending; }, [pending]);

  const pushFloat = useCallback((text: string, color: string) => {
    const f: FloatingText = {
      id: Math.random().toString(36).slice(2),
      text, color,
      x: 50 + Math.random() * 20 - 10,
      y: 40 + Math.random() * 20 - 10,
      createdAt: Date.now(),
    };
    setFloats((prev) => [...prev.slice(-12), f]);
    trackedTimeout(() => setFloats((prev) => prev.filter((x) => x.id !== f.id)), 1050);
  }, [trackedTimeout]);

  const addNews = useCallback((msg: string) => {
    setNews((n) => [msg, ...n].slice(0, 20));
  }, []);

  const resolvePending = useCallback((closed: Candle) => {
    setPending((p) => {
      if (!p) return null;
      const delta = closed.close - p.entry;
      const win = (p.dir === "LONG" && delta > 0) || (p.dir === "SHORT" && delta < 0);
      setStats((s) => {
        const arts = artifactsRef.current;
        const gear = ownedItemsRef.current;
        const hero = heroRef.current;
        const hPas = hero?.passive ?? {};
        const pnl = Math.abs(delta / p.entry) * 1000 * (1 + s.combo * 0.05);
        // Fixed-risk position sizing so balance actually moves
        const riskPct = hPas.riskPct ?? 0.08;
        const positionRisk = Math.max(20, Math.round(Math.max(50, s.balance) * riskPct));
        let ns = { ...s };
        totalTradesRef.current++;
        lastTradeAtRef.current = Date.now();

        // w_focus: first trade of level guaranteed win. hero prophet/print_money: force next win.
        const forcedWin = nextTradeWinRef.current || (firstTradeRef.current && arts.includes("w_focus"));
        if (nextTradeWinRef.current) nextTradeWinRef.current = false;
        const effectiveWin = win || forcedWin;
        // b_time_stop: every 8th trade = automatic free turn (skip resolution)
        const isFreeTurn = arts.includes("b_time_stop") && totalTradesRef.current % 8 === 0;
        // p_the_algo: 10% auto-win chance
        const algoWin = !win && arts.includes("p_the_algo") && Math.random() < 0.10;
        // quant shop item: every 5th trade auto-wins
        const quantWin = !win && gear.includes("quant") && totalTradesRef.current % 5 === 0;
        // char_ai: every 12th trade auto-wins
        const charAiWin = !win && gear.includes("char_ai") && totalTradesRef.current % 12 === 0;
        // b_leverage: amplifies both gains and losses
        const hasLeverage = arts.includes("b_leverage");

        if (firstTradeRef.current) firstTradeRef.current = false;

        if (isFreeTurn) {
          pushFloat("⏸️ TIME STOP", "var(--neon-blue)");
          return ns; // skip this trade entirely
        }

        // vpn shop item: 5% auto-win
        const vpnWin = !win && gear.includes("vpn") && Math.random() < 0.05;
        if (effectiveWin || algoWin || quantWin || charAiWin || vpnWin) {
          if (algoWin && !win)  pushFloat("🤖 ALGO WIN!", "var(--neon-magenta)");
          if (quantWin)         pushFloat("🧠 QUANT WIN!", "var(--neon-blue)");
          if (charAiWin)        pushFloat("🤖 AI WIN!", "var(--neon-blue)");
          const streakTier = Math.floor(ns.combo / 3);
          // streak multiplier — boosted by artifacts + chars
          let streakMult = 1 + streakTier * 0.35;
          if (arts.includes("g_streak"))  streakMult *= 1.10;
          if (arts.includes("gu_streak")) streakMult *= 1.20; // upgrade
          if (arts.includes("b_oracle"))  streakMult *= 1.25;
          if (gear.includes("char_swing")) streakMult *= 1.10;

          let gain = Math.round(pnl * streakMult);
          if (arts.includes("p_godmode"))   gain = Math.round(gain * 1.40);
          if (arts.includes("b_leverage"))  gain = Math.round(gain * 1.50);
          if (arts.includes("p_yolo"))      gain = Math.round(gain * 1.80);
          if (arts.includes("b_market_god"))gain = Math.round(gain * 1.15);
          if (hPas.gainMult)                gain = Math.round(gain * hPas.gainMult);
          if (gear.includes("char_scalper")) gain = Math.round(gain * 1.05);
          if (gear.includes("char_day"))    gain = Math.round(gain * 1.05);
          // Degen: on wins, 50% chance to double
          if (gear.includes("char_degen") && Math.random() < 0.5) gain *= 2;
          // Pet bonuses
          if (gear.includes("pet_frog")  && p.dir === "LONG")  gain = Math.round(gain * 1.06);
          if (gear.includes("pet_whale") && pnl > 60) gain = Math.round(gain * 1.10);

          ns.wins += 1;
          ns.combo += 1;
          ns.bestCombo = Math.max(ns.bestCombo, ns.combo);
          compoundWinsRef.current++;

          let coinGain = 5 + Math.floor(ns.combo * 1.5) + streakTier * 4;
          if (arts.includes("b_double_coins")) coinGain = Math.round(coinGain * 1.80);
          if (arts.includes("bu_double"))      coinGain = Math.round(coinGain * 2.50);
          if (arts.includes("b_momentum"))    coinGain += 4 + Math.floor(ns.combo * 0.5);
          if (arts.includes("g_coin_bonus"))  coinGain += 4;
          if (arts.includes("g_journal") && ns.accuracy > 60) coinGain = Math.round(coinGain * 1.20);
          if (arts.includes("w_ledger") && ns.accuracy > 60) coinGain = Math.round(coinGain * 1.10);
          if (arts.includes("w_penny"))      coinGain += 2;
          if (arts.includes("g_greed"))      coinGain += Math.floor(ns.combo * 3);
          if (arts.includes("g_moon") && (ns.mode === "MEME" || ns.mode === "HIGH_VOL")) coinGain = Math.round(coinGain * 1.25);
          if (arts.includes("p_infinite"))   coinGain = Math.round(coinGain * 2);
          if (arts.includes("b_market_god")) coinGain = Math.round(coinGain * 1.15);
          if (gear.includes("cat"))           coinGain = Math.round(coinGain * 1.10);
          if (gear.includes("pet_cat"))       coinGain = Math.round(coinGain * 1.10);
          if (gear.includes("pet_bull"))      coinGain = Math.round(coinGain * 1.15);
          if (gear.includes("desk"))          coinGain = Math.round(coinGain * 1.20);
          if (gear.includes("hedge"))         coinGain = Math.round(coinGain * 1.50);
          if (gear.includes("mouse"))         coinGain = Math.round(coinGain * 1.05);
          if (gear.includes("fiber"))         coinGain += 2;
          if (gear.includes("kb"))            coinGain += Math.max(0, streakTier);
          if (gear.includes("char_crypto_max") && (ns.mode === "MEME" || ns.mode === "HIGH_VOL")) coinGain = Math.round(coinGain * 1.20);
          if (gear.includes("pet_dragon") && ns.combo >= 5) coinGain = Math.round(coinGain * 1.25);
          // quant: every 5th trade is auto-resolved \u2014 bonus coins on those trades
          if (gear.includes("quant") && totalTradesRef.current % 5 === 0) coinGain = Math.round(coinGain * 2);
          if (gear.includes("meme_stonk") && (ns.mode === "MEME" || ns.mode === "HIGH_VOL")) coinGain = Math.round(coinGain * 1.15);
          if (gear.includes("pet_hamster") && Math.random() < 0.5) coinGain = Math.round(coinGain * 1.02);
          if (hPas.coinMult)                  coinGain = Math.round(coinGain * hPas.coinMult);
          if (doubleCoinsRef.current > 0)     { coinGain *= 2; doubleCoinsRef.current--; pushFloat("💰 x2 COINS!", "var(--neon-yellow)"); }

          ns.coins += coinGain;
          ns.levelCoinsEarned += coinGain;

          let xpGain = 10 + ns.combo * 2 + streakTier * 5;
          if (arts.includes("w_xp")) xpGain = Math.round(xpGain * 1.20);
          if (hPas.xpMult)           xpGain = Math.round(xpGain * hPas.xpMult);
          ns.xp += xpGain;

          // BALANCE gains (fixed-risk position sizing)
          const balanceGain = Math.max(1, Math.round(positionRisk * (0.9 + Math.min(1.5, streakMult - 1))));
          ns.profit += gain;
          ns.balance += balanceGain;

          // w_socks: +1 max HP per win up to +30
          if (arts.includes("w_socks") && ns.maxHp < 130) ns.maxHp += 1;
          // p_market_king every 5th win bonus coins
          if (arts.includes("p_market_king") && ns.wins % 5 === 0) { ns.coins += 50; ns.levelCoinsEarned += 50; pushFloat("👑 +50", "var(--neon-yellow)"); }
          // w_snack: +2 hp any trade
          if (arts.includes("w_snack")) ns.hp = Math.min(ns.maxHp, ns.hp + 2);

          // Heals
          if (ns.combo % 5 === 0) ns.hp = Math.min(ns.maxHp, ns.hp + 8);
          if (arts.includes("g_combo_heal")) ns.hp = Math.min(ns.maxHp, ns.hp + 2);
          if (arts.includes("b_lifesteal"))  ns.hp = Math.min(ns.maxHp, ns.hp + 3);
          if (gear.includes("pet_shark"))    ns.hp = Math.min(ns.maxHp, ns.hp + 5);

          // g_reversal: next win after 3 consecutive losses heals +20
          if (reversalReadyRef.current) {
            reversalReadyRef.current = false;
            ns.hp = Math.min(ns.maxHp, ns.hp + 20);
            pushFloat("🔄 REVERSAL +20 HP!", "var(--neon-green)");
          }
          consecutiveLossesRef.current = 0;

          // Lucky Socks: heal on streak 3
          if (gear.includes("luckysocks") && ns.combo >= 3) ns.hp = Math.min(ns.maxHp, ns.hp + 2);

          // p_compound: every 10 wins bonus
          if (compoundWinsRef.current >= 10) {
            compoundWinsRef.current = 0;
            ns.coins += 100;
            ns.levelCoinsEarned += 100;
            pushFloat("📉 COMPOUND +100", "var(--neon-yellow)");
          }

          sfx.win(); sfx.coin();
          pushFloat(`+$${gain}`, "var(--neon-green)");
          if (ns.combo >= 3) pushFloat(`x${ns.combo} STREAK`, "var(--neon-yellow)");
          if (streakTier >= 1 && ns.combo % 3 === 0) {
            pushFloat(`STREAK BONUS +${Math.round((streakMult - 1) * 100)}%`, "var(--neon-magenta)");
            addNews(`🔥 Streak tier ${streakTier + 1} — payouts x${streakMult.toFixed(2)}`);
          }
          setFlash("green");

          // Level-up check
          const target = Math.round(BASE_TARGET * gameLevelRef.current * (1 + (gameLevelRef.current - 1) * 0.3));
          if (ns.levelCoinsEarned >= target && !ns.gameOver) {
            setLevelReached(true);
            setPaused(true);
            pushFloat("🏆 LEVEL UP!", "var(--neon-yellow)");
            addNews(`🏆 Target reached — Level ${gameLevelRef.current + 1} unlocked!`);
          }
        } else {
          const loss = Math.round(pnl * 0.6);
          let hpLoss = Math.round((10 + Math.min(15, Math.floor(pnl / 40))) * hpLossMultRef.current);
          if (arts.includes("g_rr"))   hpLoss = Math.round(hpLoss * 0.80);
          if (arts.includes("gu_rr"))  hpLoss = Math.round(hpLoss * 0.65); // upgrade
          if (freeCoffeeLevelsRef.current > 0) hpLoss = Math.round(hpLoss * 0.60);
          if (arts.includes("wu_coffee")) freeCoffeeLevelsRef.current > 0 && (hpLoss = Math.round(hpLoss * 0.50));
          if (gear.includes("hands"))  hpLoss = Math.round(hpLoss * 0.75);
          if (gear.includes("coffee"))    hpLoss = Math.round(hpLoss * 0.92);
          if (gear.includes("therapist")) hpLoss = Math.round(hpLoss * 0.85);
          // b_leverage: amplified HP loss
          if (hasLeverage) hpLoss = Math.round(hpLoss * 1.30);
          // char_degen: 50% chance to double HP loss
          if (gear.includes("char_degen") && Math.random() < 0.5) hpLoss = Math.round(hpLoss * 2);
          // g_insurance: cut damage in half when low HP
          if (arts.includes("g_insurance") && ns.hp < 25) hpLoss = Math.round(hpLoss * 0.5);
          // pet_bear: -6% HP loss on SHORT losses
          if (gear.includes("pet_bear") && p.dir === "SHORT") hpLoss = Math.round(hpLoss * 0.94);
          // hero passive hp mult
          if (hPas.hpLossMult) hpLoss = Math.round(hpLoss * hPas.hpLossMult);
          if (arts.includes("p_yolo")) hpLoss = Math.round(hpLoss * 1.30);
          // w_umbrella: first 5 losses total halved
          totalLossesRef.current++;
          if (arts.includes("w_umbrella") && totalLossesRef.current <= 5) hpLoss = Math.round(hpLoss * 0.5);
          // b_iron: every 4th loss zero dmg
          iron4Ref.current++;
          if (arts.includes("b_iron") && iron4Ref.current % 4 === 0) { hpLoss = 0; pushFloat("🍺 IRON!", "var(--neon-blue)"); }
          // fund_mgr cap
          if (gear.includes("char_fund_mgr")) hpLoss = Math.min(5, hpLoss);

          ns.losses += 1;
          consecutiveLossesRef.current++;
          if (arts.includes("g_reversal") && consecutiveLossesRef.current >= 3) {
            reversalReadyRef.current = true;
            pushFloat("🔄 REVERSAL READY", "var(--neon-blue)");
          }

          // Shield
          const shieldsLeft = shieldUsedRef.current;
          if (shieldsLeft > 0) {
            shieldUsedRef.current = shieldsLeft - 1;
            pushFloat(`🛡️ SHIELD (${shieldsLeft - 1} left)`, "var(--neon-blue)");
          } else if (arts.includes("p_greed")) {
            // Streak drops to half instead of 0
            if (ns.combo >= 3) addNews(`∞ Greed: streak ${ns.combo} → ${Math.floor(ns.combo / 2)}`);
            ns.combo = Math.floor(ns.combo / 2);
            pushFloat("∞ GREED!", "var(--neon-magenta)");
          } else {
            if (ns.combo >= 3) addNews(`💔 Streak broken at x${ns.combo}`);
            ns.combo = 0;
          }

          // Immortal / Dark Pool
          if (immortalRemainingRef.current > 0) {
            immortalRemainingRef.current--;
            pushFloat(`💎 IMMORTAL (${immortalRemainingRef.current} left)`, "var(--neon-blue)");
          } else if (gear.includes("dark_pool") && totalTradesRef.current <= 10) {
            pushFloat("🌑 DARK POOL", "var(--neon-magenta)");
          } else {
            ns.hp = Math.max(0, ns.hp - hpLoss);
            pushFloat(`-${hpLoss} HP`, "var(--neon-red)");
          }

          // w_bandage: small heal on loss
          if (arts.includes("w_bandage")) ns.hp = Math.min(ns.maxHp, ns.hp + 3);
          if (arts.includes("w_snack"))   ns.hp = Math.min(ns.maxHp, ns.hp + 2);

          // BALANCE loss (fixed-risk sizing)
          let balanceLoss = positionRisk;
          if (arts.includes("g_hedge"))  balanceLoss = Math.round(balanceLoss * 0.70);
          if (arts.includes("p_yolo"))   balanceLoss = Math.round(balanceLoss * 1.10);
          if (hPas.lossMult)             balanceLoss = Math.round(balanceLoss * hPas.lossMult);
          if (hasLeverage)               balanceLoss = Math.round(balanceLoss * 1.30);
          ns.profit = Math.max(0, ns.profit - loss);
          ns.balance = Math.max(0, ns.balance - balanceLoss);
          pushFloat(`-$${balanceLoss}`, "var(--neon-red)");

          // b_bailout: instant $1000 if broke, once per level
          if (arts.includes("b_bailout") && ns.balance <= 50 && !bailoutUsedThisLevelRef.current) {
            bailoutUsedThisLevelRef.current = true;
            ns.balance += 1000;
            pushFloat("🎟 BAILOUT +$1000", "var(--neon-green)");
            addNews("🎟 Bailout Voucher used — +$1000 emergency capital!");
          }
          sfx.lose();
          setFlash("red");
          setShake(true);
          trackedTimeout(() => setShake(false), 400);
        }

        ns.level = xpToLevel(ns.xp);
        const total = ns.wins + ns.losses;
        ns.accuracy = total ? Math.round((ns.wins / total) * 100) : 0;

        if (ns.hp <= 0) {
          const maxRevives = arts.includes("pu_phoenix") ? 2 : arts.includes("p_phoenix") ? 1 : 0;
          if (phoenixUsedRef.current < maxRevives) {
            phoenixUsedRef.current++;
            ns.hp = arts.includes("pu_phoenix") ? 75 : 60;
            pushFloat("🦅 PHOENIX REVIVAL!", "var(--neon-magenta)");
            addNews("🦅 Phoenix Soul activates — revived!");
          } else {
            ns.gameOver = true;
            ns.crashCause = "hp";
            setPaused(true);
          }
        }

        // BANKRUPTCY: balance depleted
        if (!ns.gameOver && ns.balance <= 0) {
          ns.gameOver = true;
          ns.crashCause = "balance";
          setPaused(true);
          addNews("💸 BANKRUPT — your monitor crashes to the floor.");
          sfx.crash();
          setShake(true);
          trackedTimeout(() => setShake(false), 800);
        }

        // ── Narrator (streak highs) ───────────────────────────────────────────
        if (win || algoWin || quantWin || charAiWin) {
          const line = rollNarratorLine(ns.combo);
          if (line) {
            addNews(`🎙️ ${line}`);
            sfx.streak(ns.combo);
          }
        }

        // ── Tilt tracking (consecutive losses) ───────────────────────────────
        const consLoss = consecutiveLossesRef.current;
        const newTilt = consLoss >= 7 ? 3 : consLoss >= 5 ? 2 : consLoss >= 3 ? 1 : 0;
        setTiltLevel(newTilt);
        if (newTilt > 0 && !win && consLoss === [3,5,7][newTilt - 1]) {
          const lines = TILT_LINES[consLoss as keyof typeof TILT_LINES];
          if (lines) addNews(`💢 ${lines[Math.floor(Math.random() * lines.length)]}`);
          if (newTilt >= 2) sfx.tilt();
          if (newTilt >= 2) { setShake(true); trackedTimeout(() => setShake(false), 700); }
        }
        if (win) setTiltLevel(0);

        // ── Girlfriend effect: steals attention, makes next loss worse ────────
        if (gear.includes("girlfriend") && !win && Math.random() < 0.4) {
          addNews("💃 Girlfriend called. You missed the move.");
          pushFloat("💃 DISTRACTED!", "var(--neon-magenta)");
        }

        trackedTimeout(() => setFlash(null), 400);
        return ns;
      });
      return null;
    });
  }, [pushFloat, trackedTimeout, addNews]);

  // ── Add artifact ─────────────────────────────────────────────────────────────
  const addArtifact = useCallback((id: string) => {
    if (artifactsRef.current.includes(id)) return;
    artifactsRef.current = [...artifactsRef.current, id];
    setActiveArtifacts(artifactsRef.current);
    if (id === "w_maxhp") {
      setStats((s) => ({ ...s, maxHp: s.maxHp + 12, hp: Math.min(s.maxHp + 12, s.hp + 12) }));
    }
    if (id === "p_slow") {
      const f = feedRef.current;
      if (f) f.setSpeedMs(Math.round(f.getSpeedMs() * 1.25));
    }
    if (id === "p_immortal")  immortalRemainingRef.current = 4;
    if (id === "pu_immortal") immortalRemainingRef.current = 7;
    if (id === "p_phoenix" || id === "pu_phoenix") phoenixUsedRef.current = 0;
    if (id === "w_coffee")  freeCoffeeLevelsRef.current += 3;
    if (id === "wu_coffee") freeCoffeeLevelsRef.current += 5;
    if (id === "b_shield")  shieldUsedRef.current = 1;
    if (id === "bu_shield2") shieldUsedRef.current = 2;
    if (id === "w_focus") firstTradeRef.current = true;
  }, []);

  // ── Advance to next game-level ────────────────────────────────────────────────
  const nextLevel = useCallback(() => {
    const f = feedRef.current!;
    // Speed up candles more aggressively at higher levels
    const speedCut = 200 + gameLevelRef.current * 20;
    f.setSpeedMs(Math.max(300, f.getSpeedMs() - speedCut));
    // Events more frequent
    eventIntervalBaseRef.current = Math.max(4000, eventIntervalBaseRef.current - 2500);
    // Difficulty ramp: +20% HP loss per level (capped at 3x)
    hpLossMultRef.current = Math.min(3.0, 1.0 + gameLevelRef.current * 0.20);

    setLevelReached(false);
    // Per-level resets
    if (artifactsRef.current.includes("bu_shield2")) shieldUsedRef.current = 2;
    else if (artifactsRef.current.includes("b_shield")) shieldUsedRef.current = 1;
    else shieldUsedRef.current = 0;

    if (artifactsRef.current.includes("pu_immortal")) immortalRemainingRef.current = 7;
    else if (artifactsRef.current.includes("p_immortal")) immortalRemainingRef.current = 4;
    else immortalRemainingRef.current = 0;

    if (freeCoffeeLevelsRef.current > 0) freeCoffeeLevelsRef.current--;
    consecutiveLossesRef.current = 0;
    reversalReadyRef.current = false;
    totalTradesRef.current = 0;
    compoundWinsRef.current = 0;
    firstTradeRef.current = artifactsRef.current.includes("w_focus");

    const newLevel = gameLevelRef.current + 1;
    gameLevelRef.current = newLevel;
    setGameLevel(newLevel);
    const arts = artifactsRef.current;
    setStats((s) => {
      let ns = { ...s, levelCoinsEarned: 0 };
      if (arts.includes("wu_hp"))          ns.hp = Math.min(ns.maxHp, ns.hp + 25 * newLevel);
      else if (arts.includes("w_hp"))      ns.hp = Math.min(ns.maxHp, ns.hp + 15 * newLevel);
      if (arts.includes("w_coins"))        ns.coins += 15 * newLevel;
      if (arts.includes("g_coffee_addict")) ns.coins += 40;
      return ns;
    });
    addNews(`⚡ Level ${newLevel} — candles faster, market wilder! HP loss x${hpLossMultRef.current.toFixed(1)}`);
  }, [addNews]);

  // Main game loop (RAF)
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!pausedRef.current && feedRef.current) {
        const closed = feedRef.current.next(dt);
        if (closed) {
          const p = pendingRef.current;
          // Skip the candle that was forming when the trade was entered.
          // Its close might predate or immediately follow entry — resolving it
          // causes the "instant loss" bug. Trades evaluate on the NEXT full candle.
          if (p && closed.t === pendingEnterCandleRef.current) {
            pendingEnterCandleRef.current = -1; // mark entry candle as passed
          } else if (!tpSlTriggeredRef.current) {
            resolvePending(closed);
          }
          tpSlTriggeredRef.current = false;
        }
        setTick((t) => (t + 1) & 0xffff);

        // Intra-candle TP/SL check
        // Skip the candle on which the trade was entered — its high/low predates the entry price
        const p = pendingRef.current;
        if (p && !tpSlTriggeredRef.current) {
          const cur = feedRef.current.peek();
          if (cur.t !== pendingEnterCandleRef.current) {
            const isLong = p.dir === "LONG";
            const tp = p.entry * (isLong ? 1.015 : 0.985);
            const sl = p.entry * (isLong ? 0.990 : 1.010);
            const tpHit = isLong ? cur.high >= tp : cur.low <= tp;
            const slHit = isLong ? cur.low <= sl : cur.high >= sl;
            if (tpHit || slHit) {
              tpSlTriggeredRef.current = true;
              const synthClose = tpHit ? tp : sl;
              resolvePending({ ...cur, close: synthClose });
            }
          }
        }

        const nowMs = Date.now();
        setStats((s) => s.survivalMs === nowMs - startRef.current ? s : { ...s, survivalMs: nowMs - startRef.current });

        if (nowMs - lastDiffRef.current > 60000) {
          lastDiffRef.current = nowMs;
          const f = feedRef.current;
          f.setSpeedMs(f.getSpeedMs() - 150);
          addNews("⚡ Difficulty increased — candles speed up.");
        }

        if (nowMs - lastEventRef.current > eventIntervalBaseRef.current + Math.random() * 12000) {
          lastEventRef.current = nowMs;
          const e = rollEvent();
          setEvent(e);
          feedRef.current.setBiasBoost(e.bias, e.volMult, e.ttl * 1000);
          sfx.event();
          addNews(`${e.title} — ${e.subtitle ?? ""}`);
          if (e.kind === "FLASH_CRASH") { sfx.crash(); feedRef.current.applyShock(-0.02); setShake(true); trackedTimeout(() => setShake(false), 500); }
          if (e.kind === "SHORT_SQUEEZE") feedRef.current.applyShock(0.02);
          if (e.kind === "WHALE") feedRef.current.applyShock(e.bias > 0 ? 0.015 : -0.015);
          const ttlMs = e.ttl * 1000;
          trackedTimeout(() => setEvent((cur) => (cur && cur.id === e.id ? null : cur)), ttlMs);
        }

        if (nowMs - lastBossRef.current > 3 * 60000) {
          lastBossRef.current = nowMs;
          const b = rollBoss();
          setEvent(b);
          feedRef.current.setBiasBoost(b.bias, b.volMult, b.ttl * 1000);
          sfx.boss();
          addNews(b.title);
          trackedTimeout(() => setEvent((cur) => (cur && cur.id === b.id ? null : cur)), b.ttl * 1000);
        }

        if (nowMs - lastTickerRef.current > 8000 + Math.random() * 4000) {
          lastTickerRef.current = nowMs;
          addNews(`📰 ${rollNewsTicker()}`);
        }

        if (Math.random() < 0.0006) {
          const m = MODES[Math.floor(Math.random() * MODES.length)];
          feedRef.current.setMode(m);
          setStats((s) => ({ ...s, mode: m }));
          addNews(`Market regime: ${m}`);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [resolvePending, addNews, trackedTimeout]);

  const predict = useCallback((p: Prediction) => {
    if (stats.gameOver) return;
    sfx.click();
    if (p === "SKIP") {
      setStats((s) => ({ ...s, skips: s.skips + 1 }));
      return;
    }
    const feed = feedRef.current!;
    const cur = feed.peek();
    const entry = cur.close;
    tpSlTriggeredRef.current = false;
    pendingEnterCandleRef.current = cur.t; // remember which candle we entered on
    setPending({ dir: p, entry, at: Date.now() });
  }, [stats.gameOver]);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current.clear();
    feedRef.current = makeFeed();
    setStats(initialStats());
    setEvent(null);
    setFloats([]);
    setPending(null);
    setPaused(false);
    setFlash(null);
    setShake(false);
    setGameLevel(1);
    gameLevelRef.current = 1;
    setLevelReached(false);
    setTiltLevel(0);
    artifactsRef.current = [];
    setActiveArtifacts([]);
    shieldUsedRef.current = 0;
    immortalRemainingRef.current = 0;
    freeCoffeeLevelsRef.current = 0;
    phoenixUsedRef.current = 0;
    consecutiveLossesRef.current = 0;
    reversalReadyRef.current = false;
    totalTradesRef.current = 0;
    compoundWinsRef.current = 0;
    firstTradeRef.current = false;
    hpLossMultRef.current = 1.0;
    eventIntervalBaseRef.current = 16000;
    startRef.current = Date.now();
    lastEventRef.current = Date.now();
    lastBossRef.current = Date.now();
    lastDiffRef.current = Date.now();
    lastTickerRef.current = Date.now();
    setNews(["🆕 New run — good luck out there, trader."]);
  }, []);

  const spendCoins = useCallback((n: number) => {
    setStats((s) => ({ ...s, coins: Math.max(0, s.coins - n) }));
  }, []);

  const addCoins = useCallback((n: number) => {
    setStats((s) => ({ ...s, coins: s.coins + n, levelCoinsEarned: s.levelCoinsEarned + n }));
    pushFloat(`+${n} 🪙 MISSION!`, "var(--neon-yellow)");
  }, [pushFloat]);

  /** Apply one-time effect of a purchased shop item (used for consumables). */
  const applyItemEffect = useCallback((id: string) => {
    if (id === "hp_potion") {
      setStats((s) => ({ ...s, hp: Math.min(s.maxHp, s.hp + 25) }));
      pushFloat("+25 HP", "var(--neon-green)");
    }
  }, [pushFloat]);

  const feed = feedRef.current!;
  const levelTarget = Math.round(BASE_TARGET * gameLevel * (1 + (gameLevel - 1) * 0.3));
  return useMemo(() => ({
    feed, stats, event, floats, shake, flash, pending, scanlines, paused, news, tick,
    gameLevel, levelTarget, levelReached, activeArtifacts, tiltLevel,
    setScanlines, setPaused, predict, reset, spendCoins, addCoins, applyItemEffect, addArtifact, nextLevel, setOwnedItems,
  }), [
    feed, stats, event, floats, shake, flash, pending, scanlines, paused, news, tick,
    gameLevel, levelTarget, levelReached, activeArtifacts, tiltLevel,
    predict, reset, spendCoins, addCoins, applyItemEffect, addArtifact, nextLevel, setOwnedItems,
  ]);
}

function initialStats(): Stats {
  return {
    hp: 100, maxHp: 100, coins: 50, balance: 1000, profit: 0,
    xp: 0, level: 1, combo: 0, bestCombo: 0,
    wins: 0, losses: 0, skips: 0, accuracy: 0,
    reactionMs: 0, survivalMs: 0, mode: "SIDEWAYS", gameOver: false,
    levelCoinsEarned: 0,
  };
}
