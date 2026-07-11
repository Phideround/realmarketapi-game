import { n as __toESM } from "../_runtime.mjs";
import { s as performance_default } from "../_libs/h3+rou3+srvx+unenv.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DOgL62dP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function mulberry32(seed) {
	return function() {
		let t = seed += 1831565813;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
var PATTERN_POOL = [
	"UPTREND",
	"DOWNTREND",
	"DOUBLE_TOP",
	"DOUBLE_BOTTOM",
	"HEAD_SHOULDERS",
	"INV_HEAD_SHOULDERS",
	"BULL_FLAG",
	"BEAR_FLAG",
	"ASC_TRIANGLE",
	"DESC_TRIANGLE",
	"RISING_WEDGE",
	"FALLING_WEDGE",
	"CUP_HANDLE",
	"BREAKOUT_UP",
	"BREAKOUT_DOWN",
	"CONSOLIDATION",
	"PARABOLIC",
	"CAPITULATION"
];
function patternShape(p, u) {
	const τ = Math.PI * 2;
	switch (p) {
		case "UPTREND": return .06 * u;
		case "DOWNTREND": return -.06 * u;
		case "DOUBLE_TOP": return .05 * Math.sin(u * τ) - .03 * u;
		case "DOUBLE_BOTTOM": return -.05 * Math.sin(u * τ) + .03 * u;
		case "HEAD_SHOULDERS": {
			const b1 = .03 * Math.exp(-Math.pow((u - .2) * 6, 2));
			const b2 = .06 * Math.exp(-Math.pow((u - .5) * 6, 2));
			const b3 = .03 * Math.exp(-Math.pow((u - .8) * 6, 2));
			return b1 + b2 + b3 - .05 * u;
		}
		case "INV_HEAD_SHOULDERS": {
			const b1 = -.03 * Math.exp(-Math.pow((u - .2) * 6, 2));
			const b2 = -.06 * Math.exp(-Math.pow((u - .5) * 6, 2));
			const b3 = -.03 * Math.exp(-Math.pow((u - .8) * 6, 2));
			return b1 + b2 + b3 + .05 * u;
		}
		case "BULL_FLAG": return u < .55 ? .05 * u : .028 - .02 * (u - .55) + .08 * (u - .55);
		case "BEAR_FLAG": return u < .55 ? -.05 * u : -.028 + .02 * (u - .55) - .08 * (u - .55);
		case "ASC_TRIANGLE": return .02 * u + .015 * Math.sin(u * τ * 3);
		case "DESC_TRIANGLE": return -.02 * u + .015 * Math.sin(u * τ * 3);
		case "RISING_WEDGE": return .04 * u + .01 * Math.sin(u * τ * 4) - (u > .85 ? .06 * (u - .85) * 6 : 0);
		case "FALLING_WEDGE": return -.04 * u - .01 * Math.sin(u * τ * 4) + (u > .85 ? .06 * (u - .85) * 6 : 0);
		case "CUP_HANDLE": return -.05 * Math.sin(Math.PI * Math.min(u * 1.2, 1)) + (u > .85 ? .04 * (u - .85) * 6 : 0);
		case "BREAKOUT_UP": return u < .6 ? .005 * Math.sin(u * τ * 3) : .09 * (u - .6);
		case "BREAKOUT_DOWN": return u < .6 ? .005 * Math.sin(u * τ * 3) : -.09 * (u - .6);
		case "CONSOLIDATION": return .008 * Math.sin(u * τ * 4);
		case "PARABOLIC": return .1 * Math.pow(u, 2.2);
		case "CAPITULATION": return -.1 * Math.pow(u, 2.2);
	}
}
var PATTERN_MODE_WEIGHT = {
	BULL: {
		UPTREND: 3,
		BULL_FLAG: 2,
		ASC_TRIANGLE: 2,
		CUP_HANDLE: 2,
		BREAKOUT_UP: 2,
		INV_HEAD_SHOULDERS: 1.5,
		PARABOLIC: 1
	},
	BEAR: {
		DOWNTREND: 3,
		BEAR_FLAG: 2,
		DESC_TRIANGLE: 2,
		HEAD_SHOULDERS: 2,
		BREAKOUT_DOWN: 2,
		CAPITULATION: 1
	},
	SIDEWAYS: {
		CONSOLIDATION: 3,
		DOUBLE_TOP: 1.5,
		DOUBLE_BOTTOM: 1.5,
		ASC_TRIANGLE: 1,
		DESC_TRIANGLE: 1
	},
	HIGH_VOL: {
		BREAKOUT_UP: 1.5,
		BREAKOUT_DOWN: 1.5,
		PARABOLIC: 1,
		CAPITULATION: 1,
		RISING_WEDGE: 1,
		FALLING_WEDGE: 1
	},
	MEME: {
		PARABOLIC: 3,
		CAPITULATION: 2,
		BREAKOUT_UP: 1.5,
		BULL_FLAG: 1
	},
	BLACK_SWAN: {
		CAPITULATION: 4,
		BEAR_FLAG: 2,
		DOWNTREND: 2,
		HEAD_SHOULDERS: 1
	}
};
function createSimulatedFeed(seed = Math.floor(Math.random() * 1e9)) {
	const rand = mulberry32(seed);
	const hist = [];
	let mode = "SIDEWAYS";
	let price = 1e4;
	let candleMs = 2500;
	let elapsedInCandle = 0;
	let cur = fresh(price, Date.now());
	let boostBias = 0, boostVol = 1, boostTtl = 0;
	let pattern = "CONSOLIDATION";
	let patternAnchor = price;
	let patternDurationMs = 2e4;
	let patternElapsed = 0;
	function pickPattern() {
		const w = PATTERN_MODE_WEIGHT[mode] ?? {};
		const entries = PATTERN_POOL.map((p) => [p, w[p] ?? .4]);
		const total = entries.reduce((a, [, v]) => a + v, 0);
		let r = rand() * total;
		for (const [p, v] of entries) {
			r -= v;
			if (r <= 0) return p;
		}
		return "CONSOLIDATION";
	}
	function newPattern() {
		pattern = pickPattern();
		patternAnchor = price;
		patternDurationMs = 12e3 + rand() * 22e3;
		patternElapsed = 0;
	}
	function fresh(p, t) {
		return {
			t,
			open: p,
			high: p,
			low: p,
			close: p,
			volume: 0
		};
	}
	function step(dtMs) {
		const subDt = Math.max(0, dtMs) / 1e3;
		patternElapsed += dtMs;
		const u0 = Math.min(1, Math.max(0, patternElapsed / patternDurationMs));
		const u1 = Math.min(1, Math.max(0, (patternElapsed + dtMs) / patternDurationMs));
		const targetPrev = patternAnchor * (1 + patternShape(pattern, u0));
		const targetDelta = patternAnchor * (1 + patternShape(pattern, u1)) - targetPrev;
		const vol = (mode === "HIGH_VOL" || mode === "MEME" ? .004 : mode === "BLACK_SWAN" ? .008 : .0022) * boostVol;
		const n = (rand() + rand() + rand() - 1.5) / 1.5;
		const noise = price * vol * n * Math.sqrt(subDt) * 3;
		const biasPush = price * (boostBias * .003) * subDt;
		let next = price + targetDelta + noise + biasPush;
		if (!Number.isFinite(next)) next = price;
		price = Math.max(1, next);
		cur.close = price;
		cur.high = Math.max(cur.high, price);
		cur.low = Math.min(cur.low, price);
		cur.volume += Math.abs(targetDelta + noise || 0) * (.5 + rand());
	}
	function advance(dtMs) {
		elapsedInCandle += dtMs;
		if (boostTtl > 0) {
			boostTtl -= dtMs;
			if (boostTtl <= 0) {
				boostBias = 0;
				boostVol = 1;
			}
		}
		const subs = 4;
		for (let i = 0; i < subs; i++) step(dtMs / subs);
		if (patternElapsed >= patternDurationMs) newPattern();
		if (elapsedInCandle >= candleMs) {
			elapsedInCandle = 0;
			const closed = { ...cur };
			hist.push(closed);
			if (hist.length > 400) hist.shift();
			cur = fresh(price, Date.now());
			return closed;
		}
		return null;
	}
	newPattern();
	return {
		next: advance,
		peek: () => cur,
		history: () => hist,
		setMode(m) {
			mode = m;
			newPattern();
		},
		getMode: () => mode,
		setBiasBoost(b, v, ttl) {
			boostBias = b;
			boostVol = v;
			boostTtl = ttl;
		},
		applyShock(pct) {
			price = Math.max(1, price * (1 + pct));
			cur.close = price;
			cur.high = Math.max(cur.high, price);
			cur.low = Math.min(cur.low, price);
			patternAnchor = price;
		},
		getSpeedMs: () => candleMs,
		setSpeedMs: (ms) => {
			candleMs = Math.max(700, ms);
		},
		currentPattern: () => pattern,
		patternProgress: () => Math.min(1, patternElapsed / patternDurationMs),
		prime(n) {
			let safety = n * 8;
			while (hist.length < n && safety-- > 0) advance(candleMs);
		}
	};
}
var rid = () => Math.random().toString(36).slice(2, 9);
var EVENT_POOL = [
	() => ({
		id: rid(),
		kind: "WHALE",
		title: "🐋 WHALE ATTACK",
		subtitle: "Massive order incoming",
		bias: Math.random() < .5 ? 1 : -1,
		volMult: 2.2,
		ttl: 6
	}),
	() => ({
		id: rid(),
		kind: "ELON",
		title: "🐦 ELON TWEET",
		subtitle: Math.random() < .5 ? "to the moon 🚀" : "meh 💩",
		bias: Math.random() < .5 ? 1.3 : -1.3,
		volMult: 1.8,
		ttl: 5
	}),
	() => ({
		id: rid(),
		kind: "CPI",
		title: "📰 CPI RELEASE",
		subtitle: "Brace for volatility",
		bias: (Math.random() - .5) * 2,
		volMult: 3,
		ttl: 7
	}),
	() => ({
		id: rid(),
		kind: "FLASH_CRASH",
		title: "💥 FLASH CRASH",
		subtitle: "Everything is red",
		bias: -1.8,
		volMult: 3.5,
		ttl: 5
	}),
	() => ({
		id: rid(),
		kind: "SHORT_SQUEEZE",
		title: "🚀 SHORT SQUEEZE",
		subtitle: "Bears rekt",
		bias: 1.8,
		volMult: 3,
		ttl: 5
	}),
	() => ({
		id: rid(),
		kind: "LIQUIDATION",
		title: "☠️ LIQUIDATION CASCADE",
		subtitle: "Chaos mode",
		bias: Math.random() < .5 ? 1.5 : -1.5,
		volMult: 4,
		ttl: 6
	}),
	() => ({
		id: rid(),
		kind: "MM_TRAP",
		title: "🎯 MARKET MAKER TRAP",
		subtitle: "Don't fall for it",
		bias: 1,
		volMult: 1.2,
		ttl: 4
	}),
	() => ({
		id: rid(),
		kind: "ELON",
		title: "🐦 CELEBRITY ENDORSEMENT",
		subtitle: "Retail piles in",
		bias: 1.4,
		volMult: 2,
		ttl: 6
	}),
	() => ({
		id: rid(),
		kind: "CPI",
		title: "🏦 FED RATE DECISION",
		subtitle: "Powell speaks",
		bias: (Math.random() - .5) * 2.2,
		volMult: 3.2,
		ttl: 8
	}),
	() => ({
		id: rid(),
		kind: "CPI",
		title: "📉 GDP MISS",
		subtitle: "Recession fears",
		bias: -1.4,
		volMult: 2.4,
		ttl: 6
	}),
	() => ({
		id: rid(),
		kind: "CPI",
		title: "📈 JOBS BEAT",
		subtitle: "Hot labor market",
		bias: 1.2,
		volMult: 2.2,
		ttl: 6
	}),
	() => ({
		id: rid(),
		kind: "WHALE",
		title: "🧾 ETF INFLOWS",
		subtitle: "Institutions loading up",
		bias: 1.5,
		volMult: 1.8,
		ttl: 7
	}),
	() => ({
		id: rid(),
		kind: "WHALE",
		title: "🧻 ETF OUTFLOWS",
		subtitle: "Institutions dumping",
		bias: -1.5,
		volMult: 1.8,
		ttl: 7
	}),
	() => ({
		id: rid(),
		kind: "LIQUIDATION",
		title: "⛓️ EXCHANGE HACK",
		subtitle: "Withdrawals paused",
		bias: -1.6,
		volMult: 3.2,
		ttl: 6
	}),
	() => ({
		id: rid(),
		kind: "MM_TRAP",
		title: "🕳️ STOP HUNT",
		subtitle: "Wicks incoming",
		bias: -.7,
		volMult: 2.5,
		ttl: 4
	}),
	() => ({
		id: rid(),
		kind: "SHORT_SQUEEZE",
		title: "🎢 GAMMA SQUEEZE",
		subtitle: "Dealer hedging spiral",
		bias: 1.7,
		volMult: 2.7,
		ttl: 6
	}),
	() => ({
		id: rid(),
		kind: "ELON",
		title: "🤖 AI HYPE CYCLE",
		subtitle: "Everything is AI now",
		bias: 1.5,
		volMult: 2,
		ttl: 6
	}),
	() => ({
		id: rid(),
		kind: "ELON",
		title: "🤡 MEMECOIN MANIA",
		subtitle: "Doge, Pepe, Wojak…",
		bias: 1.3,
		volMult: 2.8,
		ttl: 5
	}),
	() => ({
		id: rid(),
		kind: "CPI",
		title: "🛢️ OIL SHOCK",
		subtitle: "OPEC surprise cut",
		bias: 1,
		volMult: 2.4,
		ttl: 5
	}),
	() => ({
		id: rid(),
		kind: "CPI",
		title: "🌐 GEOPOLITICAL RISK",
		subtitle: "Risk-off across the board",
		bias: -1.2,
		volMult: 2.6,
		ttl: 6
	}),
	() => ({
		id: rid(),
		kind: "MM_TRAP",
		title: "🎩 MANIPULATION WEEK",
		subtitle: "Market makers playing both sides",
		bias: (Math.random() - .5) * 3,
		volMult: 3.5,
		ttl: 10
	}),
	() => ({
		id: rid(),
		kind: "ELON",
		title: "📱 WE'RE WATCHING YOUR MOBILE",
		subtitle: "Your data sold. Market moved.",
		bias: -1,
		volMult: 2,
		ttl: 5
	}),
	() => ({
		id: rid(),
		kind: "LIQUIDATION",
		title: "🤡 CLOWN CANDLE",
		subtitle: "Nobody knows why. Classic crypto.",
		bias: (Math.random() - .5) * 4,
		volMult: 5,
		ttl: 4
	}),
	() => ({
		id: rid(),
		kind: "MM_TRAP",
		title: "🔄 FAKEOUT DETECTED",
		subtitle: "Stop hunted. Again.",
		bias: -(Math.random() * 1.5 + .5),
		volMult: 2.2,
		ttl: 5
	}),
	() => ({
		id: rid(),
		kind: "CPI",
		title: "💤 BORING MARKET",
		subtitle: "Everyone’s asleep… or are they?",
		bias: 0,
		volMult: .5,
		ttl: 8
	}),
	() => ({
		id: rid(),
		kind: "WHALE",
		title: "🦖 DEAD CAT BOUNCE",
		subtitle: "Is this the bottom? (No)",
		bias: .8,
		volMult: 2,
		ttl: 5
	}),
	() => ({
		id: rid(),
		kind: "LIQUIDATION",
		title: "🏦 BANK RUN FEAR",
		subtitle: "Panic withdrawal detected",
		bias: -1.8,
		volMult: 3,
		ttl: 6
	}),
	() => ({
		id: rid(),
		kind: "ELON",
		title: "🍕 LUNCH BREAK PUMP",
		subtitle: "Bored traders buying dips",
		bias: 1,
		volMult: 1.4,
		ttl: 4
	}),
	() => ({
		id: rid(),
		kind: "MM_TRAP",
		title: "🧾 WASH TRADING ALERT",
		subtitle: "Volume is fake. Prices real.",
		bias: (Math.random() - .5) * 2,
		volMult: 1.8,
		ttl: 5
	}),
	() => ({
		id: rid(),
		kind: "CPI",
		title: "🧬 ALGO MALFUNCTION",
		subtitle: "Trading bots arguing",
		bias: (Math.random() - .5) * 3,
		volMult: 4,
		ttl: 5
	})
];
var BOSSES = [
	"🇺🇸 Donald Trump",
	"🚀 Elon Musk",
	"📊 Michael Saylor",
	"🏦 Jerome Powell",
	"🐋 The Whale",
	"🎭 Market Maker",
	"⛏️ Bitcoin Miner",
	"💼 BlackRock CEO",
	"🦊 Vitalik",
	"🧠 Warren Buffett",
	"🐂 CZ",
	"🦍 Ape King"
];
var BOSS_LINES = {
	"🇺🇸 Donald Trump": "Nobody trades better than me, believe me",
	"🚀 Elon Musk": "Just tweeted. Good luck.",
	"📊 Michael Saylor": "Buying more BTC. Forever.",
	"🏦 Jerome Powell": "Rates going… up? down? yes.",
	"🐋 The Whale": "Splash.",
	"🎭 Market Maker": "You'll never see it coming",
	"⛏️ Bitcoin Miner": "Difficulty adjustment incoming",
	"💼 BlackRock CEO": "Liquidity is a strategy",
	"🦊 Vitalik": "Merge complete. Chaos begins.",
	"🧠 Warren Buffett": "Rule #1: don't lose money",
	"🐂 CZ": "Funds are safu.",
	"🦍 Ape King": "🦍🦍🦍 ONLY UP 🦍🦍🦍"
};
var NEWS_TICKER = [
	"BTC dominance flips 60%",
	"Retail leverage at record highs",
	"Options market pricing in wild swings",
	"Analyst: 'this is the top' (again)",
	"Meme coin adds three zeros overnight",
	"Insider wallet moved 5,000 BTC",
	"New ETF filing hits the tape",
	"TradFi hedge fund liquidated on-chain",
	"Regulator warns about 'the volatility'",
	"Google trends for 'buy the dip' spikes",
	"Whale wallet awakens after 10 years",
	"Funding rates negative across majors",
	"Open interest at all-time highs",
	"MicroStrategy adds to stack",
	"😂 I'm trading crypto because I'm broke. I'm broke because I'm trading crypto.",
	"💼 McDonald's is hiring. Your move.",
	"🍕 Sir, this is a Wendy's. But I'll take your order.",
	"🚀 When crypto pumps: I'm a genius. When it dumps: the market is wrong.",
	"📉 Bought the dip. It dipped again. Bought again. Still dipping…",
	"🤔 Just ONE more trade. Just ONE more. Okay one more after this.",
	"📝 Loss = learning opportunity (according to my therapist)",
	"🏁 Zoom out bro. Just zoom out.",
	"🪙 My portfolio is a horror movie and I'm the villain.",
	"👨‍💻 Wife sold house. Bought DOGE at 0.70. Classic.",
	"👹 The market can stay irrational longer than you can stay solvent.",
	"🪀 WAGMI... right? RIGHT?!",
	"🔥 This is fine. Everything is fine. (chart goes vertical)",
	"⚠️ Not financial advice. But if it was, still not responsible.",
	"🤯 Stonks only go up (source: made it up)"
];
function rollEvent() {
	return EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)]();
}
function rollBoss() {
	const b = BOSSES[Math.floor(Math.random() * BOSSES.length)];
	return {
		id: rid(),
		kind: "BOSS",
		title: `⚔️ BOSS: ${b}`,
		subtitle: BOSS_LINES[b] ?? "Survive the onslaught",
		bias: (Math.random() - .5) * 2.2,
		volMult: 3,
		ttl: 22,
		boss: b
	};
}
function rollNewsTicker() {
	return NEWS_TICKER[Math.floor(Math.random() * NEWS_TICKER.length)];
}
var STREAK_NARRATOR = {
	3: [
		"🔥 You're reading the market perfectly!",
		"💡 Pattern recognition: UNLOCKED",
		"🎯 Three in a row! You've got this!"
	],
	5: [
		"💎 Diamond hands AND a diamond mind!",
		"🚀 Five wins! Are you even human?",
		"📈 The market bows to you right now!"
	],
	7: [
		"👑 LEGENDARY! The charts fear you!",
		"⚡ Seven-win streak. Chefs kiss.",
		"🌟 You're in the ZONE. Don't stop!"
	],
	10: [
		"🏆 TEN WINS. Call your mom. She'd be proud.",
		"🤖 Are you a trading bot? This is illegal.",
		"🥇 x10 COMBO. Retire already!"
	],
	15: [
		"🦍 APE BRAIN ASCENDED. Pure instinct.",
		"🌍 The market is your puppet right now.",
		"🎰 At this point you're just cheating."
	]
};
function rollNarratorLine(combo) {
	for (const m of [
		15,
		10,
		7,
		5,
		3
	]) if (combo === m) {
		const lines = STREAK_NARRATOR[m];
		return lines[Math.floor(Math.random() * lines.length)];
	}
	return null;
}
var TILT_LINES = {
	3: [
		"😤 Three losses. Breathe.",
		"💢 The market is testing you.",
		"📉 Bad run — stay disciplined."
	],
	5: [
		"🔥 PC OVERHEATING. Fan at max.",
		"😡 FIVE losses. Walk away.",
		"💀 Tilt detected. Danger zone."
	],
	7: [
		"💥 YOUR MONITOR CRACKS. Keep going?",
		"🩸 Seven losses. The screen bleeds.",
		"🔨 You just punched the keyboard."
	]
};
var ctx$1 = null;
function ac$1() {
	if (typeof window === "undefined") return null;
	if (!ctx$1) try {
		ctx$1 = new (window.AudioContext || window.webkitAudioContext)();
	} catch {
		return null;
	}
	return ctx$1;
}
function blip(freq, dur = .08, type = "square", gain = .06) {
	const a = ac$1();
	if (!a) return;
	const o = a.createOscillator();
	const g = a.createGain();
	o.type = type;
	o.frequency.setValueAtTime(freq, a.currentTime);
	g.gain.setValueAtTime(gain, a.currentTime);
	g.gain.exponentialRampToValueAtTime(1e-4, a.currentTime + dur);
	o.connect(g).connect(a.destination);
	o.start();
	o.stop(a.currentTime + dur);
}
var sfx = {
	click: () => blip(520, .04, "square", .05),
	win: () => {
		blip(660, .06);
		setTimeout(() => blip(880, .09), 60);
	},
	lose: () => {
		blip(220, .09, "sawtooth", .08);
		setTimeout(() => blip(140, .15, "sawtooth", .07), 70);
	},
	coin: () => {
		blip(988, .05);
		setTimeout(() => blip(1319, .07), 40);
	},
	event: () => {
		blip(440, .08, "triangle");
		setTimeout(() => blip(660, .1, "triangle"), 90);
	},
	boss: () => {
		blip(110, .2, "sawtooth", .09);
		setTimeout(() => blip(82, .25, "sawtooth", .09), 180);
	},
	crash: () => {
		for (let i = 0; i < 6; i++) setTimeout(() => blip(300 - i * 40, .08, "sawtooth", .08), i * 60);
	},
	/** Rising fanfare for milestone streaks */
	streak: (combo) => {
		const base = 523;
		(combo >= 10 ? [
			base,
			base * 1.25,
			base * 1.5,
			base * 2
		] : [
			base,
			base * 1.25,
			base * 1.5
		]).forEach((f, i) => setTimeout(() => blip(f, .12, "square", .07), i * 80));
	},
	/** Dramatic impact for screen-hit tilt effect */
	tilt: () => {
		blip(80, .3, "sawtooth", .12);
		setTimeout(() => blip(55, .4, "sawtooth", .1), 120);
		setTimeout(() => blip(40, .5, "sawtooth", .08), 280);
	}
};
var MODES = [
	"BULL",
	"BEAR",
	"SIDEWAYS",
	"HIGH_VOL",
	"MEME",
	"BLACK_SWAN"
];
var INITIAL_CANDLES = 40;
var BASE_TARGET = 120;
var xpToLevel = (xp) => Math.floor(1 + Math.sqrt(xp / 25));
function makeFeed() {
	const f = createSimulatedFeed();
	f.prime(INITIAL_CANDLES);
	return f;
}
function useGame() {
	const feedRef = (0, import_react.useRef)(null);
	if (!feedRef.current) feedRef.current = makeFeed();
	const [tick, setTick] = (0, import_react.useState)(0);
	const [stats, setStats] = (0, import_react.useState)(() => initialStats());
	const [event, setEvent] = (0, import_react.useState)(null);
	const [floats, setFloats] = (0, import_react.useState)([]);
	const [shake, setShake] = (0, import_react.useState)(false);
	const [flash, setFlash] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(null);
	const [scanlines, setScanlines] = (0, import_react.useState)(true);
	const [paused, setPaused] = (0, import_react.useState)(false);
	const [news, setNews] = (0, import_react.useState)(["Welcome to Pixel Trader — predict the next candle."]);
	const [tiltLevel, setTiltLevel] = (0, import_react.useState)(0);
	const [gameLevel, setGameLevel] = (0, import_react.useState)(1);
	const [levelReached, setLevelReached] = (0, import_react.useState)(false);
	const [activeArtifacts, setActiveArtifacts] = (0, import_react.useState)([]);
	const artifactsRef = (0, import_react.useRef)([]);
	const gameLevelRef = (0, import_react.useRef)(1);
	const shieldUsedRef = (0, import_react.useRef)(0);
	const immortalRemainingRef = (0, import_react.useRef)(0);
	const freeCoffeeLevelsRef = (0, import_react.useRef)(0);
	const phoenixUsedRef = (0, import_react.useRef)(0);
	const consecutiveLossesRef = (0, import_react.useRef)(0);
	const reversalReadyRef = (0, import_react.useRef)(false);
	const totalTradesRef = (0, import_react.useRef)(0);
	const compoundWinsRef = (0, import_react.useRef)(0);
	const firstTradeRef = (0, import_react.useRef)(true);
	const hpLossMultRef = (0, import_react.useRef)(1);
	const eventIntervalBaseRef = (0, import_react.useRef)(16e3);
	const pendingRef = (0, import_react.useRef)(null);
	const tpSlTriggeredRef = (0, import_react.useRef)(false);
	const pendingEnterCandleRef = (0, import_react.useRef)(-1);
	const ownedItemsRef = (0, import_react.useRef)([]);
	const setOwnedItems = (0, import_react.useCallback)((items) => {
		ownedItemsRef.current = items;
	}, []);
	const startRef = (0, import_react.useRef)(Date.now());
	const lastEventRef = (0, import_react.useRef)(Date.now());
	const lastBossRef = (0, import_react.useRef)(Date.now());
	const lastDiffRef = (0, import_react.useRef)(Date.now());
	const lastTickerRef = (0, import_react.useRef)(Date.now());
	const timeoutsRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const trackedTimeout = (0, import_react.useCallback)((fn, ms) => {
		const id = setTimeout(() => {
			timeoutsRef.current.delete(id);
			fn();
		}, ms);
		timeoutsRef.current.add(id);
		return id;
	}, []);
	(0, import_react.useEffect)(() => () => {
		timeoutsRef.current.forEach((id) => clearTimeout(id));
		timeoutsRef.current.clear();
	}, []);
	(0, import_react.useEffect)(() => {
		pendingRef.current = pending;
	}, [pending]);
	const pushFloat = (0, import_react.useCallback)((text, color) => {
		const f = {
			id: Math.random().toString(36).slice(2),
			text,
			color,
			x: 50 + Math.random() * 20 - 10,
			y: 40 + Math.random() * 20 - 10,
			createdAt: Date.now()
		};
		setFloats((prev) => [...prev.slice(-12), f]);
		trackedTimeout(() => setFloats((prev) => prev.filter((x) => x.id !== f.id)), 1050);
	}, [trackedTimeout]);
	const addNews = (0, import_react.useCallback)((msg) => {
		setNews((n) => [msg, ...n].slice(0, 20));
	}, []);
	const resolvePending = (0, import_react.useCallback)((closed) => {
		setPending((p) => {
			if (!p) return null;
			const delta = closed.close - p.entry;
			const win = p.dir === "LONG" && delta > 0 || p.dir === "SHORT" && delta < 0;
			setStats((s) => {
				const arts = artifactsRef.current;
				const gear = ownedItemsRef.current;
				const pnl = Math.abs(delta / p.entry) * 1e3 * (1 + s.combo * .05);
				let ns = { ...s };
				totalTradesRef.current++;
				const effectiveWin = win || firstTradeRef.current && arts.includes("w_focus");
				const isFreeTurn = arts.includes("b_time_stop") && totalTradesRef.current % 8 === 0;
				const algoWin = !win && arts.includes("p_the_algo") && Math.random() < .1;
				const quantWin = !win && gear.includes("quant") && totalTradesRef.current % 5 === 0;
				const charAiWin = !win && gear.includes("char_ai") && totalTradesRef.current % 12 === 0;
				const hasLeverage = arts.includes("b_leverage");
				if (firstTradeRef.current) firstTradeRef.current = false;
				if (isFreeTurn) {
					pushFloat("⏸️ TIME STOP", "var(--neon-blue)");
					return ns;
				}
				if (effectiveWin || algoWin || quantWin || charAiWin) {
					if (algoWin && !win) pushFloat("🤖 ALGO WIN!", "var(--neon-magenta)");
					if (quantWin) pushFloat("🧠 QUANT WIN!", "var(--neon-blue)");
					if (charAiWin) pushFloat("🤖 AI WIN!", "var(--neon-blue)");
					const streakTier = Math.floor(ns.combo / 3);
					let streakMult = 1 + streakTier * .35;
					if (arts.includes("g_streak")) streakMult *= 1.1;
					if (arts.includes("gu_streak")) streakMult *= 1.2;
					if (arts.includes("b_oracle")) streakMult *= 1.25;
					if (gear.includes("char_swing")) streakMult *= 1.1;
					let gain = Math.round(pnl * streakMult);
					if (arts.includes("p_godmode")) gain = Math.round(gain * 1.4);
					if (arts.includes("b_leverage")) gain = Math.round(gain * 1.5);
					if (gear.includes("char_scalper")) gain = Math.round(gain * 1.05);
					if (gear.includes("char_day")) gain = Math.round(gain * 1.05);
					if (gear.includes("char_degen") && Math.random() < .5) gain *= 2;
					if (gear.includes("pet_frog") && p.dir === "LONG") gain = Math.round(gain * 1.06);
					if (gear.includes("pet_whale") && pnl > 60) gain = Math.round(gain * 1.1);
					ns.wins += 1;
					ns.combo += 1;
					ns.bestCombo = Math.max(ns.bestCombo, ns.combo);
					compoundWinsRef.current++;
					let coinGain = 5 + Math.floor(ns.combo * 1.5) + streakTier * 4;
					if (arts.includes("b_double_coins")) coinGain = Math.round(coinGain * 1.8);
					if (arts.includes("bu_double")) coinGain = Math.round(coinGain * 2.5);
					if (arts.includes("b_momentum")) coinGain += 4 + Math.floor(ns.combo * .5);
					if (arts.includes("g_coin_bonus")) coinGain += 4;
					if (arts.includes("g_journal") && ns.accuracy > 60) coinGain = Math.round(coinGain * 1.2);
					if (gear.includes("cat")) coinGain = Math.round(coinGain * 1.1);
					if (gear.includes("pet_cat")) coinGain = Math.round(coinGain * 1.1);
					if (gear.includes("pet_bull")) coinGain = Math.round(coinGain * 1.15);
					if (gear.includes("desk")) coinGain = Math.round(coinGain * 1.2);
					if (gear.includes("hedge")) coinGain = Math.round(coinGain * 1.5);
					if (gear.includes("mouse")) coinGain = Math.round(coinGain * 1.05);
					if (gear.includes("fiber")) coinGain += 2;
					if (gear.includes("kb")) coinGain += Math.max(0, streakTier);
					if (gear.includes("char_crypto_max") && (ns.mode === "MEME" || ns.mode === "HIGH_VOL")) coinGain = Math.round(coinGain * 1.2);
					if (gear.includes("pet_dragon") && ns.combo >= 5) coinGain = Math.round(coinGain * 1.25);
					if (gear.includes("quant") && totalTradesRef.current % 5 === 0) coinGain = Math.round(coinGain * 2);
					ns.coins += coinGain;
					ns.levelCoinsEarned += coinGain;
					let xpGain = 10 + ns.combo * 2 + streakTier * 5;
					if (arts.includes("w_xp")) xpGain = Math.round(xpGain * 1.2);
					ns.xp += xpGain;
					ns.profit += gain;
					ns.balance += gain;
					if (ns.combo % 5 === 0) ns.hp = Math.min(ns.maxHp, ns.hp + 8);
					if (arts.includes("g_combo_heal")) ns.hp = Math.min(ns.maxHp, ns.hp + 2);
					if (arts.includes("b_lifesteal")) ns.hp = Math.min(ns.maxHp, ns.hp + 3);
					if (gear.includes("pet_shark")) ns.hp = Math.min(ns.maxHp, ns.hp + 5);
					if (reversalReadyRef.current) {
						reversalReadyRef.current = false;
						ns.hp = Math.min(ns.maxHp, ns.hp + 20);
						pushFloat("🔄 REVERSAL +20 HP!", "var(--neon-green)");
					}
					consecutiveLossesRef.current = 0;
					if (gear.includes("luckysocks") && ns.combo >= 3) ns.hp = Math.min(ns.maxHp, ns.hp + 2);
					if (compoundWinsRef.current >= 10) {
						compoundWinsRef.current = 0;
						ns.coins += 100;
						ns.levelCoinsEarned += 100;
						pushFloat("📉 COMPOUND +100", "var(--neon-yellow)");
					}
					sfx.win();
					sfx.coin();
					pushFloat(`+$${gain}`, "var(--neon-green)");
					if (ns.combo >= 3) pushFloat(`x${ns.combo} STREAK`, "var(--neon-yellow)");
					if (streakTier >= 1 && ns.combo % 3 === 0) {
						pushFloat(`STREAK BONUS +${Math.round((streakMult - 1) * 100)}%`, "var(--neon-magenta)");
						addNews(`🔥 Streak tier ${streakTier + 1} — payouts x${streakMult.toFixed(2)}`);
					}
					setFlash("green");
					const target = Math.round(BASE_TARGET * gameLevelRef.current * (1 + (gameLevelRef.current - 1) * .3));
					if (ns.levelCoinsEarned >= target && !ns.gameOver) {
						setLevelReached(true);
						setPaused(true);
						pushFloat("🏆 LEVEL UP!", "var(--neon-yellow)");
						addNews(`🏆 Target reached — Level ${gameLevelRef.current + 1} unlocked!`);
					}
				} else {
					const loss = Math.round(pnl * .6);
					let hpLoss = Math.round((10 + Math.min(15, Math.floor(pnl / 40))) * hpLossMultRef.current);
					if (arts.includes("g_rr")) hpLoss = Math.round(hpLoss * .8);
					if (arts.includes("gu_rr")) hpLoss = Math.round(hpLoss * .65);
					if (freeCoffeeLevelsRef.current > 0) hpLoss = Math.round(hpLoss * .6);
					if (arts.includes("wu_coffee")) freeCoffeeLevelsRef.current > 0 && (hpLoss = Math.round(hpLoss * .5));
					if (gear.includes("hands")) hpLoss = Math.round(hpLoss * .75);
					if (gear.includes("coffee")) hpLoss = Math.round(hpLoss * .92);
					if (gear.includes("therapist")) hpLoss = Math.round(hpLoss * .85);
					if (hasLeverage) hpLoss = Math.round(hpLoss * 1.3);
					if (gear.includes("char_degen") && Math.random() < .5) hpLoss = Math.round(hpLoss * 2);
					if (arts.includes("g_insurance") && ns.hp < 25) hpLoss = Math.round(hpLoss * .5);
					if (gear.includes("pet_bear") && p.dir === "SHORT") hpLoss = Math.round(hpLoss * .94);
					ns.losses += 1;
					consecutiveLossesRef.current++;
					if (arts.includes("g_reversal") && consecutiveLossesRef.current >= 3) {
						reversalReadyRef.current = true;
						pushFloat("🔄 REVERSAL READY", "var(--neon-blue)");
					}
					const shieldsLeft = shieldUsedRef.current;
					if (shieldsLeft > 0) {
						shieldUsedRef.current = shieldsLeft - 1;
						pushFloat(`🛡️ SHIELD (${shieldsLeft - 1} left)`, "var(--neon-blue)");
					} else if (arts.includes("p_greed")) {
						if (ns.combo >= 3) addNews(`∞ Greed: streak ${ns.combo} → ${Math.floor(ns.combo / 2)}`);
						ns.combo = Math.floor(ns.combo / 2);
						pushFloat("∞ GREED!", "var(--neon-magenta)");
					} else {
						if (ns.combo >= 3) addNews(`💔 Streak broken at x${ns.combo}`);
						ns.combo = 0;
					}
					if (immortalRemainingRef.current > 0) {
						immortalRemainingRef.current--;
						pushFloat(`💎 IMMORTAL (${immortalRemainingRef.current} left)`, "var(--neon-blue)");
					} else if (gear.includes("dark_pool") && totalTradesRef.current <= 10) pushFloat("🌑 DARK POOL", "var(--neon-magenta)");
					else {
						ns.hp = Math.max(0, ns.hp - hpLoss);
						pushFloat(`-${hpLoss} HP`, "var(--neon-red)");
					}
					if (arts.includes("w_bandage")) ns.hp = Math.min(ns.maxHp, ns.hp + 3);
					ns.profit = Math.max(0, ns.profit - loss);
					ns.balance = Math.max(0, ns.balance - loss);
					sfx.lose();
					setFlash("red");
					setShake(true);
					trackedTimeout(() => setShake(false), 400);
				}
				ns.level = xpToLevel(ns.xp);
				const total = ns.wins + ns.losses;
				ns.accuracy = total ? Math.round(ns.wins / total * 100) : 0;
				if (ns.hp <= 0) {
					const maxRevives = arts.includes("pu_phoenix") ? 2 : arts.includes("p_phoenix") ? 1 : 0;
					if (phoenixUsedRef.current < maxRevives) {
						phoenixUsedRef.current++;
						ns.hp = arts.includes("pu_phoenix") ? 75 : 60;
						pushFloat("🦅 PHOENIX REVIVAL!", "var(--neon-magenta)");
						addNews("🦅 Phoenix Soul activates — revived!");
					} else {
						ns.gameOver = true;
						setPaused(true);
					}
				}
				if (win || algoWin || quantWin || charAiWin) {
					const line = rollNarratorLine(ns.combo);
					if (line) {
						addNews(`🎙️ ${line}`);
						sfx.streak(ns.combo);
					}
				}
				const consLoss = consecutiveLossesRef.current;
				const newTilt = consLoss >= 7 ? 3 : consLoss >= 5 ? 2 : consLoss >= 3 ? 1 : 0;
				setTiltLevel(newTilt);
				if (newTilt > 0 && !win && consLoss === [
					3,
					5,
					7
				][newTilt - 1]) {
					const lines = TILT_LINES[consLoss];
					if (lines) addNews(`💢 ${lines[Math.floor(Math.random() * lines.length)]}`);
					if (newTilt >= 2) sfx.tilt();
					if (newTilt >= 2) {
						setShake(true);
						trackedTimeout(() => setShake(false), 700);
					}
				}
				if (win) setTiltLevel(0);
				if (gear.includes("girlfriend") && !win && Math.random() < .4) {
					addNews("💃 Girlfriend called. You missed the move.");
					pushFloat("💃 DISTRACTED!", "var(--neon-magenta)");
				}
				trackedTimeout(() => setFlash(null), 400);
				return ns;
			});
			return null;
		});
	}, [
		pushFloat,
		trackedTimeout,
		addNews
	]);
	const addArtifact = (0, import_react.useCallback)((id) => {
		if (artifactsRef.current.includes(id)) return;
		artifactsRef.current = [...artifactsRef.current, id];
		setActiveArtifacts(artifactsRef.current);
		if (id === "w_maxhp") setStats((s) => ({
			...s,
			maxHp: s.maxHp + 12,
			hp: Math.min(s.maxHp + 12, s.hp + 12)
		}));
		if (id === "p_slow") {
			const f = feedRef.current;
			if (f) f.setSpeedMs(Math.round(f.getSpeedMs() * 1.25));
		}
		if (id === "p_immortal") immortalRemainingRef.current = 4;
		if (id === "pu_immortal") immortalRemainingRef.current = 7;
		if (id === "p_phoenix" || id === "pu_phoenix") phoenixUsedRef.current = 0;
		if (id === "w_coffee") freeCoffeeLevelsRef.current += 3;
		if (id === "wu_coffee") freeCoffeeLevelsRef.current += 5;
		if (id === "b_shield") shieldUsedRef.current = 1;
		if (id === "bu_shield2") shieldUsedRef.current = 2;
		if (id === "w_focus") firstTradeRef.current = true;
	}, []);
	const nextLevel = (0, import_react.useCallback)(() => {
		const f = feedRef.current;
		const speedCut = 200 + gameLevelRef.current * 20;
		f.setSpeedMs(Math.max(300, f.getSpeedMs() - speedCut));
		eventIntervalBaseRef.current = Math.max(4e3, eventIntervalBaseRef.current - 2500);
		hpLossMultRef.current = Math.min(3, 1 + gameLevelRef.current * .2);
		setLevelReached(false);
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
			let ns = {
				...s,
				levelCoinsEarned: 0
			};
			if (arts.includes("wu_hp")) ns.hp = Math.min(ns.maxHp, ns.hp + 25 * newLevel);
			else if (arts.includes("w_hp")) ns.hp = Math.min(ns.maxHp, ns.hp + 15 * newLevel);
			if (arts.includes("w_coins")) ns.coins += 15 * newLevel;
			if (arts.includes("g_coffee_addict")) ns.coins += 40;
			return ns;
		});
		addNews(`⚡ Level ${newLevel} — candles faster, market wilder! HP loss x${hpLossMultRef.current.toFixed(1)}`);
	}, [addNews]);
	const pausedRef = (0, import_react.useRef)(paused);
	(0, import_react.useEffect)(() => {
		pausedRef.current = paused;
	}, [paused]);
	(0, import_react.useEffect)(() => {
		let raf = 0;
		let last = performance_default.now();
		const loop = (now) => {
			const dt = Math.min(64, now - last);
			last = now;
			if (!pausedRef.current && feedRef.current) {
				const closed = feedRef.current.next(dt);
				if (closed) {
					if (!tpSlTriggeredRef.current) resolvePending(closed);
					tpSlTriggeredRef.current = false;
				}
				setTick((t) => t + 1 & 65535);
				const p = pendingRef.current;
				if (p && !tpSlTriggeredRef.current) {
					const cur = feedRef.current.peek();
					if (cur.t !== pendingEnterCandleRef.current) {
						const isLong = p.dir === "LONG";
						const tp = p.entry * (isLong ? 1.015 : .985);
						const sl = p.entry * (isLong ? .99 : 1.01);
						const tpHit = isLong ? cur.high >= tp : cur.low <= tp;
						const slHit = isLong ? cur.low <= sl : cur.high >= sl;
						if (tpHit || slHit) {
							tpSlTriggeredRef.current = true;
							const synthClose = tpHit ? tp : sl;
							resolvePending({
								...cur,
								close: synthClose
							});
						}
					}
				}
				const nowMs = Date.now();
				setStats((s) => s.survivalMs === nowMs - startRef.current ? s : {
					...s,
					survivalMs: nowMs - startRef.current
				});
				if (nowMs - lastDiffRef.current > 6e4) {
					lastDiffRef.current = nowMs;
					const f = feedRef.current;
					f.setSpeedMs(f.getSpeedMs() - 150);
					addNews("⚡ Difficulty increased — candles speed up.");
				}
				if (nowMs - lastEventRef.current > eventIntervalBaseRef.current + Math.random() * 12e3) {
					lastEventRef.current = nowMs;
					const e = rollEvent();
					setEvent(e);
					feedRef.current.setBiasBoost(e.bias, e.volMult, e.ttl * 1e3);
					sfx.event();
					addNews(`${e.title} — ${e.subtitle ?? ""}`);
					if (e.kind === "FLASH_CRASH") {
						sfx.crash();
						feedRef.current.applyShock(-.02);
						setShake(true);
						trackedTimeout(() => setShake(false), 500);
					}
					if (e.kind === "SHORT_SQUEEZE") feedRef.current.applyShock(.02);
					if (e.kind === "WHALE") feedRef.current.applyShock(e.bias > 0 ? .015 : -.015);
					const ttlMs = e.ttl * 1e3;
					trackedTimeout(() => setEvent((cur) => cur && cur.id === e.id ? null : cur), ttlMs);
				}
				if (nowMs - lastBossRef.current > 3 * 6e4) {
					lastBossRef.current = nowMs;
					const b = rollBoss();
					setEvent(b);
					feedRef.current.setBiasBoost(b.bias, b.volMult, b.ttl * 1e3);
					sfx.boss();
					addNews(b.title);
					trackedTimeout(() => setEvent((cur) => cur && cur.id === b.id ? null : cur), b.ttl * 1e3);
				}
				if (nowMs - lastTickerRef.current > 8e3 + Math.random() * 4e3) {
					lastTickerRef.current = nowMs;
					addNews(`📰 ${rollNewsTicker()}`);
				}
				if (Math.random() < 6e-4) {
					const m = MODES[Math.floor(Math.random() * MODES.length)];
					feedRef.current.setMode(m);
					setStats((s) => ({
						...s,
						mode: m
					}));
					addNews(`Market regime: ${m}`);
				}
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [
		resolvePending,
		addNews,
		trackedTimeout
	]);
	const predict = (0, import_react.useCallback)((p) => {
		if (stats.gameOver) return;
		sfx.click();
		if (p === "SKIP") {
			setStats((s) => ({
				...s,
				skips: s.skips + 1
			}));
			return;
		}
		const cur = feedRef.current.peek();
		const entry = cur.close;
		tpSlTriggeredRef.current = false;
		pendingEnterCandleRef.current = cur.t;
		setPending({
			dir: p,
			entry,
			at: Date.now()
		});
	}, [stats.gameOver]);
	const reset = (0, import_react.useCallback)(() => {
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
		hpLossMultRef.current = 1;
		eventIntervalBaseRef.current = 16e3;
		startRef.current = Date.now();
		lastEventRef.current = Date.now();
		lastBossRef.current = Date.now();
		lastDiffRef.current = Date.now();
		lastTickerRef.current = Date.now();
		setNews(["🆕 New run — good luck out there, trader."]);
	}, []);
	const spendCoins = (0, import_react.useCallback)((n) => {
		setStats((s) => ({
			...s,
			coins: Math.max(0, s.coins - n)
		}));
	}, []);
	const addCoins = (0, import_react.useCallback)((n) => {
		setStats((s) => ({
			...s,
			coins: s.coins + n,
			levelCoinsEarned: s.levelCoinsEarned + n
		}));
		pushFloat(`+${n} 🪙 MISSION!`, "var(--neon-yellow)");
	}, [pushFloat]);
	/** Apply one-time effect of a purchased shop item (used for consumables). */
	const applyItemEffect = (0, import_react.useCallback)((id) => {
		if (id === "hp_potion") {
			setStats((s) => ({
				...s,
				hp: Math.min(s.maxHp, s.hp + 25)
			}));
			pushFloat("+25 HP", "var(--neon-green)");
		}
	}, [pushFloat]);
	const feed = feedRef.current;
	const levelTarget = Math.round(BASE_TARGET * gameLevel * (1 + (gameLevel - 1) * .3));
	return (0, import_react.useMemo)(() => ({
		feed,
		stats,
		event,
		floats,
		shake,
		flash,
		pending,
		scanlines,
		paused,
		news,
		tick,
		gameLevel,
		levelTarget,
		levelReached,
		activeArtifacts,
		tiltLevel,
		setScanlines,
		setPaused,
		predict,
		reset,
		spendCoins,
		addCoins,
		applyItemEffect,
		addArtifact,
		nextLevel,
		setOwnedItems
	}), [
		feed,
		stats,
		event,
		floats,
		shake,
		flash,
		pending,
		scanlines,
		paused,
		news,
		tick,
		gameLevel,
		levelTarget,
		levelReached,
		activeArtifacts,
		tiltLevel,
		predict,
		reset,
		spendCoins,
		addCoins,
		applyItemEffect,
		addArtifact,
		nextLevel,
		setOwnedItems
	]);
}
function initialStats() {
	return {
		hp: 100,
		maxHp: 100,
		coins: 50,
		balance: 1e3,
		profit: 0,
		xp: 0,
		level: 1,
		combo: 0,
		bestCombo: 0,
		wins: 0,
		losses: 0,
		skips: 0,
		accuracy: 0,
		reactionMs: 0,
		survivalMs: 0,
		mode: "SIDEWAYS",
		gameOver: false,
		levelCoinsEarned: 0
	};
}
function calcEMA(data, period) {
	const k = 2 / (period + 1);
	const out = [];
	let prev = data[0];
	for (const d of data) {
		prev = d * k + prev * (1 - k);
		out.push(prev);
	}
	return out;
}
function calcSMA(data, period) {
	return data.map((_, i) => {
		if (i < period - 1) return NaN;
		return data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
	});
}
function CandleChart({ feed, tick, className, entryPrice, entryDir, ownedIndicators = [] }) {
	const canvasRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const c = canvasRef.current;
		if (!c) return;
		const parent = c.parentElement;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const resize = () => {
			c.width = parent.clientWidth * dpr;
			c.height = parent.clientHeight * dpr;
			c.style.width = parent.clientWidth + "px";
			c.style.height = parent.clientHeight + "px";
		};
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(parent);
		return () => ro.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		const c = canvasRef.current;
		if (!c) return;
		const ctx = c.getContext("2d");
		if (!ctx) return;
		const W = c.width, H = c.height;
		ctx.clearRect(0, 0, W, H);
		const bg = ctx.createLinearGradient(0, 0, 0, H);
		bg.addColorStop(0, "#0b0e1a");
		bg.addColorStop(1, "#050710");
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, W, H);
		const history = feed.history();
		const cur = feed.peek();
		const view = [...history, cur].slice(-80).filter((k) => Number.isFinite(k.close) && Number.isFinite(k.high) && Number.isFinite(k.low));
		if (view.length < 1) return;
		const highs = view.map((k) => k.high);
		const lows = view.map((k) => k.low);
		let max = Math.max(...highs);
		let min = Math.min(...lows);
		if (max === min) {
			max += 1;
			min -= 1;
		}
		const pad = (max - min) * .15 || max * .01;
		max += pad;
		min -= pad;
		const cwPx = W / view.length;
		const bodyW = Math.max(2 * (window.devicePixelRatio || 1), cwPx * .62);
		const yOf = (p) => H - (p - min) / (max - min) * H;
		ctx.strokeStyle = "rgba(120,130,180,0.10)";
		ctx.lineWidth = 1;
		for (let i = 1; i < 6; i++) {
			const y = H / 6 * i;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(W, y);
			ctx.stroke();
		}
		for (let i = 1; i < 10; i++) {
			const x = W / 10 * i;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, H);
			ctx.stroke();
		}
		ctx.fillStyle = "rgba(180,200,220,0.55)";
		ctx.font = `${11 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
		for (let i = 0; i <= 5; i++) {
			const p = max - (max - min) / 5 * i;
			ctx.fillText(p.toFixed(1), 6, H / 5 * i + 12);
		}
		if (ownedIndicators.includes("ind_vol")) {
			const volHeight = H * .12;
			const maxVol = Math.max(...view.map((k) => k.volume || 1));
			view.forEach((k, i) => {
				const x = i * cwPx + cwPx / 2;
				const vH = (k.volume || 1) / maxVol * volHeight;
				ctx.fillStyle = k.close >= k.open ? "rgba(74,222,128,0.25)" : "rgba(244,63,94,0.25)";
				ctx.fillRect(x - bodyW / 2, H - vH, bodyW, vH);
			});
		}
		view.forEach((k, i) => {
			const x = i * cwPx + cwPx / 2;
			const up = k.close >= k.open;
			const color = up ? "#4ade80" : "#f43f5e";
			const glow = up ? "rgba(74,222,128,0.55)" : "rgba(244,63,94,0.55)";
			ctx.strokeStyle = color;
			ctx.lineWidth = Math.max(1, window.devicePixelRatio || 1);
			ctx.beginPath();
			ctx.moveTo(x, yOf(k.high));
			ctx.lineTo(x, yOf(k.low));
			ctx.stroke();
			const bodyTop = yOf(Math.max(k.open, k.close));
			const bodyBot = yOf(Math.min(k.open, k.close));
			ctx.fillStyle = color;
			ctx.shadowColor = glow;
			ctx.shadowBlur = i === view.length - 1 ? 16 : 4;
			ctx.fillRect(x - bodyW / 2, bodyTop, bodyW, Math.max(1, bodyBot - bodyTop));
			ctx.shadowBlur = 0;
		});
		if (ownedIndicators.includes("ind_ema")) {
			const ema = calcEMA(view.map((k) => k.close), 14);
			ctx.strokeStyle = "#f59e0b";
			ctx.lineWidth = 1.5 * (window.devicePixelRatio || 1);
			ctx.setLineDash([]);
			ctx.beginPath();
			let started = false;
			ema.forEach((v, i) => {
				if (!Number.isFinite(v)) return;
				const x = i * cwPx + cwPx / 2;
				if (!started) {
					ctx.moveTo(x, yOf(v));
					started = true;
				} else ctx.lineTo(x, yOf(v));
			});
			ctx.stroke();
			ctx.font = `${10 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
			ctx.fillStyle = "#f59e0b";
			ctx.fillText("EMA14", 4, 38);
		}
		if (ownedIndicators.includes("ind_ma")) {
			const sma = calcSMA(view.map((k) => k.close), 20);
			ctx.strokeStyle = "#a78bfa";
			ctx.lineWidth = 1.5 * (window.devicePixelRatio || 1);
			ctx.setLineDash([]);
			ctx.beginPath();
			let started = false;
			sma.forEach((v, i) => {
				if (!Number.isFinite(v)) return;
				const x = i * cwPx + cwPx / 2;
				if (!started) {
					ctx.moveTo(x, yOf(v));
					started = true;
				} else ctx.lineTo(x, yOf(v));
			});
			ctx.stroke();
			ctx.font = `${10 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
			ctx.fillStyle = "#a78bfa";
			ctx.fillText("MA20", 4, 52);
		}
		if (ownedIndicators.includes("ind_vwap")) {
			let cumPV = 0, cumVol = 0;
			ctx.strokeStyle = "#38bdf8";
			ctx.lineWidth = 1.5 * (window.devicePixelRatio || 1);
			ctx.setLineDash([4, 3]);
			ctx.beginPath();
			view.forEach((k, i) => {
				const v = k.volume || 1;
				cumPV += (k.high + k.low + k.close) / 3 * v;
				cumVol += v;
				const vwap = cumPV / cumVol;
				const x = i * cwPx + cwPx / 2;
				if (i === 0) ctx.moveTo(x, yOf(vwap));
				else ctx.lineTo(x, yOf(vwap));
			});
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.font = `${10 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
			ctx.fillStyle = "#38bdf8";
			ctx.fillText("VWAP", 4, 66);
		}
		if (ownedIndicators.includes("ind_sr")) {
			const recent = view.slice(-20);
			const hi = Math.max(...recent.map((k) => k.high));
			const lo = Math.min(...recent.map((k) => k.low));
			ctx.lineWidth = 1 * (window.devicePixelRatio || 1);
			ctx.setLineDash([5, 5]);
			ctx.strokeStyle = "rgba(74,222,128,0.6)";
			ctx.beginPath();
			ctx.moveTo(0, yOf(lo));
			ctx.lineTo(W, yOf(lo));
			ctx.stroke();
			ctx.strokeStyle = "rgba(244,63,94,0.6)";
			ctx.beginPath();
			ctx.moveTo(0, yOf(hi));
			ctx.lineTo(W, yOf(hi));
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.font = `${10 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
			ctx.fillStyle = "rgba(74,222,128,0.8)";
			ctx.fillText(`SUP ${lo.toFixed(1)}`, 4, yOf(lo) - 3);
			ctx.fillStyle = "rgba(244,63,94,0.8)";
			ctx.fillText(`RES ${hi.toFixed(1)}`, 4, yOf(hi) + 12);
		}
		if (ownedIndicators.includes("ind_bb") && view.length >= 20) {
			const period = 20;
			const closes = view.map((k) => k.close);
			const bands = [];
			for (let i = 0; i < closes.length; i++) {
				if (i < period - 1) {
					bands.push({
						mid: NaN,
						up: NaN,
						dn: NaN
					});
					continue;
				}
				const slice = closes.slice(i - period + 1, i + 1);
				const mean = slice.reduce((a, b) => a + b, 0) / period;
				const std = Math.sqrt(slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period);
				bands.push({
					mid: mean,
					up: mean + 2 * std,
					dn: mean - 2 * std
				});
			}
			const drawBand = (vals, color) => {
				ctx.strokeStyle = color;
				ctx.lineWidth = 1 * (window.devicePixelRatio || 1);
				ctx.setLineDash([3, 3]);
				ctx.beginPath();
				let started = false;
				vals.forEach((v, i) => {
					if (!Number.isFinite(v)) return;
					const x = i * cwPx + cwPx / 2;
					if (!started) {
						ctx.moveTo(x, yOf(v));
						started = true;
					} else ctx.lineTo(x, yOf(v));
				});
				ctx.stroke();
				ctx.setLineDash([]);
			};
			drawBand(bands.map((b) => b.up), "rgba(251,191,36,0.6)");
			drawBand(bands.map((b) => b.dn), "rgba(251,191,36,0.6)");
			drawBand(bands.map((b) => b.mid), "rgba(251,191,36,0.35)");
			ctx.font = `${10 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
			ctx.fillStyle = "rgba(251,191,36,0.8)";
			ctx.fillText("BB20", 4, 80);
		}
		if (ownedIndicators.includes("ind_fib") && view.length >= 10) {
			const window20 = view.slice(-30);
			const swingHigh = Math.max(...window20.map((k) => k.high));
			const range = swingHigh - Math.min(...window20.map((k) => k.low));
			const fibLevels = [
				0,
				.236,
				.382,
				.5,
				.618,
				.786,
				1
			];
			const fibColors = [
				"#f87171",
				"#fb923c",
				"#fbbf24",
				"#a3e635",
				"#34d399",
				"#22d3ee",
				"#818cf8"
			];
			ctx.setLineDash([4, 6]);
			ctx.lineWidth = 1;
			fibLevels.forEach((ratio, fi) => {
				const price = swingHigh - range * ratio;
				const fy = yOf(price);
				ctx.strokeStyle = fibColors[fi] + "70";
				ctx.beginPath();
				ctx.moveTo(0, fy);
				ctx.lineTo(W, fy);
				ctx.stroke();
				const dpr = window.devicePixelRatio || 1;
				ctx.font = `${9 * dpr}px "VT323", monospace`;
				ctx.fillStyle = fibColors[fi] + "cc";
				ctx.fillText(`${(ratio * 100).toFixed(1)}% ${price.toFixed(1)}`, W * .62, fy - 3);
			});
			ctx.setLineDash([]);
		}
		if (ownedIndicators.includes("ind_smc") && view.length >= 4) {
			const dpr = window.devicePixelRatio || 1;
			ctx.font = `${9 * dpr}px "VT323", monospace`;
			let fvgCount = 0;
			for (let i = view.length - 3; i >= 1 && fvgCount < 5; i--) {
				const c0 = view[i - 1], c2 = view[i + 1];
				if (c0.high < c2.low - (max - min) * .003) {
					const x0 = (i - 1) * cwPx;
					const xEnd = W;
					ctx.fillStyle = "rgba(74,222,128,0.08)";
					ctx.fillRect(x0, yOf(c2.low), xEnd - x0, yOf(c0.high) - yOf(c2.low));
					ctx.strokeStyle = "rgba(74,222,128,0.4)";
					ctx.lineWidth = 1;
					ctx.setLineDash([3, 3]);
					ctx.beginPath();
					ctx.moveTo(x0, yOf(c0.high));
					ctx.lineTo(xEnd, yOf(c0.high));
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(x0, yOf(c2.low));
					ctx.lineTo(xEnd, yOf(c2.low));
					ctx.stroke();
					ctx.setLineDash([]);
					ctx.fillStyle = "rgba(74,222,128,0.7)";
					ctx.fillText("FVG", x0 + 2, yOf((c0.high + c2.low) / 2) + 4);
					fvgCount++;
				}
				if (c0.low > c2.high + (max - min) * .003) {
					const x0 = (i - 1) * cwPx;
					const xEnd = W;
					ctx.fillStyle = "rgba(244,63,94,0.08)";
					ctx.fillRect(x0, yOf(c0.low), xEnd - x0, yOf(c2.high) - yOf(c0.low));
					ctx.strokeStyle = "rgba(244,63,94,0.4)";
					ctx.lineWidth = 1;
					ctx.setLineDash([3, 3]);
					ctx.beginPath();
					ctx.moveTo(x0, yOf(c0.low));
					ctx.lineTo(xEnd, yOf(c0.low));
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(x0, yOf(c2.high));
					ctx.lineTo(xEnd, yOf(c2.high));
					ctx.stroke();
					ctx.setLineDash([]);
					ctx.fillStyle = "rgba(244,63,94,0.7)";
					ctx.fillText("FVG", x0 + 2, yOf((c0.low + c2.high) / 2) + 4);
					fvgCount++;
				}
			}
			for (let i = 2; i < view.length - 2; i++) {
				const bullImpulse = view[i].close > view[i].open && view[i + 1].close > view[i + 1].open && view[i - 1].close < view[i - 1].open;
				const bearImpulse = view[i].close < view[i].open && view[i + 1].close < view[i + 1].open && view[i - 1].close > view[i - 1].open;
				if (bullImpulse) {
					const ob = view[i - 1];
					const x = (i - 1) * cwPx;
					ctx.strokeStyle = "rgba(96,165,250,0.7)";
					ctx.lineWidth = 1.5 * dpr;
					ctx.setLineDash([]);
					ctx.strokeRect(x, yOf(Math.max(ob.open, ob.close)), cwPx, Math.abs(yOf(ob.open) - yOf(ob.close)));
					ctx.fillStyle = "rgba(96,165,250,0.5)";
					ctx.fillText("OB", x + 2, yOf(Math.max(ob.open, ob.close)) + 10 * dpr);
				}
				if (bearImpulse) {
					const ob = view[i - 1];
					const x = (i - 1) * cwPx;
					ctx.strokeStyle = "rgba(251,146,60,0.7)";
					ctx.lineWidth = 1.5 * dpr;
					ctx.strokeRect(x, yOf(Math.max(ob.open, ob.close)), cwPx, Math.abs(yOf(ob.open) - yOf(ob.close)));
					ctx.fillStyle = "rgba(251,146,60,0.5)";
					ctx.fillText("OB", x + 2, yOf(Math.max(ob.open, ob.close)) + 10 * dpr);
				}
			}
			if (view.length >= 5) {
				const prev4 = view.slice(-6, -1);
				const prevHigh = Math.max(...prev4.map((k) => k.high));
				const prevLow = Math.min(...prev4.map((k) => k.low));
				const last = view[view.length - 1];
				const cx = (view.length - 1) * cwPx + cwPx / 2;
				if (last.high > prevHigh * 1.002 && last.close < prevHigh) {
					ctx.strokeStyle = "#f87171";
					ctx.lineWidth = 2 * dpr;
					ctx.beginPath();
					ctx.moveTo(cx - 6 * dpr, yOf(last.high) - 10 * dpr);
					ctx.lineTo(cx, yOf(last.high));
					ctx.lineTo(cx + 6 * dpr, yOf(last.high) - 10 * dpr);
					ctx.stroke();
					ctx.fillStyle = "#f87171";
					ctx.fillText("SWEEP", cx - 14 * dpr, yOf(last.high) - 14 * dpr);
				}
				if (last.low < prevLow * .998 && last.close > prevLow) {
					ctx.strokeStyle = "#4ade80";
					ctx.lineWidth = 2 * dpr;
					ctx.beginPath();
					ctx.moveTo(cx - 6 * dpr, yOf(last.low) + 10 * dpr);
					ctx.lineTo(cx, yOf(last.low));
					ctx.lineTo(cx + 6 * dpr, yOf(last.low) + 10 * dpr);
					ctx.stroke();
					ctx.fillStyle = "#4ade80";
					ctx.fillText("SWEEP", cx - 14 * dpr, yOf(last.low) + 22 * dpr);
				}
			}
		}
		const lastY = yOf(cur.close);
		ctx.strokeStyle = "rgba(250,204,21,0.6)";
		ctx.setLineDash([6, 6]);
		ctx.beginPath();
		ctx.moveTo(0, lastY);
		ctx.lineTo(W, lastY);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.fillStyle = "#facc15";
		ctx.fillRect(W - 78, lastY - 10, 74, 20);
		ctx.fillStyle = "#0b0e1a";
		ctx.font = `bold ${12 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
		ctx.fillText(cur.close.toFixed(2), W - 72, lastY + 6);
		if (entryPrice != null && Number.isFinite(entryPrice)) {
			const eY = yOf(entryPrice);
			const isLong = entryDir === "LONG";
			const color = isLong ? "#4ade80" : "#f43f5e";
			ctx.strokeStyle = color;
			ctx.lineWidth = 2 * (window.devicePixelRatio || 1);
			ctx.setLineDash([10, 6]);
			ctx.beginPath();
			ctx.moveTo(0, eY);
			ctx.lineTo(W, eY);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.fillStyle = cur.close >= entryPrice === isLong ? "rgba(74,222,128,0.10)" : "rgba(244,63,94,0.10)";
			ctx.fillRect(0, Math.min(eY, lastY), W, Math.abs(lastY - eY));
			const label = `${isLong ? "▲ LONG" : "▼ SHORT"} @ ${entryPrice.toFixed(2)}`;
			ctx.font = `bold ${11 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
			const w = ctx.measureText(label).width + 12;
			ctx.fillStyle = color;
			ctx.fillRect(4, eY - 10, w, 20);
			ctx.fillStyle = "#0b0e1a";
			ctx.fillText(label, 10, eY + 5);
			const tpPrice = entryPrice * (isLong ? 1.015 : .985);
			const slPrice = entryPrice * (isLong ? .99 : 1.01);
			const tpY = yOf(tpPrice);
			const slY = yOf(slPrice);
			const dpr2 = window.devicePixelRatio || 1;
			ctx.strokeStyle = "rgba(74,222,128,0.9)";
			ctx.lineWidth = 1.5 * dpr2;
			ctx.setLineDash([6, 4]);
			ctx.beginPath();
			ctx.moveTo(0, tpY);
			ctx.lineTo(W, tpY);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.fillStyle = "#4ade80";
			ctx.fillRect(W - 38, tpY - 9, 36, 18);
			ctx.fillStyle = "#0b0e1a";
			ctx.font = `bold ${10 * dpr2}px "VT323", monospace`;
			ctx.fillText("TP", W - 30, tpY + 5);
			ctx.strokeStyle = "rgba(244,63,94,0.9)";
			ctx.lineWidth = 1.5 * dpr2;
			ctx.setLineDash([6, 4]);
			ctx.beginPath();
			ctx.moveTo(0, slY);
			ctx.lineTo(W, slY);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.fillStyle = "#f43f5e";
			ctx.fillRect(W - 38, slY - 9, 36, 18);
			ctx.fillStyle = "#0b0e1a";
			ctx.fillText("SL", W - 30, slY + 5);
		}
		try {
			const pat = feed.currentPattern();
			const prog = Math.round(feed.patternProgress() * 100);
			ctx.font = `${12 * (window.devicePixelRatio || 1)}px "VT323", monospace`;
			const text = `PATTERN: ${pat}  ${prog}%`;
			const tw = ctx.measureText(text).width + 10;
			ctx.fillStyle = "rgba(11,14,26,0.75)";
			ctx.fillRect(W - tw - 6, 6, tw, 22);
			ctx.strokeStyle = "rgba(120,180,255,0.4)";
			ctx.strokeRect(W - tw - 6, 6, tw, 22);
			ctx.fillStyle = "#8fb6ff";
			ctx.fillText(text, W - tw - 1, 22);
		} catch {}
	}, [
		tick,
		feed,
		entryPrice,
		entryDir
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative w-full h-full " + (className ?? ""),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "w-full h-full block"
		})
	});
}
var nf = new Intl.NumberFormat("en-US");
var fmt = (n) => nf.format(Math.round(n));
function Stat({ label, value, color = "text-neon-green" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-start gap-1 px-3 py-2 pixel-panel min-w-[92px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-pixel text-[9px] text-muted-foreground uppercase tracking-wider",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `font-pixel text-xs sm:text-sm ${color}`,
			children: value
		})]
	});
}
function HUD({ stats, gameLevel, levelTarget }) {
	const hpPct = stats.hp / stats.maxHp * 100;
	const nextLvlXp = stats.level * stats.level * 25;
	const prevLvlXp = (stats.level - 1) * (stats.level - 1) * 25;
	const xpPct = (stats.xp - prevLvlXp) / Math.max(1, nextLvlXp - prevLvlXp) * 100;
	const targetPct = Math.min(100, stats.levelCoinsEarned / levelTarget * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full pixel-panel p-3 flex flex-wrap gap-2 items-stretch",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1 flex-1 min-w-[240px] px-3 py-2 pixel-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between font-pixel text-[10px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-neon-red",
							children: "HP"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-neon-red",
							children: [
								stats.hp,
								"/",
								stats.maxHp
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-3 w-full bg-terminal border-2 border-border overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-[var(--neon-red)] transition-all",
							style: {
								width: `${hpPct}%`,
								boxShadow: "0 0 12px var(--neon-red)"
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between font-pixel text-[10px] mt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-neon-blue",
							children: ["LVL ", stats.level]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-neon-blue",
							children: ["XP ", stats.xp]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-2 w-full bg-terminal border-2 border-border overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-[var(--neon-blue)] transition-all",
							style: {
								width: `${xpPct}%`,
								boxShadow: "0 0 10px var(--neon-blue)"
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between font-pixel text-[10px] mt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-neon-yellow",
							children: ["GLV ", gameLevel]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-neon-yellow",
							children: [
								"🎯 ",
								stats.levelCoinsEarned,
								"/",
								levelTarget
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-2 w-full bg-terminal border-2 border-border overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-[var(--neon-yellow)] transition-all",
							style: {
								width: `${targetPct}%`,
								boxShadow: "0 0 8px var(--neon-yellow)"
							}
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Coins",
				value: `🪙 ${stats.coins}`,
				color: "text-neon-yellow"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Balance",
				value: `$${fmt(stats.balance)}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Profit",
				value: `$${fmt(stats.profit)}`,
				color: stats.profit >= 0 ? "text-neon-green" : "text-neon-red"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Combo",
				value: `x${stats.combo}`,
				color: "text-neon-yellow"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Best",
				value: `x${stats.bestCombo}`,
				color: "text-neon-magenta"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Acc",
				value: `${stats.accuracy}%`,
				color: "text-neon-blue"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Mode",
				value: stats.mode,
				color: "text-neon-magenta"
			})
		]
	});
}
var tradeBtn = "flex-1 py-6 sm:py-7 font-pixel text-sm sm:text-lg uppercase tracking-widest select-none active:translate-y-1 transition-transform";
function ActionBar({ onPredict, pending, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full pixel-panel p-3 flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between font-pixel text-[10px] text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PREDICT NEXT CANDLE" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-neon-yellow",
					children: pending ? `PENDING: ${pending.dir} @ ${pending.entry.toFixed(2)}` : "READY"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled,
						onClick: () => onPredict("LONG"),
						className: `${tradeBtn} neon-green-glow bg-[color-mix(in_oklab,var(--neon-green)_18%,transparent)] text-neon-green disabled:opacity-40`,
						children: "🟢 LONG"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled,
						onClick: () => onPredict("SHORT"),
						className: `${tradeBtn} neon-red-glow bg-[color-mix(in_oklab,var(--neon-red)_18%,transparent)] text-neon-red disabled:opacity-40`,
						children: "🔴 SHORT"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled,
						onClick: () => onPredict("SKIP"),
						className: "px-3 py-2 font-pixel text-[9px] uppercase text-muted-foreground pixel-panel opacity-50 hover:opacity-75 disabled:opacity-20 transition-opacity self-stretch flex items-center",
						title: "Skip this candle (S)",
						children: "⏭"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "font-term text-[11px] text-muted-foreground text-center",
				children: [
					"Hotkeys: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-neon-green",
						children: "A"
					}),
					" LONG · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-neon-red",
						children: "D"
					}),
					" SHORT · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "S"
					}),
					" skip"
				]
			})
		]
	});
}
function PanelTitle({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "font-pixel text-[10px] text-neon-blue mb-2 uppercase tracking-widest",
		children
	});
}
var LEADERBOARD = [
	{
		name: "SATOSHI",
		score: 128400
	},
	{
		name: "DEGEN99",
		score: 91200
	},
	{
		name: "WHALE_KING",
		score: 74100
	},
	{
		name: "DIAMOND",
		score: 52080
	},
	{
		name: "PAPERHND",
		score: 31500
	}
];
var CHAR_META = {
	char_scalper: {
		emoji: "⚡",
		name: "Scalper",
		bonus: "+5% gains"
	},
	char_day: {
		emoji: "📅",
		name: "Day Trader",
		bonus: "+5% profit"
	},
	char_degen: {
		emoji: "🎲",
		name: "Degen",
		bonus: "Double or nothing"
	},
	char_swing: {
		emoji: "🌊",
		name: "Swing",
		bonus: "+10% streak"
	},
	char_crypto_max: {
		emoji: "₿",
		name: "Crypto Max",
		bonus: "+20% MEME"
	},
	char_ai: {
		emoji: "🤖",
		name: "AI Trader",
		bonus: "Auto-win 1/12"
	},
	char_quant: {
		emoji: "🧠",
		name: "Quant",
		bonus: "+30% gains"
	},
	char_fund_mgr: {
		emoji: "🏦",
		name: "Fund Mgr",
		bonus: "Max 5 HP loss"
	}
};
var PET_META = {
	pet_frog: {
		emoji: "🐸",
		name: "Bull Frog",
		bonus: "+6% LONG wins"
	},
	pet_bear: {
		emoji: "🐻",
		name: "Bear Cub",
		bonus: "-6% HP loss"
	},
	pet_cat: {
		emoji: "🐱",
		name: "Lucky Cat",
		bonus: "+10% coins"
	},
	pet_whale: {
		emoji: "🐋",
		name: "Baby Whale",
		bonus: "+10% big PnL"
	},
	pet_robot: {
		emoji: "🤖",
		name: "Mini Robot",
		bonus: "+3% accuracy"
	},
	pet_dragon: {
		emoji: "🐉",
		name: "Baby Dragon",
		bonus: "+25% coins x5"
	},
	pet_bull: {
		emoji: "🐂",
		name: "Raging Bull",
		bonus: "+15% gains"
	},
	pet_shark: {
		emoji: "🦈",
		name: "Mkt Shark",
		bonus: "+5 HP/win"
	}
};
function LeftPanel({ stats, owned, missions, onClaimMission }) {
	const activeChar = [...Object.keys(CHAR_META)].reverse().find((k) => owned.includes(k));
	const activePet = [...Object.keys(PET_META)].reverse().find((k) => owned.includes(k));
	const gearOwned = owned.filter((id) => [
		"coffee",
		"mouse",
		"kb",
		"monitor",
		"fiber",
		"term",
		"cat",
		"hands",
		"ai",
		"desk",
		"hedge",
		"quant",
		"dark_pool"
	].includes(id));
	const GEAR_LABELS = {
		coffee: "☕ Coffee",
		mouse: "🖱️ Mouse",
		kb: "⌨️ Mech KB",
		monitor: "🖥️ Monitor",
		fiber: "🛜 Fiber",
		term: "📈 Terminal",
		cat: "🐱 Lucky Cat",
		hands: "💎 Diam. Hands",
		ai: "🤖 AI Assist",
		desk: "🪑 Trading Desk",
		hedge: "📉 Hedge Fund",
		quant: "🧠 Quant Model",
		dark_pool: "🌑 Dark Pool"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "pixel-panel p-3 flex flex-col gap-3 h-full overflow-y-auto min-h-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelTitle, { children: "Character" }), activeChar ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-12 h-12 pixel-panel grid place-items-center text-2xl",
					children: CHAR_META[activeChar].emoji
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-term text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-neon-green",
							children: CHAR_META[activeChar].name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-muted-foreground",
							children: CHAR_META[activeChar].bonus
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-muted-foreground",
							children: ["LVL ", stats.level]
						})
					]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-12 h-12 pixel-panel grid place-items-center text-2xl",
					children: "🧑‍💻"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-term text-xs text-muted-foreground",
					children: [
						"Default Trader",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"No bonuses",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"LVL ",
						stats.level
					]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelTitle, { children: "Pet" }), activePet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-10 h-10 pixel-panel grid place-items-center text-xl animate-blink",
					children: PET_META[activePet].emoji
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-term text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-neon-yellow",
						children: PET_META[activePet].name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-muted-foreground",
						children: PET_META[activePet].bonus
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "font-term text-xs text-muted-foreground",
				children: [
					"No pet equipped.",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					"Buy one in Shop!"
				]
			})] }),
			gearOwned.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelTitle, { children: "Gear" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "font-term text-[10px] space-y-0.5 text-muted-foreground",
				children: [gearOwned.slice(0, 5).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-neon-green",
					children: GEAR_LABELS[id] ?? id
				}, id)), gearOwned.length > 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"+",
					gearOwned.length - 5,
					" more"
				] })]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelTitle, { children: "Run Missions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 font-term text-[10px]",
					children: missions.map((m) => {
						const pct = Math.min(100, m.target > 0 ? m.progress / m.target * 100 : 0);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "border-b border-border/40 pb-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between mb-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: m.completed ? "text-neon-green" : "",
										children: m.text
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-neon-yellow",
										children: [m.reward, "🪙"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-1.5 w-full bg-terminal border border-border overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full transition-all",
										style: {
											width: `${pct}%`,
											background: m.completed ? "var(--neon-green)" : "var(--neon-blue)"
										}
									})
								}),
								m.completed && !m.completed && onClaimMission && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => onClaimMission(m.id),
									className: "font-pixel text-[8px] text-neon-yellow mt-0.5 pixel-panel px-1",
									children: "CLAIM"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted-foreground text-[9px]",
									children: m.completed ? "✓ Done" : `${Math.min(m.progress, m.target)}/${m.target}`
								})
							]
						}, m.id);
					})
				})]
			})
		]
	});
}
function RightPanel({ stats, event, news }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "pixel-panel p-3 flex flex-col gap-4 h-full min-h-0 overflow-y-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelTitle, { children: "Boss Status" }), event?.kind === "BOSS" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pixel-panel p-2 neon-red-glow",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-pixel text-[10px] text-neon-red",
					children: event.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-term text-xs text-muted-foreground",
					children: event.subtitle
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-term text-xs text-muted-foreground",
				children: "No boss active."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelTitle, { children: "Active Buff" }), event ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-term text-xs text-neon-yellow",
				children: event.title
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-term text-xs text-muted-foreground",
				children: "None"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelTitle, { children: "Combo" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-pixel text-2xl text-neon-yellow",
					children: ["x", stats.combo]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-term text-xs text-muted-foreground",
					children: ["Best x", stats.bestCombo]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelTitle, { children: "Leaderboard" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "space-y-1 font-term text-xs",
				children: [LEADERBOARD.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-neon-blue",
						children: [
							"#",
							i + 1,
							" ",
							r.name
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-neon-green",
						children: ["$", fmt(r.score)]
					})]
				}, r.name)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between border-t border-border/50 pt-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-neon-yellow",
						children: "YOU"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-neon-yellow",
						children: ["$", fmt(stats.profit)]
					})]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelTitle, { children: "Market News" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 font-term text-xs text-muted-foreground max-h-40 overflow-hidden",
					children: news.slice(0, 8).map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: i === 0 ? "text-neon-green" : "",
						children: ["> ", n]
					}, i))
				})]
			})
		]
	});
}
function EventOverlay({ event, floats }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-30 overflow-hidden",
		children: [event && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute top-6 left-1/2 -translate-x-1/2 pixel-panel px-5 py-3 neon-yellow-glow animate-shake",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-pixel text-sm text-neon-yellow",
				children: event.title
			}), event.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-term text-sm text-muted-foreground text-center mt-1",
				children: event.subtitle
			})]
		}), floats.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute font-pixel text-lg animate-float-up",
			style: {
				left: `${f.x}%`,
				top: `${f.y}%`,
				color: f.color,
				textShadow: `0 0 8px ${f.color}`
			},
			children: f.text
		}, f.id))]
	});
}
var GEAR = [
	{
		id: "coffee",
		name: "Coffee",
		emoji: "☕",
		cost: 80,
		desc: "Calm nerves. −8% HP loss."
	},
	{
		id: "mouse",
		name: "Gaming Mouse",
		emoji: "🖱️",
		cost: 180,
		desc: "+5% coin gain per trade."
	},
	{
		id: "kb",
		name: "Mechanical KB",
		emoji: "⌨️",
		cost: 280,
		desc: "+1 coin per streak tier."
	},
	{
		id: "monitor",
		name: "Better Monitor",
		emoji: "🖥️",
		cost: 350,
		desc: "Wider chart view."
	},
	{
		id: "fiber",
		name: "Fiber Internet",
		emoji: "🛜",
		cost: 480,
		desc: "+2 bonus coins per win."
	},
	{
		id: "term",
		name: "Bloomberg Terminal",
		emoji: "📈",
		cost: 600,
		desc: "Unlocks Indicator shop tab.",
		requires: "monitor"
	},
	{
		id: "cat",
		name: "Lucky Cat",
		emoji: "🐱",
		cost: 380,
		desc: "+10% coin gain per trade."
	},
	{
		id: "hands",
		name: "Diamond Hands",
		emoji: "💎",
		cost: 700,
		desc: "−25% HP loss on losses."
	},
	{
		id: "ai",
		name: "AI Assistant",
		emoji: "🤖",
		cost: 850,
		desc: "Auto-win every 12th trade.",
		requires: "term"
	},
	{
		id: "desk",
		name: "Trading Desk",
		emoji: "🪑",
		cost: 1100,
		desc: "+20% coin score multiplier."
	},
	{
		id: "girlfriend",
		name: "Girlfriend",
		emoji: "💃",
		cost: 999,
		desc: "She needs attention. 40% chance she calls mid-trade. Makes game harder. Why did you buy this?"
	},
	{
		id: "redbull",
		name: "Red Bull",
		emoji: "🦋",
		cost: 120,
		desc: "Wings! −10% HP loss for next 5 trades.",
		repeatable: true
	},
	{
		id: "luckysocks",
		name: "Lucky Socks",
		emoji: "🧦",
		cost: 200,
		desc: "+2 HP whenever you build a streak of 3+."
	},
	{
		id: "therapist",
		name: "Therapist",
		emoji: "🛋️",
		cost: 500,
		desc: "Losses feel less painful. −15% HP loss permanently."
	},
	{
		id: "hp_potion",
		name: "HP Potion",
		emoji: "❤️‍🔥",
		cost: 150,
		desc: "Restore +25 HP now.",
		repeatable: true
	},
	{
		id: "hedge",
		name: "Hedge Fund",
		emoji: "📉",
		cost: 3e3,
		desc: "+50% all coin gains.",
		requires: "desk"
	},
	{
		id: "quant",
		name: "Quant Model",
		emoji: "🧠",
		cost: 2500,
		desc: "Auto-win every 5th trade.",
		requires: "ai"
	},
	{
		id: "dark_pool",
		name: "Dark Pool Access",
		emoji: "🌑",
		cost: 5e3,
		desc: "No HP loss for first 10 trades per level.",
		requires: "hedge"
	}
];
var INDICATORS = [
	{
		id: "ind_vol",
		name: "VOL",
		emoji: "📊",
		cost: 80,
		desc: "Volume bars at bottom of chart"
	},
	{
		id: "ind_ma",
		name: "MA",
		emoji: "📈",
		cost: 120,
		desc: "Simple Moving Average line (20)",
		requires: "ind_vol"
	},
	{
		id: "ind_ema",
		name: "EMA",
		emoji: "📉",
		cost: 150,
		desc: "Exponential Moving Average (14)",
		requires: "ind_ma"
	},
	{
		id: "ind_sr",
		name: "S/R",
		emoji: "⚖️",
		cost: 180,
		desc: "Support & Resistance lines",
		requires: "ind_ma"
	},
	{
		id: "ind_vwap",
		name: "VWAP",
		emoji: "💧",
		cost: 280,
		desc: "Volume Weighted Avg Price line",
		requires: "ind_vol"
	},
	{
		id: "ind_rsi",
		name: "RSI",
		emoji: "🔋",
		cost: 200,
		desc: "RSI overbought/oversold label",
		requires: "ind_ema"
	},
	{
		id: "ind_macd",
		name: "MACD",
		emoji: "🌊",
		cost: 250,
		desc: "MACD momentum signal",
		requires: "ind_ema"
	},
	{
		id: "ind_atr",
		name: "ATR",
		emoji: "📏",
		cost: 200,
		desc: "Avg True Range volatility display",
		requires: "ind_sr"
	},
	{
		id: "ind_bb",
		name: "BB",
		emoji: "〰",
		cost: 450,
		desc: "Bollinger Bands (20-period)",
		requires: "ind_ema"
	},
	{
		id: "ind_fib",
		name: "Fib",
		emoji: "🌀",
		cost: 600,
		desc: "Fibonacci retracement levels",
		requires: "ind_sr"
	},
	{
		id: "ind_smc",
		name: "SMC",
		emoji: "🧠",
		cost: 800,
		desc: "Smart Money: FVG, Order Blocks, Liquidity Sweeps",
		requires: "ind_sr"
	}
];
var CHARS = [
	{
		id: "char_scalper",
		name: "Scalper",
		emoji: "⚡",
		cost: 300,
		desc: "+5% all profit gains"
	},
	{
		id: "char_day",
		name: "Day Trader",
		emoji: "📅",
		cost: 400,
		desc: "+5% profit on every closed trade"
	},
	{
		id: "char_degen",
		name: "Degen",
		emoji: "🎲",
		cost: 200,
		desc: "High risk: double gains ― or double HP loss"
	},
	{
		id: "char_swing",
		name: "Swing Trader",
		emoji: "🌊",
		cost: 500,
		desc: "+10% streak multiplier bonus",
		requires: "char_day"
	},
	{
		id: "char_crypto_max",
		name: "Crypto Max",
		emoji: "₿",
		cost: 600,
		desc: "+20% coins in MEME & HIGH_VOL",
		requires: "char_scalper"
	},
	{
		id: "char_ai",
		name: "AI Trader",
		emoji: "🤖",
		cost: 800,
		desc: "Auto-wins 1 trade in 15",
		requires: "char_swing"
	},
	{
		id: "char_quant",
		name: "Quantitative",
		emoji: "🧠",
		cost: 1500,
		desc: "+30% all gains, based on academic models",
		requires: "char_ai"
	},
	{
		id: "char_fund_mgr",
		name: "Fund Manager",
		emoji: "🏦",
		cost: 2e3,
		desc: "Never lose more than 5 HP per trade",
		requires: "char_quant"
	}
];
var PETS = [
	{
		id: "pet_frog",
		name: "Bull Frog",
		emoji: "🐸",
		cost: 250,
		desc: "+6% bonus on LONG wins"
	},
	{
		id: "pet_bear",
		name: "Bear Cub",
		emoji: "🐻",
		cost: 250,
		desc: "−6% HP loss on SHORT losses"
	},
	{
		id: "pet_cat",
		name: "Lucky Cat",
		emoji: "🐱",
		cost: 380,
		desc: "+10% coins (stacks with gear Lucky Cat)"
	},
	{
		id: "pet_whale",
		name: "Baby Whale",
		emoji: "🐋",
		cost: 500,
		desc: "+10% gains on big-PnL trades"
	},
	{
		id: "pet_robot",
		name: "Mini Robot",
		emoji: "🤖",
		cost: 600,
		desc: "+3% accuracy bonus each trade",
		requires: "pet_cat"
	},
	{
		id: "pet_dragon",
		name: "Baby Dragon",
		emoji: "🐉",
		cost: 800,
		desc: "+25% coins when streak ≥5",
		requires: "pet_frog"
	},
	{
		id: "pet_bull",
		name: "Raging Bull",
		emoji: "🐂",
		cost: 1200,
		desc: "+15% all gains (passive aura)",
		requires: "pet_dragon"
	},
	{
		id: "pet_shark",
		name: "Market Shark",
		emoji: "🦈",
		cost: 1500,
		desc: "Heal +5 HP per win (aggressive)",
		requires: "pet_whale"
	}
];
var COSMETICS = [
	{
		id: "cos_crt",
		name: "CRT Monitor",
		emoji: "📺",
		cost: 100,
		desc: "Enhanced scanline effect"
	},
	{
		id: "cos_neon",
		name: "Neon Theme",
		emoji: "🌈",
		cost: 150,
		desc: "Vivid neon color overrides"
	},
	{
		id: "cos_cyber",
		name: "Cyber Theme",
		emoji: "💻",
		cost: 150,
		desc: "Cyberpunk blue palette",
		requires: "cos_neon"
	},
	{
		id: "cos_gold",
		name: "Gold Candles",
		emoji: "✨",
		cost: 200,
		desc: "Golden candle color scheme"
	},
	{
		id: "cos_japan",
		name: "Japanese Room",
		emoji: "⛩️",
		cost: 220,
		desc: "Sakura-inspired chart aesthetic"
	},
	{
		id: "cos_cave",
		name: "Crypto Cave",
		emoji: "⛏️",
		cost: 300,
		desc: "Underground mining theme",
		requires: "cos_gold"
	},
	{
		id: "cos_moon",
		name: "Moon Base",
		emoji: "🌙",
		cost: 350,
		desc: "Lunar station command center",
		requires: "cos_japan"
	},
	{
		id: "cos_wall_st",
		name: "Wall Street",
		emoji: "🏦",
		cost: 400,
		desc: "Classic trading floor aesthetic"
	},
	{
		id: "cos_matrix",
		name: "Matrix Mode",
		emoji: "🟩",
		cost: 800,
		desc: "Green cascading code overlay",
		requires: "cos_cyber"
	},
	{
		id: "cos_god",
		name: "God Trader",
		emoji: "🌟",
		cost: 2e3,
		desc: "Divine golden aura on all elements",
		requires: "cos_moon"
	}
];
function ItemCard({ item, owned, coins, onBuy }) {
	const has = owned.includes(item.id) && !item.repeatable;
	const isLocked = !!item.requires && !owned.includes(item.requires);
	const canAfford = coins >= item.cost;
	const reqItem = item.requires ? [
		...GEAR,
		...INDICATORS,
		...CHARS,
		...PETS,
		...COSMETICS
	].find((i) => i.id === item.requires) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		disabled: has || isLocked || !canAfford,
		onClick: () => onBuy(item),
		className: `pixel-panel p-3 text-left flex flex-col gap-1 transition w-full ${isLocked ? "opacity-30 cursor-not-allowed" : "hover:neon-green-glow disabled:opacity-40"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-2xl",
				children: item.emoji
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-pixel text-[10px] text-neon-green mt-1",
				children: item.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-term text-xs text-muted-foreground min-h-[32px] leading-snug",
				children: item.desc
			}),
			isLocked && reqItem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "font-pixel text-[8px] text-neon-red mt-1",
				children: ["🔐 Requires: ", reqItem.name]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-pixel text-[10px] text-neon-yellow mt-1",
				children: has ? "✓ OWNED" : isLocked ? "🔐 LOCKED" : canAfford ? `🪙 ${item.cost}` : `🔒 ${item.cost}`
			})
		]
	});
}
function Shop({ coins, onBuy, owned, onClose }) {
	const [tab, setTab] = (0, import_react.useState)("gear");
	const tabItems = {
		gear: GEAR,
		indicators: INDICATORS,
		chars: CHARS,
		pets: PETS,
		cosmetics: COSMETICS
	};
	const TAB_LABELS = {
		gear: "⚙ GEAR",
		indicators: "📉 INDICATORS",
		chars: "🧑 CHARS",
		pets: "🐾 PETS",
		cosmetics: "🎨 COSMETICS"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 bg-black/75 grid place-items-center p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pixel-panel w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-3 border-b-2 border-border shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-pixel text-neon-green text-sm",
							children: "🛒 PIXEL SHOP"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-pixel text-neon-yellow text-xs",
							children: ["🪙 ", coins]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onClose,
							className: "font-pixel text-neon-red text-xs px-3 py-1 pixel-panel hover:neon-red-glow",
							children: "✕ CLOSE"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1 p-2 border-b-2 border-border overflow-x-auto shrink-0",
					children: Object.keys(tabItems).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setTab(k),
						className: `font-pixel text-[9px] sm:text-[10px] px-2 sm:px-3 py-2 uppercase whitespace-nowrap ${tab === k ? "neon-green-glow text-neon-green pixel-panel" : "text-muted-foreground hover:text-foreground"}`,
						children: TAB_LABELS[k]
					}, k))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3",
					children: tabItems[tab].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemCard, {
						item,
						owned,
						coins,
						onBuy
					}, item.id))
				})
			]
		})
	});
}
function GameOver({ stats, gameLevel, onRestart }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 overflow-y-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pixel-panel p-6 max-w-md w-full text-center neon-red-glow my-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-pixel text-2xl text-neon-red animate-blink mb-2",
					children: "GAME OVER"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-term text-base text-muted-foreground mb-1",
					children: "The market rekt you."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-pixel text-[10px] text-neon-yellow mb-5",
					children: ["Reached Game Level ", gameLevel]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 mb-5 text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Profit",
							value: `$${fmt(stats.profit)}`,
							c: "text-neon-green"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Balance",
							value: `$${fmt(stats.balance)}`,
							c: "text-neon-green"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Wins",
							value: stats.wins,
							c: "text-neon-blue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Losses",
							value: stats.losses,
							c: "text-neon-red"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Best Combo",
							value: `x${stats.bestCombo}`,
							c: "text-neon-yellow"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Accuracy",
							value: `${stats.accuracy}%`,
							c: "text-neon-magenta"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Survived",
							value: `${Math.floor(stats.survivalMs / 1e3)}s`,
							c: "text-neon-green"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Coins",
							value: `🪙 ${stats.coins}`,
							c: "text-neon-yellow"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pixel-panel p-4 mb-4 neon-blue-glow text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-pixel text-[10px] text-neon-blue mb-2",
							children: "🚀 BUILD TRADING SYSTEMS LIKE THIS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-term text-xs text-muted-foreground mb-3 leading-relaxed",
							children: [
								"Power your own trading apps with ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-neon-green",
									children: "real-time market data"
								}),
								" — candles, indicators, signals, websocket feeds & more."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "https://realmarketapi.com/",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "flex-1 py-2 font-pixel text-[9px] text-neon-green pixel-panel neon-green-glow text-center",
								children: "🌐 RealMarketAPI"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "https://learn.realmarketapi.com/",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "flex-1 py-2 font-pixel text-[9px] text-neon-blue pixel-panel neon-blue-glow text-center",
								children: "🎓 Academy"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onRestart,
					className: "w-full py-4 font-pixel neon-green-glow text-neon-green bg-[color-mix(in_oklab,var(--neon-green)_15%,transparent)]",
					children: "▶ NEW RUN"
				})
			]
		})
	});
}
function Item({ label, value, c }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pixel-panel p-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-pixel text-[9px] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `font-pixel text-sm ${c}`,
			children: value
		})]
	});
}
var ARTIFACTS = [
	{
		id: "w_hp",
		tier: "white",
		name: "Energy Bar",
		emoji: "🍫",
		desc: "+15 HP per game-level at level start"
	},
	{
		id: "w_coins",
		tier: "white",
		name: "Lucky Penny",
		emoji: "🪙",
		desc: "+15 coins per game-level at level start"
	},
	{
		id: "w_coffee",
		tier: "white",
		name: "Coffee Voucher",
		emoji: "☕",
		desc: "HP loss −40% for the next 3 levels"
	},
	{
		id: "w_maxhp",
		tier: "white",
		name: "Gym Card",
		emoji: "💪",
		desc: "+12 max HP immediately"
	},
	{
		id: "w_xp",
		tier: "white",
		name: "Study Notes",
		emoji: "📚",
		desc: "+20% XP from every win"
	},
	{
		id: "w_bandage",
		tier: "white",
		name: "Bandage Roll",
		emoji: "🩹",
		desc: "Heal +3 HP on every loss (softens blowups)"
	},
	{
		id: "w_patience",
		tier: "white",
		name: "Patience Manual",
		emoji: "🗒️",
		desc: "SKIP never costs coins or accuracy"
	},
	{
		id: "w_focus",
		tier: "white",
		name: "Focus Crystal",
		emoji: "🔮",
		desc: "First trade of every level is guaranteed to win"
	},
	{
		id: "g_streak",
		tier: "green",
		name: "Hot Hand",
		emoji: "🔥",
		desc: "+10% streak multiplier bonus"
	},
	{
		id: "g_rr",
		tier: "green",
		name: "R:R Manual",
		emoji: "📖",
		desc: "HP loss reduced by 20% permanently"
	},
	{
		id: "g_coffee_addict",
		tier: "green",
		name: "Coffee Addict",
		emoji: "☕",
		desc: "+40 coins at the start of every new level"
	},
	{
		id: "g_combo_heal",
		tier: "green",
		name: "Flow State",
		emoji: "🌊",
		desc: "Heal +2 HP on every combo hit"
	},
	{
		id: "g_coin_bonus",
		tier: "green",
		name: "Piggy Bank",
		emoji: "🐷",
		desc: "+4 bonus coins per win"
	},
	{
		id: "g_reversal",
		tier: "green",
		name: "Market Reversal",
		emoji: "🔄",
		desc: "After 3 consecutive losses, next win heals +20 HP"
	},
	{
		id: "g_insurance",
		tier: "green",
		name: "Trade Insurance",
		emoji: "🟥",
		desc: "HP loss blocked 50% when HP is below 25"
	},
	{
		id: "g_journal",
		tier: "green",
		name: "Trade Journal",
		emoji: "📓",
		desc: "Accuracy >60% → +20% bonus coins each trade"
	},
	{
		id: "b_double_coins",
		tier: "blue",
		name: "Gold Rush",
		emoji: "💰",
		desc: "+80% coin rewards from all trades"
	},
	{
		id: "b_shield",
		tier: "blue",
		name: "Loss Shield",
		emoji: "🛡️",
		desc: "First loss per level does not break streak"
	},
	{
		id: "b_oracle",
		tier: "blue",
		name: "Market Oracle",
		emoji: "🔮",
		desc: "+25% streak multiplier bonus"
	},
	{
		id: "b_momentum",
		tier: "blue",
		name: "Momentum",
		emoji: "⚡",
		desc: "+4 coins per win plus +1 per combo level"
	},
	{
		id: "b_lifesteal",
		tier: "blue",
		name: "Vampire Candle",
		emoji: "🧛",
		desc: "Heal +3 HP per win"
	},
	{
		id: "b_leverage",
		tier: "blue",
		name: "2× Leverage",
		emoji: "📈",
		desc: "Profit gains ×1.5 but HP loss ×1.3 on loss"
	},
	{
		id: "b_time_stop",
		tier: "blue",
		name: "Time Stop",
		emoji: "⏸️",
		desc: "Every 8th trade, take a free SKIP (no HP risk)"
	},
	{
		id: "p_immortal",
		tier: "purple",
		name: "Diamond Heart",
		emoji: "💎",
		desc: "First 4 losses per level deal no HP damage"
	},
	{
		id: "p_godmode",
		tier: "purple",
		name: "God Mode",
		emoji: "👑",
		desc: "+40% all profit gains permanently"
	},
	{
		id: "p_slow",
		tier: "purple",
		name: "Time Warp",
		emoji: "⏳",
		desc: "Candles 25% slower — easier timing"
	},
	{
		id: "p_greed",
		tier: "purple",
		name: "Infinite Greed",
		emoji: "∞",
		desc: "On loss, streak drops to half instead of zero"
	},
	{
		id: "p_phoenix",
		tier: "purple",
		name: "Phoenix Soul",
		emoji: "🦅",
		desc: "Revive once per run with 60 HP when you die"
	},
	{
		id: "p_the_algo",
		tier: "purple",
		name: "The Algorithm",
		emoji: "🤖",
		desc: "10% chance each trade auto-resolves as a win"
	},
	{
		id: "p_compound",
		tier: "purple",
		name: "Compound Effect",
		emoji: "📉",
		desc: "Every 10th win grants a bonus +100 coins"
	},
	{
		id: "wu_hp",
		tier: "green",
		name: "Protein Shake",
		emoji: "🥤",
		desc: "+25 HP per level instead of +15 (upgrades Energy Bar)",
		requires: "w_hp"
	},
	{
		id: "wu_coffee",
		tier: "blue",
		name: "Espresso Shot",
		emoji: "⚡☕",
		desc: "HP loss −60% for 5 levels (upgrades Coffee Voucher)",
		requires: "w_coffee"
	},
	{
		id: "gu_streak",
		tier: "blue",
		name: "Legendary Streak",
		emoji: "🍋",
		desc: "+20% streak bonus instead of +10% (upgrades Hot Hand)",
		requires: "g_streak"
	},
	{
		id: "gu_rr",
		tier: "blue",
		name: "Risk Manager",
		emoji: "📊",
		desc: "HP loss reduced by 35% (upgrades R:R Manual)",
		requires: "g_rr"
	},
	{
		id: "bu_double",
		tier: "purple",
		name: "Diamond Mine",
		emoji: "💰💰",
		desc: "+150% coins (upgrades Gold Rush)",
		requires: "b_double_coins"
	},
	{
		id: "bu_shield2",
		tier: "purple",
		name: "Aegis Shield",
		emoji: "🛡️⛔",
		desc: "First 2 losses per level are shielded (upgrades Loss Shield)",
		requires: "b_shield"
	},
	{
		id: "pu_immortal",
		tier: "purple",
		name: "Invincibility",
		emoji: "💎💎",
		desc: "First 7 losses per level deal no HP (upgrades Diamond Heart)",
		requires: "p_immortal"
	},
	{
		id: "pu_phoenix",
		tier: "purple",
		name: "Eternal Flame",
		emoji: "🔥🦅",
		desc: "Revive TWICE per run with 75 HP (upgrades Phoenix Soul)",
		requires: "p_phoenix"
	}
];
var TIER_COLORS = {
	white: "#e2e8f0",
	green: "#4ade80",
	blue: "#60a5fa",
	purple: "#c084fc"
};
var TIER_LABELS = {
	white: "COMMON",
	green: "UNCOMMON",
	blue: "RARE",
	purple: "EPIC"
};
/**
* Pick `count` unique artifacts weighted by tier.
* At higher game levels, rarer tiers (blue/purple) appear more often.
* @param owned     - already collected artifact ids (will not be offered again)
* @param gameLevel - current game level (1 = starter weights, scales up)
*/
function rollArtifacts(count = 3, owned = [], gameLevel = 1) {
	const ownedSet = new Set(owned);
	const pool = ARTIFACTS.filter((a) => {
		if (ownedSet.has(a.id)) return false;
		if (a.requires && !ownedSet.has(a.requires)) return false;
		return true;
	});
	if (pool.length === 0) return [];
	const lv = Math.max(1, gameLevel);
	const tierWeights = {
		white: Math.max(8, 50 - lv * 5),
		green: Math.max(15, 32 - lv),
		blue: lv < 2 ? 0 : Math.min(40, (lv - 1) * 6),
		purple: lv < 4 ? 0 : Math.min(35, 3 + (lv - 3) * 6)
	};
	const weightedPick = (avoid) => {
		const candidates = pool.filter((a) => !avoid.has(a.id));
		if (!candidates.length) return pool[Math.floor(Math.random() * pool.length)];
		const total = candidates.reduce((s, a) => s + tierWeights[a.tier], 0);
		let r = Math.random() * total;
		for (const a of candidates) {
			r -= tierWeights[a.tier];
			if (r <= 0) return a;
		}
		return candidates[candidates.length - 1];
	};
	const result = [];
	const used = new Set(owned);
	while (result.length < count && result.length < pool.length) {
		const a = weightedPick(used);
		used.add(a.id);
		result.push(a);
	}
	return result;
}
function ArtifactPicker({ choices, onPick, gameLevel, collectedIds }) {
	const collected = collectedIds.map((id) => ARTIFACTS.find((a) => a.id === id)).filter(Boolean);
	(0, import_react.useEffect)(() => {
		const handler = (e) => {
			const idx = Number(e.key) - 1;
			if (idx >= 0 && idx < choices.length) onPick(choices[idx].id);
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [choices, onPick]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pixel-panel w-full max-w-3xl p-5 flex flex-col gap-4 max-h-[95vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-pixel text-neon-yellow text-base neon-yellow-glow",
						children: gameLevel === 1 ? "CHOOSE YOUR STARTING ARTIFACT" : `LEVEL ${gameLevel} — CHOOSE AN ARTIFACT`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-term text-xs text-muted-foreground mt-1",
						children: [
							"Pick 1 of 3 — press ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-neon-green",
								children: "1"
							}),
							" / ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-neon-green",
								children: "2"
							}),
							" / ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-neon-green",
								children: "3"
							}),
							" or click"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
					children: choices.map((a, idx) => {
						const color = TIER_COLORS[a.tier];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => onPick(a.id),
							className: "pixel-panel p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform text-center cursor-pointer relative",
							style: {
								borderColor: color,
								boxShadow: `0 0 16px ${color}30`
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "absolute top-2 right-2 font-pixel text-[9px] text-muted-foreground",
									children: [
										"[",
										idx + 1,
										"]"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-4xl",
									children: a.emoji
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-pixel text-[8px] uppercase tracking-widest",
									style: { color },
									children: [TIER_LABELS[a.tier], a.requires && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-1 text-neon-yellow",
										children: "↑UPGRADE"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-pixel text-[11px] text-foreground leading-tight",
									children: a.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-term text-xs text-muted-foreground leading-snug min-h-[36px]",
									children: a.desc
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-pixel text-[9px] px-2 py-1 pixel-panel mt-1",
									style: {
										color,
										borderColor: color
									},
									children: [
										"SELECT [",
										idx + 1,
										"]"
									]
								})
							]
						}, a.id);
					})
				}),
				collected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-border pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-pixel text-[9px] text-muted-foreground mb-2 uppercase tracking-widest",
						children: "Your artifacts this run"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: collected.map((a) => {
							const color = TIER_COLORS[a.tier];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pixel-panel px-2 py-1 flex items-center gap-1",
								style: { borderColor: color },
								title: a.desc,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-base",
									children: a.emoji
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-pixel text-[8px]",
									style: { color },
									children: a.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-term text-[9px] text-muted-foreground max-w-[120px] truncate",
									children: a.desc
								})] })]
							}, a.id);
						})
					})]
				})
			]
		})
	});
}
var ctx = null;
var master = null;
var running = false;
var scheduler = null;
var globalStep = 0;
var nextNoteTime = 0;
var S16 = 60 / 128 / 4;
var STEPS_PER_SECTION = 32;
var SECTION_COUNT = 16;
var A2 = 110;
var B2 = 123.47;
var D2 = 73.42;
var E2 = 82.41;
var F2 = 87.31;
var G2 = 98;
var A3 = 220;
var C3 = 130.81;
var D3 = 146.83;
var E3 = 164.81;
var F3 = 174.61;
var G3 = 196;
var A4 = 440;
var B4 = 493.88;
var C4 = 261.63;
var D4 = 293.66;
var E4 = 329.63;
var F4 = 349.23;
var G4 = 392;
var A5 = 880;
var C5 = 523.25;
var D5 = 587.33;
var E5 = 659.25;
var G5 = 784;
var _ = 0;
var BASS = [
	[
		A2,
		_,
		_,
		A2,
		_,
		_,
		G2,
		_,
		D2,
		_,
		_,
		D2,
		_,
		_,
		F2,
		_
	],
	[
		E2,
		_,
		_,
		E2,
		_,
		_,
		E2,
		_,
		A2,
		_,
		_,
		A2,
		_,
		A2,
		_,
		_
	],
	[
		A2,
		A2,
		_,
		_,
		C3,
		C3,
		_,
		_,
		D3,
		D3,
		_,
		_,
		E3,
		E3,
		_,
		_
	],
	[
		D3,
		_,
		D3,
		_,
		F3,
		_,
		_,
		_,
		E3,
		_,
		E3,
		_,
		G3,
		_,
		_,
		_
	],
	[
		A2,
		_,
		C3,
		_,
		E3,
		_,
		D3,
		_,
		C3,
		_,
		B2,
		_,
		A2,
		_,
		G2,
		_
	],
	[
		A2,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		E3,
		_,
		_,
		_,
		_,
		_,
		_,
		_
	]
];
var LEAD = [
	[
		E5,
		_,
		D5,
		_,
		C5,
		_,
		A4,
		_,
		G4,
		_,
		A4,
		_,
		C5,
		_,
		_,
		_
	],
	[
		A4,
		_,
		B4,
		_,
		C5,
		_,
		E5,
		_,
		D5,
		C5,
		_,
		_,
		A4,
		_,
		_,
		_
	],
	[
		E5,
		E5,
		G5,
		_,
		E5,
		D5,
		_,
		_,
		C5,
		_,
		E5,
		_,
		A5,
		_,
		G5,
		_
	],
	[
		A5,
		_,
		G5,
		_,
		E5,
		_,
		D5,
		_,
		C5,
		_,
		B4,
		_,
		A4,
		_,
		_,
		_
	],
	[
		A4,
		C5,
		E5,
		G5,
		E5,
		C5,
		A4,
		_,
		G4,
		A4,
		C5,
		_,
		E5,
		D5,
		C5,
		A4
	],
	[
		E5,
		_,
		_,
		_,
		_,
		D5,
		_,
		_,
		C5,
		_,
		_,
		_,
		_,
		B4,
		_,
		_
	],
	[
		A4,
		C5,
		E5,
		_,
		A4,
		C5,
		E5,
		_,
		G4,
		B4,
		D5,
		_,
		G4,
		B4,
		D5,
		_
	],
	[
		C5,
		E5,
		A5,
		_,
		G5,
		E5,
		C5,
		_,
		A4,
		C5,
		E5,
		_,
		A4,
		_,
		_,
		_
	]
];
var HARM = [
	[
		C5,
		_,
		B4,
		_,
		A4,
		_,
		F4,
		_,
		E4,
		_,
		F4,
		_,
		A4,
		_,
		_,
		_
	],
	[
		F4,
		_,
		G4,
		_,
		A4,
		_,
		C5,
		_,
		B4,
		A4,
		_,
		_,
		F4,
		_,
		_,
		_
	],
	[
		A4,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		F4,
		_,
		_,
		_,
		_,
		_,
		_,
		_
	],
	[
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_
	]
];
var ARP = [
	[
		A3,
		C4,
		E4,
		A4,
		_,
		E4,
		C4,
		A3,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_
	],
	[
		D3,
		F3,
		A3,
		D4,
		_,
		A3,
		F3,
		D3,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_
	],
	[
		A4,
		C5,
		E5,
		A5,
		E5,
		C5,
		A4,
		E4,
		C4,
		E4,
		A4,
		C5,
		E5,
		C5,
		A4,
		_
	],
	[
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_,
		_
	]
];
var KICK_A = [
	1,
	0,
	0,
	0,
	0,
	0,
	1,
	0,
	0,
	0,
	0,
	0,
	1,
	0,
	0,
	0
];
var KICK_B = [
	1,
	0,
	0,
	0,
	0,
	0,
	1,
	0,
	1,
	0,
	0,
	0,
	1,
	0,
	1,
	0
];
var SNARE_A = [
	0,
	0,
	0,
	0,
	1,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	0,
	0,
	0
];
var SNARE_B = [
	0,
	0,
	0,
	0,
	1,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	0,
	0,
	1
];
var HIHAT_A = [
	1,
	0,
	1,
	0,
	1,
	0,
	1,
	0,
	1,
	0,
	1,
	0,
	1,
	0,
	1,
	0
];
var HIHAT_B = [
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1
];
var OHAT = [
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1
];
var ARRANGEMENT = [
	[
		0,
		0,
		0,
		3,
		0,
		0,
		0
	],
	[
		1,
		1,
		1,
		3,
		0,
		0,
		0
	],
	[
		2,
		2,
		2,
		3,
		1,
		1,
		1
	],
	[
		3,
		3,
		2,
		3,
		1,
		1,
		1
	],
	[
		4,
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		4,
		1,
		1,
		0,
		0,
		0,
		0
	],
	[
		2,
		4,
		0,
		2,
		1,
		1,
		1
	],
	[
		5,
		5,
		3,
		3,
		0,
		0,
		0
	],
	[
		0,
		6,
		0,
		1,
		0,
		0,
		0
	],
	[
		1,
		6,
		1,
		1,
		0,
		0,
		0
	],
	[
		2,
		2,
		2,
		2,
		1,
		1,
		1
	],
	[
		3,
		3,
		2,
		2,
		1,
		1,
		1
	],
	[
		4,
		7,
		0,
		0,
		1,
		1,
		0
	],
	[
		1,
		7,
		1,
		3,
		1,
		1,
		0
	],
	[
		2,
		2,
		0,
		2,
		1,
		1,
		1
	],
	[
		5,
		5,
		3,
		3,
		1,
		1,
		0
	]
];
var KICK_PATS = [KICK_A, KICK_B];
var SNARE_PATS = [SNARE_A, SNARE_B];
var HIHAT_PATS = [HIHAT_A, HIHAT_B];
function ac() {
	if (typeof window === "undefined") return null;
	if (!ctx) try {
		ctx = new (window.AudioContext || window.webkitAudioContext)();
		master = ctx.createGain();
		master.gain.value = .1;
		master.connect(ctx.destination);
	} catch {
		return null;
	}
	return ctx;
}
function playNote(freq, time, dur, type, gain, detune = 0) {
	const a = ac();
	if (!a || !master || freq <= 0) return;
	const o = a.createOscillator();
	const g = a.createGain();
	o.type = type;
	o.frequency.setValueAtTime(freq, time);
	if (detune) o.detune.value = detune;
	g.gain.setValueAtTime(0, time);
	g.gain.linearRampToValueAtTime(gain, time + .005);
	g.gain.exponentialRampToValueAtTime(1e-4, time + dur * .95);
	o.connect(g).connect(master);
	o.start(time);
	o.stop(time + dur + .02);
}
function playNoise(time, dur, gain) {
	const a = ac();
	if (!a || !master) return;
	const bufLen = Math.ceil(a.sampleRate * dur);
	const buf = a.createBuffer(1, bufLen, a.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
	const src = a.createBufferSource();
	const g = a.createGain();
	const filter = a.createBiquadFilter();
	filter.type = "highpass";
	filter.frequency.value = 6e3;
	src.buffer = buf;
	g.gain.setValueAtTime(gain, time);
	g.gain.exponentialRampToValueAtTime(1e-4, time + dur);
	src.connect(filter).connect(g).connect(master);
	src.start(time);
	src.stop(time + dur + .01);
}
function tick() {
	const a = ac();
	if (!a) return;
	while (nextNoteTime < a.currentTime + .15) {
		const totalStep = globalStep;
		const sectionIdx = Math.floor(totalStep / STEPS_PER_SECTION) % SECTION_COUNT;
		const stepInSec = totalStep % STEPS_PER_SECTION;
		const s16i = stepInSec % 16;
		const s16half = Math.floor(stepInSec / 16);
		const [bassIdx, leadIdx, harmIdx, arpIdx, kickIdx, snareIdx, hihatIdx] = ARRANGEMENT[sectionIdx];
		const bassNote = BASS[bassIdx]?.[s16i] ?? _;
		const leadNote = LEAD[leadIdx]?.[s16i] ?? _;
		const harmNote = HARM[harmIdx]?.[s16i] ?? _;
		const arpNote = ARP[arpIdx]?.[s16i] ?? _;
		const kick = KICK_PATS[kickIdx]?.[s16i] ?? 0;
		const snare = SNARE_PATS[snareIdx]?.[s16i] ?? 0;
		const hihat = HIHAT_PATS[hihatIdx]?.[s16i] ?? 0;
		const ohat = OHAT[s16i];
		const t = nextNoteTime;
		if (bassNote) {
			playNote(bassNote, t, S16 * 1.8, "triangle", .3);
			playNote(bassNote / 2, t, S16 * 1.6, "sine", .1);
		}
		if (leadNote) {
			playNote(leadNote, t, S16 * .85, "square", .15);
			playNote(leadNote, t, S16 * .85, "square", .06, 8);
		}
		if (harmNote) playNote(harmNote, t, S16 * .82, "sawtooth", .07);
		if (arpNote) playNote(arpNote, t, S16 * .55, "square", .09);
		if (kick) {
			const a2 = ac();
			const o = a2.createOscillator();
			const g = a2.createGain();
			o.type = "sine";
			o.frequency.setValueAtTime(180, t);
			o.frequency.exponentialRampToValueAtTime(40, t + .06);
			g.gain.setValueAtTime(.6, t);
			g.gain.exponentialRampToValueAtTime(1e-4, t + .12);
			o.connect(g).connect(master);
			o.start(t);
			o.stop(t + .13);
		}
		if (snare) {
			playNoise(t, .08, .22);
			playNote(230, t, .05, "triangle", .12);
		}
		if (hihat) playNoise(t, .025, .06);
		if (ohat) playNoise(t, .12, .1);
		if (s16i === 0 && s16half === 0 && bassNote) playNote(bassNote, t, S16 * .6, "square", .06);
		nextNoteTime += S16;
		globalStep++;
	}
}
var music = {
	start() {
		const a = ac();
		if (!a || running) return;
		if (a.state === "suspended") a.resume();
		running = true;
		globalStep = 0;
		nextNoteTime = a.currentTime + .05;
		scheduler = window.setInterval(tick, 30);
	},
	stop() {
		running = false;
		if (scheduler != null) {
			clearInterval(scheduler);
			scheduler = null;
		}
	},
	isRunning: () => running,
	setVolume(v) {
		if (master) master.gain.value = Math.max(0, Math.min(.4, v));
	}
};
var realmarketapi_logo_png_asset_default = {
	version: 1,
	asset_id: "9158c3f8-8b94-4f33-b0e4-db336700c174",
	project_id: "9f27829e-2cf8-4781-bb7f-bf185dd3c216",
	url: "/logo.png",
	r2_key: "/logo.png",
	original_filename: "logo.png",
	size: 104720,
	content_type: "image/png",
	created_at: "2026-07-11T02:48:37Z"
};
var MISSION_POOL = [
	{
		id: "win5",
		text: "Win 5 trades",
		reward: 30,
		target: 5,
		getProgress: (s) => s.wins
	},
	{
		id: "win10",
		text: "Win 10 trades",
		reward: 60,
		target: 10,
		getProgress: (s) => s.wins
	},
	{
		id: "combo5",
		text: "Reach x5 combo",
		reward: 50,
		target: 5,
		getProgress: (s) => s.bestCombo
	},
	{
		id: "combo10",
		text: "Reach x10 combo",
		reward: 100,
		target: 10,
		getProgress: (s) => s.bestCombo
	},
	{
		id: "survive3",
		text: "Survive 3 min",
		reward: 80,
		target: 180,
		getProgress: (s) => Math.floor(s.survivalMs / 1e3)
	},
	{
		id: "level2",
		text: "Reach Game Level 2",
		reward: 150,
		target: 2,
		getProgress: (_, gl) => gl
	},
	{
		id: "profit500",
		text: "Earn $500 profit",
		reward: 60,
		target: 500,
		getProgress: (s) => s.profit
	},
	{
		id: "acc70",
		text: "70% accuracy (10+)",
		reward: 80,
		target: 70,
		getProgress: (s) => s.wins + s.losses >= 10 ? s.accuracy : 0
	},
	{
		id: "nolose",
		text: "Win 3 in a row",
		reward: 40,
		target: 3,
		getProgress: (s) => s.combo
	}
];
function generateMissions() {
	return [...MISSION_POOL].sort(() => Math.random() - .5).slice(0, 4).map((m) => ({
		...m,
		progress: 0,
		completed: false
	}));
}
function Game() {
	const g = useGame();
	const [shopOpen, setShopOpen] = (0, import_react.useState)(false);
	const [owned, setOwned] = (0, import_react.useState)([]);
	const [musicOn, setMusicOn] = (0, import_react.useState)(false);
	const [hotkeysOpen, setHotkeysOpen] = (0, import_react.useState)(false);
	const [missions, setMissions] = (0, import_react.useState)(() => generateMissions());
	const missionAwardedRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const [phase, setPhase] = (0, import_react.useState)("artifact_pick");
	const [artifactChoices, setArtifactChoices] = (0, import_react.useState)(() => rollArtifacts(3, []));
	const [collectedArtifacts, setCollectedArtifacts] = (0, import_react.useState)([]);
	const [pendingLevelUp, setPendingLevelUp] = (0, import_react.useState)(false);
	const [confirmNewGame, setConfirmNewGame] = (0, import_react.useState)(false);
	const INDICATOR_IDS = [
		"ind_ema",
		"ind_ma",
		"ind_sr",
		"ind_vol",
		"ind_rsi",
		"ind_macd",
		"ind_vwap",
		"ind_atr",
		"ind_bb",
		"ind_fib",
		"ind_smc"
	];
	const ownedIndicators = owned.filter((id) => INDICATOR_IDS.includes(id));
	(0, import_react.useEffect)(() => {
		g.setOwnedItems(owned);
	}, [owned, g]);
	(0, import_react.useEffect)(() => {
		setMissions((prev) => prev.map((m) => {
			if (m.completed) return m;
			const progress = m.getProgress(g.stats, g.gameLevel);
			const completed = progress >= m.target;
			if (completed && !missionAwardedRef.current.has(m.id)) {
				missionAwardedRef.current.add(m.id);
				g.addCoins(m.reward);
			}
			return {
				...m,
				progress,
				completed
			};
		}));
	}, [
		g.stats.wins,
		g.stats.combo,
		g.stats.bestCombo,
		g.stats.survivalMs,
		g.stats.profit,
		g.stats.accuracy,
		g.gameLevel
	]);
	(0, import_react.useEffect)(() => {
		if (g.levelReached && !pendingLevelUp) {
			setPendingLevelUp(true);
			setShopOpen(true);
			sfx.boss();
		}
	}, [g.levelReached, pendingLevelUp]);
	(0, import_react.useEffect)(() => () => music.stop(), []);
	const toggleMusic = (0, import_react.useCallback)(() => {
		if (music.isRunning()) {
			music.stop();
			setMusicOn(false);
		} else {
			music.start();
			setMusicOn(true);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const on = (e) => {
			if (e.repeat) return;
			const k = e.key.toLowerCase();
			if (!(shopOpen || hotkeysOpen || confirmNewGame)) {
				if (k === "a") g.predict("LONG");
				else if (k === "d") g.predict("SHORT");
				else if (k === "s") g.predict("SKIP");
				else if (k === "r" || k === "p") g.setPaused((p) => !p);
			}
			if (k === "b") setShopOpen((s) => !s);
			if (k === "c") g.setScanlines((s) => !s);
			if (k === "m") toggleMusic();
			if (k === "h") setHotkeysOpen((s) => !s);
			if (k === "escape") {
				setShopOpen(false);
				setHotkeysOpen(false);
				setConfirmNewGame(false);
			}
			if (k === "n") setConfirmNewGame(true);
		};
		window.addEventListener("keydown", on);
		return () => window.removeEventListener("keydown", on);
	}, [
		g,
		shopOpen,
		hotkeysOpen,
		confirmNewGame,
		toggleMusic
	]);
	const doStartNewGame = (0, import_react.useCallback)(() => {
		g.reset();
		sfx.coin();
		setOwned([]);
		setCollectedArtifacts([]);
		setPendingLevelUp(false);
		setShopOpen(false);
		setArtifactChoices(rollArtifacts(3, [], 1));
		setPhase("artifact_pick");
		setMissions(generateMissions());
		missionAwardedRef.current.clear();
	}, [g]);
	const handleArtifactPick = (0, import_react.useCallback)((id) => {
		setCollectedArtifacts((prev) => [...prev, id]);
		g.addArtifact(id);
		setPhase("playing");
		g.setPaused(false);
		sfx.coin();
	}, [g]);
	const handleShopClose = (0, import_react.useCallback)(() => {
		setShopOpen(false);
		if (pendingLevelUp) {
			setPendingLevelUp(false);
			g.nextLevel();
			const choices = rollArtifacts(3, collectedArtifacts, g.gameLevel + 1);
			setArtifactChoices(choices);
			setPhase("artifact_pick");
		}
	}, [
		pendingLevelUp,
		g,
		collectedArtifacts
	]);
	const buy = (0, import_react.useCallback)((u) => {
		const alreadyOwned = owned.includes(u.id);
		if (g.stats.coins < u.cost) return;
		if (alreadyOwned && !u.repeatable) return;
		if (!u.repeatable) setOwned((o) => [...o, u.id]);
		g.spendCoins(u.cost);
		if (u.id === "hp_potion") g.applyItemEffect("hp_potion");
		sfx.coin();
	}, [g, owned]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `h-dvh w-full bg-background text-foreground flex flex-col overflow-hidden ${g.shake ? g.tiltLevel >= 2 ? "animate-heavy-shake" : "animate-shake" : ""} ${g.tiltLevel === 1 ? "tilt-1" : g.tiltLevel === 2 ? "tilt-2" : g.tiltLevel === 3 ? "tilt-3" : ""}`,
		children: [
			g.tiltLevel >= 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 pointer-events-none z-[999] overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
						position: "absolute",
						top: "10%",
						left: "25%",
						width: "2px",
						height: "40%",
						background: "rgba(255,60,60,0.3)",
						transform: "rotate(12deg)",
						boxShadow: "0 0 6px rgba(255,0,0,0.5)"
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
						position: "absolute",
						top: "5%",
						left: "60%",
						width: "1px",
						height: "55%",
						background: "rgba(255,255,255,0.25)",
						transform: "rotate(-8deg)"
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
						position: "absolute",
						top: "30%",
						left: "45%",
						width: "1px",
						height: "35%",
						background: "rgba(255,60,60,0.25)",
						transform: "rotate(20deg)"
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
						position: "absolute",
						inset: 0,
						background: "radial-gradient(ellipse at center, transparent 40%, rgba(200,0,0,0.25) 100%)"
					} })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `flex-1 min-h-0 flex flex-col gap-2 px-2 sm:px-3 py-2 overflow-hidden ${g.scanlines ? "crt-overlay" : ""}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-center gap-3 flex-wrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-pixel text-neon-green text-sm sm:text-lg neon-green-glow pixel-panel px-3 py-2",
								children: "PIXEL TRADER"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://realmarketapi.com/",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "pixel-panel flex items-center gap-2 px-2 py-1 hover:neon-blue-glow transition",
								title: "Powered by RealMarketAPI",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: realmarketapi_logo_png_asset_default.url,
									alt: "RealMarketAPI",
									className: "w-7 h-7",
									style: { imageRendering: "pixelated" }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-pixel text-[9px] text-neon-blue leading-tight",
									children: [
										"powered by",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										"RealMarketAPI"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-hidden flex-1 min-w-[180px] pixel-panel py-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "whitespace-nowrap animate-marquee font-term text-sm text-neon-yellow",
									children: g.news.slice(0, 5).join("   •   ")
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setConfirmNewGame(true),
								className: "font-pixel text-[10px] text-neon-green px-3 py-2 pixel-panel neon-green-glow",
								children: "🆕 NEW GAME"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setShopOpen(true),
								className: "font-pixel text-[10px] text-neon-yellow px-3 py-2 pixel-panel neon-yellow-glow",
								children: ["🛒 SHOP 🪙", g.stats.coins]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => g.setPaused((p) => !p),
								className: "font-pixel text-[10px] text-neon-blue px-3 py-2 pixel-panel",
								children: g.paused ? "▶ RESUME" : "⏸ PAUSE"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: toggleMusic,
								className: "font-pixel text-[10px] text-neon-magenta px-3 py-2 pixel-panel",
								children: musicOn ? "🔊 MUSIC" : "🔇 MUSIC"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => g.setScanlines((s) => !s),
								className: "font-pixel text-[10px] text-muted-foreground px-3 py-2 pixel-panel",
								children: g.scanlines ? "CRT ON" : "CRT OFF"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setHotkeysOpen(true),
								className: "font-pixel text-[10px] text-neon-blue px-3 py-2 pixel-panel",
								children: "⌨ [H]"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HUD, {
						stats: g.stats,
						gameLevel: g.gameLevel,
						levelTarget: g.levelTarget
					}),
					g.tiltLevel >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `pixel-panel px-3 py-2 text-center font-pixel text-[10px] ${g.tiltLevel >= 3 ? "neon-red-glow text-neon-red animate-blink" : "text-neon-yellow"}`,
						children: g.tiltLevel >= 3 ? "💥 SCREEN CRACKING — YOU'RE ON MAXIMUM TILT!" : "🔥 PC OVERHEATING — You are tilted. Take a breath."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[200px_1fr_220px] gap-2 overflow-hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden lg:block overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeftPanel, {
									stats: g.stats,
									owned,
									missions
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
								className: "flex flex-col gap-2 min-h-0 overflow-hidden",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `relative flex-1 min-h-0 pixel-panel ${g.flash === "red" ? "animate-flash-red" : g.flash === "green" ? "animate-flash-green" : ""}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleChart, {
											feed: g.feed,
											tick: g.tick,
											entryPrice: g.pending?.entry ?? null,
											entryDir: g.pending?.dir ?? null,
											ownedIndicators
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventOverlay, {
											event: g.event,
											floats: g.floats
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "absolute top-2 left-2 font-pixel text-[10px] text-neon-blue pixel-panel px-2 py-1",
											children: g.stats.mode
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "absolute bottom-2 left-2 font-pixel text-[10px] text-neon-yellow pixel-panel px-2 py-1",
											children: [
												"⏱ ",
												Math.floor(g.stats.survivalMs / 1e3),
												"s"
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBar, {
									onPredict: g.predict,
									pending: g.pending,
									disabled: g.stats.gameOver || g.paused
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden lg:block overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RightPanel, {
									stats: g.stats,
									event: g.event,
									news: g.news
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "shrink-0 flex items-center justify-between gap-2 px-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-term text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-neon-green",
									children: "A"
								}),
								" LONG · ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-neon-red",
									children: "D"
								}),
								" SHORT · ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "S"
								}),
								" skip · ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-neon-blue",
									children: "B"
								}),
								" shop · ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-neon-blue",
									children: "R"
								}),
								" pause · ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-neon-blue",
									children: "M"
								}),
								" music · ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-neon-blue",
									children: "H"
								}),
								" hotkeys"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "https://realmarketapi.com/",
							target: "_blank",
							rel: "noopener noreferrer",
							className: "hidden sm:flex items-center gap-1 pixel-panel px-2 py-1 hover:neon-blue-glow transition shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: realmarketapi_logo_png_asset_default.url,
								alt: "RealMarketAPI",
								className: "w-5 h-5",
								style: { imageRendering: "pixelated" }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-pixel text-[8px] text-neon-blue",
								children: "realmarketapi.com"
							})]
						})]
					})
				]
			}),
			shopOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shop, {
				coins: g.stats.coins,
				owned,
				onBuy: buy,
				onClose: handleShopClose
			}),
			g.stats.gameOver && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameOver, {
				stats: g.stats,
				gameLevel: g.gameLevel,
				onRestart: doStartNewGame
			}),
			phase === "artifact_pick" && !g.stats.gameOver && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtifactPicker, {
				choices: artifactChoices,
				onPick: handleArtifactPick,
				gameLevel: g.gameLevel,
				collectedIds: collectedArtifacts
			}),
			hotkeysOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-[60] bg-black/85 grid place-items-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pixel-panel p-6 max-w-sm w-full neon-blue-glow",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-pixel text-neon-blue text-sm mb-4",
							children: "⌨ HOTKEYS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-x-6 gap-y-1 font-term text-xs text-muted-foreground mb-4",
							children: [
								["A", "LONG"],
								["D", "SHORT"],
								["S", "skip"],
								["R / P", "pause/resume"],
								["B", "shop"],
								["N", "new game"],
								["M", "music"],
								["C", "CRT toggle"],
								["H", "this help"],
								["ESC", "close dialog"],
								["1/2/3", "pick artifact"]
							].map(([key, action]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-neon-green font-pixel text-[10px] min-w-[40px]",
									children: key
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: action })]
							}, key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setHotkeysOpen(false),
							className: "w-full py-2 font-pixel text-[10px] text-neon-blue pixel-panel",
							children: "CLOSE [H/ESC]"
						})
					]
				})
			}),
			confirmNewGame && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-[60] bg-black/85 grid place-items-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pixel-panel p-6 max-w-sm w-full text-center neon-yellow-glow",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-pixel text-neon-yellow text-sm mb-3",
							children: "⚠ START NEW GAME?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-term text-xs text-muted-foreground mb-6",
							children: "All current progress — coins, artifacts, and streak — will be lost."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									setConfirmNewGame(false);
									doStartNewGame();
								},
								className: "flex-1 py-3 font-pixel text-[10px] text-neon-green pixel-panel neon-green-glow",
								children: "✓ CONFIRM"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setConfirmNewGame(false),
								className: "flex-1 py-3 font-pixel text-[10px] text-neon-red pixel-panel neon-red-glow",
								children: "✗ CANCEL"
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { Game as component };
