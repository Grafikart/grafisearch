import {
  signal,
  useComputed,
  useSignal,
  useSignalEffect,
} from "@preact/signals";
import { useRef } from "preact/hooks";
import { secondsToString } from "../functions/time.ts";
import { withViewTransition } from "../functions/dom.ts";

type TimerInfo = { start: number } | { end: number; duration: number } | null;

const storageKey = "timer";
const storageItem = localStorage.getItem(storageKey);
const timerInfo = signal<TimerInfo>(
  storageItem ? JSON.parse(storageItem) : null
);

// Allow updating the signal from outside
export const setTimerInfo = (info: TimerInfo) => {
  if (info === null) {
    localStorage.removeItem(storageKey);
    timerInfo.value = null;
    return;
  }
  localStorage.setItem(storageKey, JSON.stringify(info));
  timerInfo.value = info;
};

// Get the number of seconds elapsed (for stopwatch) or left (for countdown)
const getTimerSeconds = (info: TimerInfo): number => {
  if (!info) {
    return 0;
  }
  if ("start" in info) {
    return Math.round((Date.now() - info.start) / 1000);
  }
  return Math.max(0, Math.round((info.end - Date.now()) / 1000));
};

const isCountdown = (
  info: TimerInfo
): info is { end: number; duration: number } => {
  return Boolean(info && "end" in info);
};

export function Timer() {
  const timerRef = useRef<HTMLDivElement>(null);
  const seconds = useSignal(getTimerSeconds(timerInfo.value));
  const timeInText = useComputed(() => secondsToString(seconds.value));
  const style = useComputed(() => {
    const info = timerInfo.value;
    if (!isCountdown(info)) {
      return undefined;
    }
    return `--progress: ${((seconds.value * 1000) / info.duration).toFixed(4)}`;
  });

  // Add an interval if a timer is running
  useSignalEffect(() => {
    const originalTitle = document.title;
    const info = timerInfo.value;
    if (info === null) {
        return;
    }
    const updateSeconds = () => {
      seconds.value = Math.max(getTimerSeconds(info), 0);
      document.title = timeInText.value + " - Grafisearch";
    };
    const timer = setInterval(() => {
      updateSeconds();
      if (seconds.value === 0 && isCountdown(info)) {
        clearInterval(timer);
      }
    }, 1_000);
    updateSeconds();
    return () => {
      document.title = originalTitle;
      clearInterval(timer);
    };
  });

  if (!timerInfo.value) {
    return null;
  }

  const reset = () => {
    withViewTransition(() => setTimerInfo(null));
  };

  return (
    <div ref={timerRef} class="search-timer" style={style} onClick={reset}>
      {timeInText}
    </div>
  );
}
