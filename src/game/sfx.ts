// Tiny WebAudio blip generator — no assets required.
let ctx: AudioContext | null = null;
function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); } catch { return null; }
  }
  return ctx;
}

function blip(freq: number, dur = 0.08, type: OscillatorType = "square", gain = 0.06) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, a.currentTime);
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  o.connect(g).connect(a.destination);
  o.start();
  o.stop(a.currentTime + dur);
}

export const sfx = {
  click:  () => blip(520, 0.04, "square", 0.05),
  win:    () => { blip(660, 0.06); setTimeout(() => blip(880, 0.09), 60); },
  lose:   () => { blip(220, 0.09, "sawtooth", 0.08); setTimeout(() => blip(140, 0.15, "sawtooth", 0.07), 70); },
  coin:   () => { blip(988, 0.05); setTimeout(() => blip(1319, 0.07), 40); },
  event:  () => { blip(440, 0.08, "triangle"); setTimeout(() => blip(660, 0.1, "triangle"), 90); },
  boss:   () => { blip(110, 0.2, "sawtooth", 0.09); setTimeout(() => blip(82, 0.25, "sawtooth", 0.09), 180); },
  crash:  () => { for (let i = 0; i < 6; i++) setTimeout(() => blip(300 - i * 40, 0.08, "sawtooth", 0.08), i * 60); },
  /** Rising fanfare for milestone streaks */
  streak: (combo: number) => {
    const base = 523;
    const notes = combo >= 10 ? [base, base*1.25, base*1.5, base*2] : [base, base*1.25, base*1.5];
    notes.forEach((f, i) => setTimeout(() => blip(f, 0.12, "square", 0.07), i * 80));
  },
  /** Dramatic impact for screen-hit tilt effect */
  tilt: () => {
    blip(80, 0.3, "sawtooth", 0.12);
    setTimeout(() => blip(55, 0.4, "sawtooth", 0.10), 120);
    setTimeout(() => blip(40, 0.5, "sawtooth", 0.08), 280);
  },
};