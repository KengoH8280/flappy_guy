let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function note(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.18, delay = 0) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
  gain.gain.setValueAtTime(0, ac.currentTime + delay);
  gain.gain.linearRampToValueAtTime(vol, ac.currentTime + delay + 0.005);
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + delay + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + delay);
  osc.stop(ac.currentTime + delay + dur + 0.01);
}

function noise(dur: number, vol = 0.08, delay = 0) {
  const ac = getCtx();
  const bufSize = ac.sampleRate * dur;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(vol, ac.currentTime + delay);
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + delay + dur);
  src.connect(gain);
  gain.connect(ac.destination);
  src.start(ac.currentTime + delay);
  src.stop(ac.currentTime + delay + dur + 0.01);
}

export function playFlap() {
  note(280, 0.04, 'square', 0.12);
  note(350, 0.03, 'square', 0.08, 0.02);
}

export function playCoin() {
  note(660, 0.05, 'square', 0.18);
  note(880, 0.05, 'square', 0.16, 0.055);
  note(1100, 0.08, 'square', 0.14, 0.105);
  note(1320, 0.12, 'square', 0.12, 0.165);
}

export function playMiss() {
  note(220, 0.06, 'square', 0.2);
  note(180, 0.06, 'square', 0.2, 0.06);
  note(140, 0.1, 'square', 0.2, 0.12);
  noise(0.08, 0.1, 0.12);
}

export function playDie() {
  note(440, 0.06, 'square', 0.22);
  note(330, 0.06, 'square', 0.22, 0.07);
  note(250, 0.06, 'square', 0.22, 0.14);
  note(180, 0.1, 'square', 0.25, 0.21);
  note(110, 0.18, 'square', 0.25, 0.31);
  noise(0.3, 0.12, 0.25);
}

export function playPoint() {
  note(523, 0.04, 'square', 0.1);
  note(659, 0.04, 'square', 0.1, 0.04);
}

let bgNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let bgRunning = false;
let bgTimeout: ReturnType<typeof setTimeout> | null = null;

const melody = [
  [330, 0.12], [0, 0.06], [330, 0.12], [0, 0.06],
  [392, 0.12], [0, 0.06], [440, 0.12], [0, 0.06],
  [392, 0.18], [0, 0.06],
  [330, 0.12], [0, 0.06], [330, 0.12], [0, 0.06],
  [294, 0.12], [0, 0.06], [330, 0.24], [0, 0.18],
];

function scheduleMelody(startTime: number) {
  const ac = getCtx();
  let t = startTime;
  for (const [f, d] of melody) {
    if (f > 0) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'square';
      osc.frequency.value = f as number;
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.linearRampToValueAtTime(0, t + (d as number) - 0.01);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + (d as number));
    }
    t += d as number;
  }
  return t;
}

const bassLine = [
  [110, 0.18], [0, 0.06], [110, 0.12], [0, 0.06],
  [98, 0.18], [0, 0.06], [110, 0.12], [0, 0.06],
  [98, 0.18], [0, 0.06], [110, 0.12], [0, 0.06],
  [82, 0.24], [0, 0.18],
];

function scheduleBass(startTime: number) {
  const ac = getCtx();
  let t = startTime;
  for (const [f, d] of bassLine) {
    if (f > 0) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = f as number;
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.linearRampToValueAtTime(0, t + (d as number) - 0.01);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + (d as number));
    }
    t += d as number;
  }
}

export function startBgMusic() {
  if (bgRunning) return;
  bgRunning = true;
  const ac = getCtx();
  function loop() {
    if (!bgRunning) return;
    scheduleMelody(ac.currentTime);
    scheduleBass(ac.currentTime);
    const loopLen = melody.reduce((s, [, d]) => s + (d as number), 0);
    bgTimeout = setTimeout(loop, (loopLen - 0.1) * 1000);
  }
  loop();
}

export function stopBgMusic() {
  bgRunning = false;
  if (bgTimeout) clearTimeout(bgTimeout);
  bgTimeout = null;
  for (const { osc, gain } of bgNodes) {
    try { osc.stop(); gain.disconnect(); } catch (_) { /* empty */ }
  }
  bgNodes = [];
}

export function resumeAudioContext() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
}
