// Procedural 8-bit chiptune generator using WebAudio.
// Zero assets — pure oscillators for a lightweight, loopable loop.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let running = false;
let scheduler: number | null = null;
let step = 0;
let nextNoteTime = 0;
const BPM = 128;
const SECONDS_PER_BEAT = 60 / BPM;
const NOTE_LEN = SECONDS_PER_BEAT / 4; // 16th

// Minor pentatonic-ish riff (Hz)
const BASS = [110, 110, 82.4, 82.4, 98, 98, 110, 110]; // A2 pattern
const LEAD = [
  440, 523, 659, 523, 440, 392, 349, 440,
  523, 659, 784, 659, 523, 440, 392, 440,
];

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.12;
      master.connect(ctx.destination);
    } catch { return null; }
  }
  return ctx;
}

function playNote(freq: number, time: number, dur: number, type: OscillatorType, gain: number) {
  const a = ac(); if (!a || !master) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, time);
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(gain, time + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  o.connect(g).connect(master);
  o.start(time);
  o.stop(time + dur + 0.02);
}

function tick() {
  const a = ac(); if (!a) return;
  while (nextNoteTime < a.currentTime + 0.12) {
    const s16 = step % 16;
    const s8 = step % 8;
    // Lead
    playNote(LEAD[s16], nextNoteTime, NOTE_LEN * 0.9, "square", 0.18);
    // Bass every 8th
    if (s16 % 2 === 0) playNote(BASS[s8], nextNoteTime, NOTE_LEN * 1.6, "triangle", 0.28);
    // Kick / noise on 1 and 3 of the beat
    if (s16 % 4 === 0) playNote(60, nextNoteTime, 0.08, "sine", 0.4);
    nextNoteTime += NOTE_LEN;
    step++;
  }
}

export const music = {
  start() {
    const a = ac(); if (!a || running) return;
    if (a.state === "suspended") a.resume();
    running = true;
    step = 0;
    nextNoteTime = a.currentTime + 0.05;
    scheduler = window.setInterval(tick, 40);
  },
  stop() {
    running = false;
    if (scheduler != null) { clearInterval(scheduler); scheduler = null; }
  },
  isRunning: () => running,
  setVolume(v: number) { if (master) master.gain.value = Math.max(0, Math.min(0.5, v)); },
};
