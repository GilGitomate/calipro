import { useEffect } from 'react';

/** Keeps the screen awake while `active` is true (e.g. a timer is running), so the phone
 * doesn't lock mid-hold. Silently does nothing on browsers without Wake Lock support. */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    navigator.wakeLock
      .request('screen')
      .then((s) => {
        if (cancelled) {
          s.release();
        } else {
          sentinel = s;
        }
      })
      .catch(() => {
        // Denied or unavailable (e.g. backgrounded tab) - fail silently.
      });

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !sentinel) {
        navigator.wakeLock
          .request('screen')
          .then((s) => {
            if (!cancelled) sentinel = s;
          })
          .catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
}
