// Sound, synthesised at runtime.
//
// No audio files. Everything here is generated with the Web Audio API, for
// the same reason the art is drawn in code: the game has to survive being a
// single HTML file on a filtered school network, and a blocked .mp3 is a
// silent game with no error message.
//
// Two rules that matter in a classroom:
//   - Nothing plays until the player presses a key. Browsers require a
//     gesture before audio anyway, and a game that starts making noise in a
//     room of thirty Chromebooks is a game a teacher turns off.
//   - The mute state is remembered. One toggle, honoured forever.

const MUTE_KEY = 'salem1692.muted';

export class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.ambientGain = null;
    this.ambient = null;        // { nodes: [], name }
    this.muted = false;
    try { this.muted = localStorage.getItem(MUTE_KEY) === '1'; } catch { /* private mode */ }
    this.pendingAmbience = null;
  }

  /** Called from the first real input event. Safe to call repeatedly. */
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.35;
    this.ambientGain.connect(this.master);
    if (this.pendingAmbience) {
      const a = this.pendingAmbience;
      this.pendingAmbience = null;
      this.setAmbience(a);
    }
  }

  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch { /* nothing to do */ }
    if (this.master) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.5, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() { this.setMuted(!this.muted); return this.muted; }

  /* ---- building blocks ------------------------------------------------ */

  /** A short buffer of white noise, reused for every noise-based voice. */
  noiseBuffer(seconds = 2) {
    if (this._noise && this._noiseLen >= seconds) return this._noise;
    const n = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    this._noise = buf; this._noiseLen = seconds;
    return buf;
  }

  /** One short tone. */
  tone({ freq = 440, type = 'square', dur = 0.06, gain = 0.15, slide = 0, delay = 0 }) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  /** A filtered burst of noise — footsteps, thumps, wind gusts. */
  burst({ dur = 0.08, gain = 0.12, freq = 900, q = 1, type = 'bandpass', delay = 0 }) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer();
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t); src.stop(t + dur + 0.02);
  }

  /* ---- one-shots ------------------------------------------------------ */

  step(terrain) {
    // Different ground, different footstep. Small detail, but it is the
    // sound the player hears more than any other.
    const kinds = {
      mud:    { freq: 420, dur: 0.07, gain: 0.055, q: 0.8 },
      grass:  { freq: 1500, dur: 0.05, gain: 0.035, q: 0.7 },
      lawn:   { freq: 1600, dur: 0.05, gain: 0.035, q: 0.7 },
      snow:   { freq: 2400, dur: 0.06, gain: 0.04, q: 0.9 },
      floor:  { freq: 260, dur: 0.06, gain: 0.06, q: 2.5 },
      paving: { freq: 1100, dur: 0.04, gain: 0.05, q: 3 },
      brick:  { freq: 950, dur: 0.04, gain: 0.05, q: 3 },
      asphalt:{ freq: 700, dur: 0.05, gain: 0.045, q: 1.5 },
    };
    const k = kinds[terrain] || kinds.grass;
    this.burst({ ...k, freq: k.freq * (0.9 + Math.random() * 0.2) });
  }

  /** The text-advance blip. Pitched per speaker so voices feel distinct. */
  blip(pitch = 1) {
    this.tone({ freq: 300 * pitch, type: 'square', dur: 0.028, gain: 0.045, slide: 40 });
  }

  menuMove() { this.tone({ freq: 520, type: 'triangle', dur: 0.05, gain: 0.07 }); }
  menuPick() {
    this.tone({ freq: 620, type: 'triangle', dur: 0.05, gain: 0.08 });
    this.tone({ freq: 930, type: 'triangle', dur: 0.07, gain: 0.06, delay: 0.05 });
  }

  /** Something went into the notebook. */
  noted() {
    this.tone({ freq: 740, type: 'sine', dur: 0.10, gain: 0.09 });
    this.tone({ freq: 1108, type: 'sine', dur: 0.14, gain: 0.07, delay: 0.08 });
  }

  /** An objective completed. Deliberately warmer than `noted`. */
  objective() {
    this.tone({ freq: 587, type: 'triangle', dur: 0.09, gain: 0.08 });
    this.tone({ freq: 784, type: 'triangle', dur: 0.09, gain: 0.08, delay: 0.07 });
    this.tone({ freq: 1175, type: 'triangle', dur: 0.20, gain: 0.07, delay: 0.14 });
  }

  door() { this.burst({ freq: 220, dur: 0.16, gain: 0.10, q: 1.2 }); }

  /** Crossing three centuries. Low, wrong-footed, and over quickly. */
  timeShift() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(320, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 1.6);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + 1.8);
    this.burst({ freq: 200, dur: 1.4, gain: 0.05, q: 0.6, type: 'lowpass' });
  }

  /* ---- ambience ------------------------------------------------------- */

  /**
   * A continuous bed per era. 1692 is wind and, occasionally, a crow. The
   * present is traffic. The difference is doing the same job as the palette
   * shift: you should know what century you are in with your eyes shut.
   */
  setAmbience(name) {
    if (!this.ctx) { this.pendingAmbience = name; return; }
    if (this.ambient && this.ambient.name === name) return;
    this.stopAmbience();
    if (!name) return;

    const t = this.ctx.currentTime;
    const nodes = [];
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer(4);
    src.loop = true;

    const filt = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);

    if (name === 'present') {
      // Distant traffic: low rumble, very little movement.
      filt.type = 'lowpass'; filt.frequency.value = 260; filt.Q.value = 0.6;
      g.gain.linearRampToValueAtTime(0.30, t + 1.5);
    } else if (name === 'indoor') {
      filt.type = 'lowpass'; filt.frequency.value = 150; filt.Q.value = 0.5;
      g.gain.linearRampToValueAtTime(0.14, t + 1.2);
    } else {
      // Open ground in March: wind, with slow gusts.
      filt.type = 'bandpass'; filt.frequency.value = 480; filt.Q.value = 0.5;
      g.gain.linearRampToValueAtTime(0.22, t + 1.5);
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.09;
      lfoGain.gain.value = 260;
      lfo.connect(lfoGain); lfoGain.connect(filt.frequency);
      lfo.start(t); nodes.push(lfo, lfoGain);
    }

    src.connect(filt); filt.connect(g); g.connect(this.ambientGain);
    src.start(t);
    nodes.push(src, filt, g);
    this.ambient = { name, nodes, gain: g };

    // Occasional punctuation, so the bed does not become wallpaper.
    clearInterval(this._punct);
    if (name === '1692') {
      this._punct = setInterval(() => {
        if (!this.muted && Math.random() < 0.35) this.crow();
      }, 9000);
    } else if (name === 'present') {
      this._punct = setInterval(() => {
        if (!this.muted && Math.random() < 0.3) this.passingCar();
      }, 11000);
    }
  }

  crow() {
    // Two harsh descending calls. Not a realistic corvid, but unmistakably
    // a bird and unmistakably not friendly.
    for (let i = 0; i < 2; i++) {
      const d = i * 0.26;
      this.tone({ freq: 720, type: 'sawtooth', dur: 0.15, gain: 0.035, slide: -300, delay: d });
      this.burst({ freq: 1400, dur: 0.13, gain: 0.02, q: 1.6, delay: d });
    }
  }

  passingCar() {
    this.burst({ freq: 300, dur: 2.2, gain: 0.045, q: 0.5, type: 'lowpass' });
  }

  stopAmbience() {
    clearInterval(this._punct);
    if (!this.ambient) return;
    const t = this.ctx.currentTime;
    try {
      this.ambient.gain.gain.cancelScheduledValues(t);
      this.ambient.gain.gain.setTargetAtTime(0, t, 0.2);
      for (const n of this.ambient.nodes) {
        if (n.stop) { try { n.stop(t + 1.2); } catch { /* already stopped */ } }
      }
    } catch { /* context torn down */ }
    this.ambient = null;
  }
}
