import { useEffect, useRef, useState } from 'react';
import { playBeep, vibrate } from './beep';

/** Runs a short "get ready" countdown before invoking a callback, giving the user time to get
 * into position after tapping play. Anchored to Date.now() like the exercise timers so it stays
 * accurate if the tab is backgrounded mid-countdown. */
export function usePrepCountdown(seconds: number) {
  const [active, setActive] = useState(false);
  const [remaining, setRemaining] = useState(seconds);
  const endAtRef = useRef<number | null>(null);
  const onDoneRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!active) {
      endAtRef.current = null;
      return;
    }
    endAtRef.current = Date.now() + remaining * 1000;

    function tick() {
      if (endAtRef.current == null) return;
      const left = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemaining((prev) => {
        if (left !== prev && left > 0) playBeep(660, 100);
        return left;
      });
      if (left <= 0) {
        endAtRef.current = null;
        setActive(false);
        playBeep(880, 180);
        vibrate(200);
        onDoneRef.current();
      }
    }

    const id = setInterval(tick, 100);
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function start(onDone: () => void) {
    if (seconds <= 0) {
      onDone();
      return;
    }
    onDoneRef.current = onDone;
    setRemaining(seconds);
    setActive(true);
  }

  return { active, remaining, start };
}
