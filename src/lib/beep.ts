let ctx: AudioContext | null = null;

export function playBeep(freq = 880, durationMs = 180): void {
  try {
    if (!ctx) ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // Audio unavailable (autoplay restrictions, unsupported browser) - fail silently.
  }
}

export function vibrate(pattern: number | number[]): void {
  navigator.vibrate?.(pattern);
}
