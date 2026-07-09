import { useEffect, useRef } from 'react';
import { api } from '../services/api';

const DEFAULT_RESET_TIME = '02:00';

export const EMPTY_DAILY_TASK = {
  selectedModules: '',
  completedModules: '',
  targetDurations: '',
  remainingDurations: '',
  elapsedDurations: '',
  statuses: '',
};

export function getResetTime(): string {
  return localStorage.getItem('patternforge_reset_time') || DEFAULT_RESET_TIME;
}

export function setResetTime(hour: number, minute: number): void {
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  localStorage.setItem('patternforge_reset_time', `${h}:${m}`);
}

export function seedResetTimeFromSettings(): void {
  api.get<{ dailyResetHour?: number; dailyResetMinute?: number }>('/settings')
    .then((data) => {
      setResetTime(data.dailyResetHour ?? 2, data.dailyResetMinute ?? 0);
    })
    .catch(() => {
      if (!localStorage.getItem('patternforge_reset_time')) {
        localStorage.setItem('patternforge_reset_time', DEFAULT_RESET_TIME);
      }
    });
}

/** Immediately zero client-side caches and broadcast instant UI reset before the API call. */
export function applyInstantDailyReset(): void {
  localStorage.removeItem('patternforge_revisions');
  window.dispatchEvent(new CustomEvent('daily-reset-instant'));
}

/** Runs the server reset and broadcasts a global event so every view refreshes from API. */
export async function executeDailyReset(): Promise<void> {
  applyInstantDailyReset();
  try {
    await api.post('/daily-reset/execute', {});
  } catch (e) {
    console.error('Daily reset API call failed', e);
  }
  window.dispatchEvent(new CustomEvent('daily-reset'));
  window.dispatchEvent(new CustomEvent('refresh-stats'));
}

let schedulerTimer: ReturnType<typeof setTimeout> | null = null;

function clearSchedulerTimer() {
  if (schedulerTimer) {
    clearTimeout(schedulerTimer);
    schedulerTimer = null;
  }
}

function scheduleNextReset() {
  clearSchedulerTimer();
  const now = new Date();
  const resetTime = getResetTime();
  const [resetHour, resetMinute] = resetTime.split(':').map(Number);
  const nextReset = new Date();
  nextReset.setHours(resetHour, resetMinute, 0, 0);
  if (nextReset <= now) {
    nextReset.setDate(nextReset.getDate() + 1);
  }
  const msUntilReset = nextReset.getTime() - now.getTime();

  schedulerTimer = setTimeout(async () => {
    await executeDailyReset();
    scheduleNextReset();
  }, msUntilReset);
}

/** Mount once at app root — single timer for the entire site. */
export function useDailyResetScheduler(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      clearSchedulerTimer();
      return;
    }

    scheduleNextReset();

    const reschedule = () => scheduleNextReset();
    window.addEventListener('settings-saved', reschedule);
    window.addEventListener('reset-time-changed', reschedule);

    return () => {
      clearSchedulerTimer();
      window.removeEventListener('settings-saved', reschedule);
      window.removeEventListener('reset-time-changed', reschedule);
    };
  }, [enabled]);
}

/** Subscribe any component to the global daily-reset event (fires after API). */
export function useOnDailyReset(onReset: () => void) {
  const callbackRef = useRef(onReset);
  callbackRef.current = onReset;

  useEffect(() => {
    const handler = () => callbackRef.current();
    window.addEventListener('daily-reset', handler);
    return () => window.removeEventListener('daily-reset', handler);
  }, []);
}

/** Subscribe for instant UI zeroing the moment reset time hits (before API returns). */
export function useOnDailyResetInstant(onReset: () => void) {
  const callbackRef = useRef(onReset);
  callbackRef.current = onReset;

  useEffect(() => {
    const handler = () => callbackRef.current();
    window.addEventListener('daily-reset-instant', handler);
    return () => window.removeEventListener('daily-reset-instant', handler);
  }, []);
}
