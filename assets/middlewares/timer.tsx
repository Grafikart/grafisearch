import {
  computed,
  effect,
  signal,
  useComputed,
  useSignal,
  useSignalEffect,
} from "@preact/signals";
import { headerText } from "../signals/headerText.tsx";
import { secondsToString } from "../functions/time.ts";
import { useEffect } from "preact/compat";

const header = document.querySelector(".header") as HTMLElement;

// Retrieve timer from localStorage
const storageKey = "timer";
const storageItem = localStorage.getItem(storageKey);
const timerInfo = signal<
  { start: number } | { end: number; duration: number } | null
>(storageItem ? JSON.parse(storageItem) : null);

const setTimerInfo = (
  info: { start: number } | { end: number; duration: number },
) => {
  localStorage.setItem(storageKey, JSON.stringify(info));
  timerInfo.value = info;
};

const clearTimerInfo = () => {
  localStorage.removeItem(storageKey);
  timerInfo.value = null;
};

export function timer(q: string): boolean {
  if (q.startsWith("!t")) {
    const matches = q.match(/^!t ([0-9.]+)$/);
    if (matches && matches.length > 1) {
      const duration = parseFloat(matches[1]) * 60_000;
      setTimerInfo({ end: duration + Date.now(), duration: duration });
      return true;
    }
  }
  if (q === "!c") {
    setTimerInfo({ start: Date.now() });
    return true;
  }
  return false;
}

effect(() => {
  headerText.value = timerInfo.value ? <TimerComponent /> : null;
  if (headerText.value) {
    header.classList.add("has-timer");
  } else {
    header.classList.remove("has-timer");
  }
});

// Get the number of seconds elapsed / left
const getTimerSeconds = (): number => {
  if (!timerInfo.value) {
    return 0;
  }
  if ("start" in timerInfo.value) {
    return Math.round((Date.now() - timerInfo.value.start) / 1000);
  }
  return Math.max(0, Math.round((timerInfo.value.end - Date.now()) / 1000));
};

const isDecrementTimer = computed(
  () => timerInfo.value && "end" in timerInfo.value,
);

function TimerComponent() {
  const seconds = useSignal(getTimerSeconds());

  const durationText = useComputed(() => secondsToString(seconds.value));

  useEffect(() => {
    const originalTitle = document.title;
    const timer = setInterval(() => {
      seconds.value = Math.max(getTimerSeconds(), 0);
      if (seconds.value === 0 && isDecrementTimer.value) {
        clearInterval(timer);
      }
    }, 1000);
    return () => {
      document.title = originalTitle;
      clearInterval(timer);
    };
  }, []);

  useSignalEffect(() => {
    if (timerInfo.value && "duration" in timerInfo.value) {
      header.style.setProperty(
        "--progress",
        ((seconds.value * 1000) / timerInfo.value.duration).toFixed(4),
      );
    }
  });

  useSignalEffect(() => {
    document.title = `${durationText.value} Recherche`;
  });

  return <div onClick={clearTimerInfo}>{durationText}</div>;
}
