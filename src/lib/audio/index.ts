'use client';

/**
 * Web Audio API utilities for interactive data feedback.
 * Plays subtle musical notes mapped to data values.
 * Uses a pentatonic scale for pleasant harmonics.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    ctx = new AudioContext();
  }
  return ctx;
}

/** Resume AudioContext after user gesture (required by browsers) */
export function resumeAudio(): void {
  const c = getCtx();
  if (c && c.state === 'suspended') {
    c.resume();
  }
}

// Pentatonic scale frequencies (C major pentatonic, starting at C4)
const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 784.0, 880.0];

/**
 * Map a value [0,1] to a pentatonic frequency.
 * Higher achievement = higher pitch.
 */
function valueToFreq(value: number): number {
  const index = Math.round(Math.max(0, Math.min(1, value)) * (PENTATONIC.length - 1));
  return PENTATONIC[index] ?? PENTATONIC[0] ?? 261.63;
}

/**
 * Play a short, soft tone when hovering a data point.
 * @param value - The data value [0,1] to map to pitch
 * @param volume - Volume [0,1], default 0.08 (very subtle)
 */
export function playHoverTone(value: number, volume = 0.08): void {
  const c = getCtx();
  if (!c) return;

  try {
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(valueToFreq(value), c.currentTime);

    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);

    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.35);
  } catch {
    // AudioContext errors are non-fatal
  }
}

/**
 * Play a soft chord when selecting/clicking a data element.
 * Plays a major triad based on the data value.
 */
export function playSelectChord(value: number): void {
  const c = getCtx();
  if (!c) return;

  try {
    const baseFreq = valueToFreq(value);
    // Major triad: root, major third (+4 semitones), perfect fifth (+7 semitones)
    const freqs = [baseFreq, baseFreq * 1.2599, baseFreq * 1.4983];

    freqs.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime);

      gain.gain.setValueAtTime(0, c.currentTime + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.06, c.currentTime + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.05 + 0.6);

      osc.start(c.currentTime + i * 0.05);
      osc.stop(c.currentTime + i * 0.05 + 0.65);
    });
  } catch {
    // AudioContext errors are non-fatal
  }
}

/**
 * Play a rising sweep when a chart view changes.
 * Upward sweep = optimistic transition.
 */
export function playTransitionSweep(direction: 'up' | 'down' = 'up'): void {
  const c = getCtx();
  if (!c) return;

  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'sine';
    const startFreq = direction === 'up' ? 220 : 440;
    const endFreq = direction === 'up' ? 440 : 220;

    osc.frequency.setValueAtTime(startFreq, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + 0.25);

    gain.gain.setValueAtTime(0.06, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);

    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.35);
  } catch {
    // AudioContext errors are non-fatal
  }
}
