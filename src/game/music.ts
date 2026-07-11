// Procedural 8-bit chiptune — A natural minor, 128 BPM
// Structure: 32-bar cycle (~60s) with verse / chorus / fill / break sections
// Zero assets — pure WebAudio oscillators

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let running = false;
let scheduler: number | null = null;
let globalStep = 0;
let nextNoteTime = 0;

const BPM   = 128;
const BEAT  = 60 / BPM;          // seconds per beat
const S16   = BEAT / 4;          // 16th note
const STEPS_PER_SECTION = 32;    // 32 sixteenth notes = 2 bars
const SECTION_COUNT = 16;        // 16 sections before full repeat = ~32 bars ≈ 60s

// ── Note table (Hz) ───────────────────────────────────────────────────────────
// octave 2
const A2=110.00,B2=123.47,C2=65.41,D2=73.42,E2=82.41,F2=87.31,G2=98.00;
// octave 3
const A3=220.00,B3=246.94,C3=130.81,D3=146.83,E3=164.81,F3=174.61,G3=196.00;
// octave 4
const A4=440.00,B4=493.88,C4=261.63,D4=293.66,E4=329.63,F4=349.23,G4=392.00;
// octave 5
const A5=880.00,B5=987.77,C5=523.25,D5=587.33,E5=659.25,F5=698.46,G5=784.00;
const _=0;

// ── BASS patterns (16 steps each) ──────────────────────────────────────────────
const BASS: number[][] = [
  // 0 verse Am-Dm
  [A2,_,_,A2, _,_,G2,_, D2,_,_,D2, _,_,F2,_],
  // 1 verse Em-Am
  [E2,_,_,E2, _,_,E2,_, A2,_,_,A2, _,A2,_,_],
  // 2 chorus pump Am
  [A2,A2,_,_, C3,C3,_,_, D3,D3,_,_, E3,E3,_,_],
  // 3 chorus Dm-E
  [D3,_,D3,_, F3,_,_,_, E3,_,E3,_, G3,_,_,_],
  // 4 walking Am
  [A2,_,C3,_, E3,_,D3,_, C3,_,B2,_, A2,_,G2,_],
  // 5 break (sparse)
  [A2,_,_,_, _,_,_,_, E3,_,_,_, _,_,_,_],
];

// ── LEAD melody patterns (16 steps) ────────────────────────────────────────
const LEAD: number[][] = [
  // 0 verse phrase A
  [E5,_,D5,_, C5,_,A4,_, G4,_,A4,_, C5,_,_,_],
  // 1 verse phrase B (response)
  [A4,_,B4,_, C5,_,E5,_, D5,C5,_,_, A4,_,_,_],
  // 2 chorus high
  [E5,E5,G5,_, E5,D5,_,_, C5,_,E5,_, A5,_,G5,_],
  // 3 chorus descend
  [A5,_,G5,_, E5,_,D5,_, C5,_,B4,_, A4,_,_,_],
  // 4 fill / run
  [A4,C5,E5,G5, E5,C5,A4,_, G4,A4,C5,_, E5,D5,C5,A4],
  // 5 break (high, sparse)
  [E5,_,_,_, _,D5,_,_, C5,_,_,_, _,B4,_,_],
  // 6 bridge arpeggiated feel
  [A4,C5,E5,_, A4,C5,E5,_, G4,B4,D5,_, G4,B4,D5,_],
  // 7 outro motif
  [C5,E5,A5,_, G5,E5,C5,_, A4,C5,E5,_, A4,_,_,_],
];

// ── HARMONY (2nd voice, lower) ──────────────────────────────────────────
const HARM: number[][] = [
  // 0 thirds below verse A
  [C5,_,B4,_, A4,_,F4,_, E4,_,F4,_, A4,_,_,_],
  // 1 thirds below verse B
  [F4,_,G4,_, A4,_,C5,_, B4,A4,_,_, F4,_,_,_],
  // 2 chorus held pedal
  [A4,_,_,_, _,_,_,_, F4,_,_,_, _,_,_,_],
  // 3 silent
  [_,_,_,_, _,_,_,_, _,_,_,_, _,_,_,_],
];

// ── ARPEGGIO patterns ───────────────────────────────────────────────────────────
const ARP: number[][] = [
  // 0 Am arpeggio up
  [A3,C4,E4,A4, _,E4,C4,A3, _,_,_,_, _,_,_,_],
  // 1 Dm arpeggio
  [D3,F3,A3,D4, _,A3,F3,D3, _,_,_,_, _,_,_,_],
  // 2 rapid 16ths Am
  [A4,C5,E5,A5, E5,C5,A4,E4, C4,E4,A4,C5, E5,C5,A4,_],
  // 3 off
  [_,_,_,_, _,_,_,_, _,_,_,_, _,_,_,_],
];

// ── DRUM patterns (1=hit, 0=off, 16 steps) ──────────────────────────────
const KICK_A  = [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0];
const KICK_B  = [1,0,0,0, 0,0,1,0, 1,0,0,0, 1,0,1,0];
const SNARE_A = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];
const SNARE_B = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1];
const HIHAT_A = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0];
const HIHAT_B = [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1];
const OHAT    = [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1];

// ── Section arrangement (SECTION_COUNT entries, each = 2 bars) ───────────────
// Each entry: [bass_idx, lead_idx, harm_idx, arp_idx, kick_idx, snare_idx, hihat_idx]
const ARRANGEMENT: number[][] = [
  [0, 0, 0, 3, 0, 0, 0],  // 0  verse A (intro)
  [1, 1, 1, 3, 0, 0, 0],  // 1  verse B
  [2, 2, 2, 3, 1, 1, 1],  // 2  chorus 1
  [3, 3, 2, 3, 1, 1, 1],  // 3  chorus 2
  [4, 0, 0, 0, 0, 0, 0],  // 4  verse walk A
  [4, 1, 1, 0, 0, 0, 0],  // 5  verse walk B
  [2, 4, 0, 2, 1, 1, 1],  // 6  chorus fill
  [5, 5, 3, 3, 0, 0, 0],  // 7  break (sparse)
  [0, 6, 0, 1, 0, 0, 0],  // 8  bridge arp Am
  [1, 6, 1, 1, 0, 0, 0],  // 9  bridge arp Dm
  [2, 2, 2, 2, 1, 1, 1],  // 10 chorus (big arp)
  [3, 3, 2, 2, 1, 1, 1],  // 11 chorus (big arp 2)
  [4, 7, 0, 0, 1, 1, 0],  // 12 outro A
  [1, 7, 1, 3, 1, 1, 0],  // 13 outro B
  [2, 2, 0, 2, 1, 1, 1],  // 14 finale chorus
  [5, 5, 3, 3, 1, 1, 0],  // 15 final break → loop
];

const KICK_PATS  = [KICK_A, KICK_B];
const SNARE_PATS = [SNARE_A, SNARE_B];
const HIHAT_PATS = [HIHAT_A, HIHAT_B];

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.10;
      master.connect(ctx.destination);
    } catch { return null; }
  }
  return ctx;
}

function playNote(
  freq: number, time: number, dur: number,
  type: OscillatorType, gain: number, detune = 0
) {
  const a = ac(); if (!a || !master || freq <= 0) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, time);
  if (detune) o.detune.value = detune;
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(gain, time + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur * 0.95);
  o.connect(g).connect(master);
  o.start(time);
  o.stop(time + dur + 0.02);
}

function playNoise(time: number, dur: number, gain: number) {
  const a = ac(); if (!a || !master) return;
  const bufLen = Math.ceil(a.sampleRate * dur);
  const buf = a.createBuffer(1, bufLen, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  const g = a.createGain();
  const filter = a.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 6000;
  src.buffer = buf;
  g.gain.setValueAtTime(gain, time);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(time);
  src.stop(time + dur + 0.01);
}

function tick() {
  const a = ac(); if (!a) return;
  while (nextNoteTime < a.currentTime + 0.15) {
    const totalStep  = globalStep;
    const sectionIdx = Math.floor(totalStep / STEPS_PER_SECTION) % SECTION_COUNT;
    const stepInSec  = totalStep % STEPS_PER_SECTION;
    const s16i       = stepInSec % 16;          // position within 16-step pattern
    const s16half    = Math.floor(stepInSec / 16); // which half of the 32-step section

    const [bassIdx, leadIdx, harmIdx, arpIdx, kickIdx, snareIdx, hihatIdx] =
      ARRANGEMENT[sectionIdx];

    const bassNote = BASS[bassIdx]?.[s16i] ?? _;
    const leadNote = LEAD[leadIdx]?.[s16i] ?? _;
    const harmNote = HARM[harmIdx]?.[s16i] ?? _;
    const arpNote  = ARP[arpIdx]?.[s16i]  ?? _;

    const kick  = KICK_PATS[kickIdx]?.[s16i]  ?? 0;
    const snare = SNARE_PATS[snareIdx]?.[s16i] ?? 0;
    const hihat = HIHAT_PATS[hihatIdx]?.[s16i] ?? 0;
    const ohat  = OHAT[s16i];

    const t = nextNoteTime;

    // Bass (triangle + little sub)
    if (bassNote) {
      playNote(bassNote, t, S16 * 1.8, "triangle", 0.30);
      playNote(bassNote / 2, t, S16 * 1.6, "sine", 0.10);
    }

    // Lead (square with slight detune for fatness)
    if (leadNote) {
      playNote(leadNote, t, S16 * 0.85, "square", 0.15);
      playNote(leadNote, t, S16 * 0.85, "square", 0.06, 8);
    }

    // Harmony (sawtooth, softer)
    if (harmNote) {
      playNote(harmNote, t, S16 * 0.82, "sawtooth", 0.07);
    }

    // Arpeggio (short square notes)
    if (arpNote) {
      playNote(arpNote, t, S16 * 0.55, "square", 0.09);
    }

    // Kick (sine thump)
    if (kick) {
      const a2 = ac()!;
      const o = a2.createOscillator();
      const g = a2.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(180, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.06);
      g.gain.setValueAtTime(0.6, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g).connect(master!);
      o.start(t); o.stop(t + 0.13);
    }

    // Snare (noise burst + tone)
    if (snare) {
      playNoise(t, 0.08, 0.22);
      playNote(230, t, 0.05, "triangle", 0.12);
    }

    // Hi-hat closed (noise, short)
    if (hihat) playNoise(t, 0.025, 0.06);

    // Open hi-hat (longer decay, every bar end)
    if (ohat)  playNoise(t, 0.12,  0.10);

    // Accent: bass note on beat 1 of each 16-step half
    if (s16i === 0 && s16half === 0 && bassNote) {
      playNote(bassNote, t, S16 * 0.6, "square", 0.06);
    }

    nextNoteTime += S16;
    globalStep++;
  }
}

export const music = {
  start() {
    const a = ac(); if (!a || running) return;
    if (a.state === "suspended") a.resume();
    running = true;
    globalStep = 0;
    nextNoteTime = a.currentTime + 0.05;
    scheduler = window.setInterval(tick, 30);
  },
  stop() {
    running = false;
    if (scheduler != null) { clearInterval(scheduler); scheduler = null; }
  },
  isRunning: () => running,
  setVolume(v: number) { if (master) master.gain.value = Math.max(0, Math.min(0.4, v)); },
};
