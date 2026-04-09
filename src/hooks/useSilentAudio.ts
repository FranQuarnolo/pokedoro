import { useCallback, useRef } from "react";

/**
 * Creates a silent AudioContext oscillator while the timer is running.
 * Required to keep the Media Session API attached so Android shows
 * the timer notification in the notification shade.
 */
export const useSilentAudio = () => {
  const ctxRef = useRef<AudioContext | null>(null);

  const start = useCallback(async () => {
    try {
      if (ctxRef.current && ctxRef.current.state !== "closed") return;
      const ctx = new AudioContext();
      await ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.001; // near-silent but non-zero so Android keeps media session alive
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      ctxRef.current = ctx;
    } catch {
      // AudioContext may fail in some environments; silently ignore
    }
  }, []);

  const stop = useCallback(() => {
    try {
      ctxRef.current?.close();
    } catch {}
    ctxRef.current = null;
  }, []);

  return { start, stop };
};
