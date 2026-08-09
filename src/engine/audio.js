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

const SOUND_KEY = 'salem1692.sound';
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
    this.pendingMusic = null;
    this.music = null;          // { name, timer, step }
    // Three settings, not two. A teacher who wants the room quieter usually
    // wants the tune off and the footsteps and dialogue blips left alone —
    // those are feedback, not atmosphere. 'all' | 'quiet' | 'off'.
    this.sound = 'all';
    try {
      const saved = localStorage.getItem(SOUND_KEY);
      if (saved === 'all' || saved === 'quiet' || saved === 'off') this.sound = saved;
      else if (this.muted) this.sound = 'off';
    } catch { /* private mode */ }
    this.muted = this.sound === 'off';
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
    // Music sits on its own bus so it can be silenced without touching the
    // footsteps, and ducked under dialogue without ducking anything else.
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.sound === 'all' ? 1 : 0;
    this.musicGain.connect(this.master);
    if (this.pendingMusic) {
      const m = this.pendingMusic;
      this.pendingMusic = null;
      this.setMusic(m);
    }
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

  /** Cycle all -> quiet (no music) -> off -> all. */
  cycleSound() {
    this.sound = this.sound === 'all' ? 'quiet' : this.sound === 'quiet' ? 'off' : 'all';
    try { localStorage.setItem(SOUND_KEY, this.sound); } catch { /* nothing to do */ }
    this.setMuted(this.sound === 'off');
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.sound === 'all' ? 1 : 0, this.ctx.currentTime, 0.4);
    }
    return this.sound;
  }

  /** Pull the tune down under a conversation without touching anything else. */
  duckMusic(on) {
    if (!this.musicGain || !this.ctx || this.sound !== 'all') return;
    this.musicGain.gain.setTargetAtTime(on ? 0.35 : 1, this.ctx.currentTime, 0.35);
  }

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
      // Open ground in 1692: wind, with slow gusts.
      //
      // September is the same wind with the life taken out of it. By then the
      // village has lost a fifth of its households to the jail, the gallows or
      // flight, and a place that empty should not sound identical to the one
      // the player walked through in March. Thinner, colder, and — below —
      // no crows left calling to each other.
      const late = name === '1692-late';
      filt.type = 'bandpass';
      filt.frequency.value = late ? 620 : 480;
      filt.Q.value = late ? 0.8 : 0.5;
      g.gain.linearRampToValueAtTime(late ? 0.17 : 0.22, t + 1.5);
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = late ? 0.06 : 0.09;
      lfoGain.gain.value = late ? 170 : 260;
      lfo.connect(lfoGain); lfoGain.connect(filt.frequency);
      lfo.start(t); nodes.push(lfo, lfoGain);
    }

    src.connect(filt); filt.connect(g); g.connect(this.ambientGain);
    src.start(t);
    nodes.push(src, filt, g);
    this.ambient = { name, nodes, gain: g };

    // Occasional punctuation, so the bed does not become wallpaper.
    clearInterval(this._punct);
    if (name === '1692' || name === '1692-late') {
      // Crows thin out rather than vanish: one bird a long way off, now and
      // then, instead of a pair arguing overhead.
      const odds = name === '1692-late' ? 0.12 : 0.35;
      this._punct = setInterval(() => {
        if (!this.muted && Math.random() < odds) this.crow();
      }, name === '1692-late' ? 16000 : 9000);
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

  /* ---- music ----------------------------------------------------------- *
   *
   * What music can this game honestly have?
   *
   * Almost none, which turns out to be the interesting answer. Puritan New
   * England permitted singing in worship and essentially nothing else: no
   * instruments in the meetinghouse, no organ, no part-singing. What a person
   * in Salem Village actually heard was the Bay Psalm Book, unaccompanied, in
   * a handful of common tunes — Old Hundredth, Windsor, Martyrs, York — sung
   * slowly and in unison by a congregation, most of whom could not read music
   * and were following a deacon lining the psalm out one phrase at a time.
   *
   * So the tunes below are not quotations. They are built out of the shapes
   * those melodies are made of: stepwise motion inside a minor-ish mode,
   * phrases that fall to the tonic, no leading tone, no ornament, and a
   * ceiling of about a sixth. Played on square and triangle waves at a fifth
   * of the volume of everything else, which is what makes it a chip tune
   * rather than a hymn.
   *
   * AND IT THINS OUT. The same material loses notes across the year: the
   * March tune is a whole phrase, June drops the answering half, and by
   * September it is three notes and a lot of silence. The village has lost a
   * fifth of its households by then, and the wind was already doing this — a
   * place that empty should not sound like the one the player walked through
   * in March. The present day gets no melody at all, because a memorial beside
   * a working street is not scored.
   *
   * Scale degrees, not frequencies, so the same phrase can be transposed and
   * so the shapes are readable as shapes. 0 is the tonic; null is a rest.
   */
  static get MODE() {
    // Aeolian on D, two octaves. The flat seventh is the point: a leading
    // tone would make this sound like the eighteenth century.
    return [146.83, 164.81, 174.61, 196.00, 220.00, 233.08, 261.63,
            293.66, 329.63, 349.23, 392.00, 440.00, 466.16, 523.25];
  }

  static get TUNES() {
    return {
      // Outdoors, March. A full psalm phrase and its answer.
      '1692': {
        beat: 0.62, gain: 0.030, type: 'triangle',
        notes: [0, 2, 4, 3, 2, null, 1, 0, null, 3, 4, 5, 4, 3, 2, null, 1, 0, null, null],
      },
      // June. The answering half is gone; what is left circles.
      '1692-june': {
        beat: 0.70, gain: 0.027, type: 'triangle',
        notes: [0, 2, 4, 3, null, 2, 1, null, 0, null, null, 2, 1, null, 0, null, null, null],
      },
      // September. Three notes and a great deal of nothing.
      '1692-late': {
        beat: 0.86, gain: 0.024, type: 'triangle',
        notes: [0, null, null, 2, null, null, null, 1, null, null, null, null,
                0, null, null, null, null, null, null, null],
      },
      // Under a roof: lower, slower, barely a tune. A drone with a memory.
      indoor: {
        beat: 0.95, gain: 0.022, type: 'sine', octave: -1,
        notes: [0, null, null, null, 2, null, null, null, 1, null, null, null,
                0, null, null, null, null, null],
      },
      // The meetinghouse. The only room in the village where this music was
      // ever actually sung, so here it is nearly four-square and in unison.
      meetinghouse: {
        beat: 0.66, gain: 0.032, type: 'square', fifth: true,
        notes: [0, 0, 1, 2, 2, 1, 0, null, 3, 3, 2, 1, 1, 0, null, null],
      },
      // The jail. One note, low, at long intervals. Not a tune at all.
      jail: {
        beat: 1.35, gain: 0.024, type: 'sine', octave: -1,
        notes: [0, null, null, null, null, 1, null, null, null, null, null, null],
      },
      // The archive: a reading room in the present. Neutral, almost still.
      archive: {
        beat: 1.10, gain: 0.018, type: 'sine',
        notes: [4, null, null, 3, null, null, null, 2, null, null, null, null],
      },
    };
  }

  /**
   * Start a tune, or stop everything with a falsy name.
   *
   * Scheduled note by note on a timer rather than as one long buffer, so the
   * tune can be swapped the instant the player walks through a door, and so
   * a thirty-two minute session never builds up anything to leak.
   */
  setMusic(name) {
    if (!this.ctx) { this.pendingMusic = name; return; }
    if (this.music && this.music.name === name) return;
    this.stopMusic();
    if (!name) return;
    const tune = Audio.TUNES[name];
    if (!tune) return;

    const scale = Audio.MODE;
    const base = 3 + (tune.octave || 0) * 7;   // start a fourth up the table
    let step = 0;
    const play = () => {
      if (!this.ctx || this.muted || this.sound !== 'all') return;
      const n = tune.notes[step % tune.notes.length];
      step += 1;
      if (n === null || n === undefined) return;
      const freq = scale[Math.max(0, Math.min(scale.length - 1, base + n))];
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = tune.type;
      o.frequency.setValueAtTime(freq, t);
      // Slow attack and a long tail: a sung note, not a blip. Sharing the
      // envelope shape with the UI beeps is what would make this sound like
      // a menu instead of a room.
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(tune.gain, t + 0.09);
      g.gain.exponentialRampToValueAtTime(0.0001, t + tune.beat * 1.55);
      o.connect(g); g.connect(this.musicGain);
      o.start(t); o.stop(t + tune.beat * 1.6);

      // A bare fifth underneath — the one bit of harmony this music is
      // allowed, and the interval that makes it sound like a congregation
      // rather than a solo.
      if (tune.fifth && step % 4 === 1) {
        const o2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(freq / 2 * 1.5, t);
        g2.gain.setValueAtTime(0.0001, t);
        g2.gain.linearRampToValueAtTime(tune.gain * 0.55, t + 0.12);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + tune.beat * 1.8);
        o2.connect(g2); g2.connect(this.musicGain);
        o2.start(t); o2.stop(t + tune.beat * 1.9);
      }
    };
    play();
    this.music = { name, timer: setInterval(play, tune.beat * 1000) };
  }

  stopMusic() {
    if (this.music) clearInterval(this.music.timer);
    this.music = null;
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
