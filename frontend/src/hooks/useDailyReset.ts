import { useEffect, useRef } from 'react';
import { api } from '../services/api';

const DEFAULT_RESET_TIME = '02:00';

export function getResetTime(): string {
  return localStorage.getItem('patternforge_reset_time') || DEFAULT_RESET_TIME;
}

export function seedResetTimeFromSettings(): void {
  api.get<{ dailyResetHour?: number; dailyResetMinute?: number }>('/settings')
    .then((data) => {
      const h = String(data.dailyResetHour ?? 2).padStart(2, '0');
      const m = String(data.dailyResetMinute ?? 0).padStart(2, '0');
      localStorage.setItem('patternforge_reset_time', `${h}:${m}`);
    })
    .catch(() => {
      if (!localStorage.getItem('patternforge_reset_time')) {
        localStorage.setItem('patternforge_reset_time', DEFAULT_RESET_TIME);
      }
    });
}

/**
 * Schedules the daily reset at the user's configured time.
 * Triggers server-side reset, clears client caches, and dispatches a global event.
 */
export function useDailyReset(onReset?: () => void) {
  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleReset = () => {
      clearTimer();
      const now = new Date();
      const resetTime = getResetTime();
      const [resetHour, resetMinute] = resetTime.split(':').map(Number);
      const nextReset = new Date();
      nextReset.setHours(resetHour, resetMinute, 0, 0);
      if (nextReset <= now) {
        nextReset.setDate(nextReset.getDate() + 1);
      }
      const msUntilReset = nextReset.getTime() - now.getTime();

      timerRef.current = setTimeout(async () => {
        try {
          await api.post('/daily-reset/execute', {});
        } catch (e) {
          console.error('Daily reset API call failed', e);
        }
        localStorage.removeItem('patternforge_revisions');
        window.dispatchEvent(new CustomEvent('daily-reset'));
        window.dispatchEvent(new CustomEvent('refresh-stats'));
        onResetRef.current?.();
        scheduleReset();
      }, msUntilReset);
    };

    scheduleReset();

    const handleSettingsSaved = () => scheduleReset();
    window.addEventListener('settings-saved', handleSettingsSaved);

    return () => {
      clearTimer();
      window.removeEventListener('settings-saved', handleSettingsSaved);
    };
  }, []);
}
