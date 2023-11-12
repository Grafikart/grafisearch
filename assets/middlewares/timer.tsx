import { setHeaderText } from "../signals/headerText.tsx";
import { secondsToString } from "../functions/time.ts";
import { setPageTitle } from "../functions/dom.ts";
import { createEffect, createSignal } from "solid-js";

const header = document.querySelector(".header") as HTMLElement;

// Retrieve timer from localStorage
const storageKey = "timer";
const storageItem = localStorage.getItem(storageKey);
const [timerInfo, setTimerInfoSignal] = createSignal<
  { start: number } | { end: number; duration: number } | null
>(storageItem ? JSON.parse(storageItem) : null);

const setTimerInfo = (
  info: { start: number } | { end: number; duration: number },
) => {
  localStorage.setItem(storageKey, JSON.stringify(info));
  setTimerInfoSignal(info);
};

const clearTimerInfo = () => {
  localStorage.removeItem(storageKey);
  setTimerInfoSignal(null);
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

// Get the number of seconds elapsed / left
const getTimerSeconds = (): number => {
  const timer = timerInfo();
  if (!timer) {
    return 0;
  }
  if ("start" in timer) {
    return Math.round((Date.now() - timer.start) / 1000);
  }
  return Math.max(0, Math.round((timer.end - Date.now()) / 1000));
};

const isDecrementTimer = () => timerInfo() && "end" in timerInfo()!;

const TimerComponent = () => {
  const [seconds, setSeconds] = createSignal(getTimerSeconds());

  const durationText = () => secondsToString(seconds());

  createEffect(() => {
    const originalTitle = document.title;
    const timer = setInterval(() => {
      const newSeconds = Math.max(getTimerSeconds(), 0);
      setSeconds(newSeconds);
      if (newSeconds === 0 && isDecrementTimer()) {
        clearInterval(timer);
      }
    }, 1000);
    return () => {
      document.title = originalTitle;
      clearInterval(timer);
    };
  }, []);

  createEffect(() => {
    const timer = timerInfo();
    if (timer && "duration" in timer!) {
      header.style.setProperty(
        "--progress",
        ((seconds() * 1000) / timer.duration).toFixed(4),
      );
    }
  });

  createEffect(() => {
    setPageTitle(durationText());
  });

  return <div onClick={clearTimerInfo}>{durationText()}</div>;
};

createEffect(() => {
  const timer = timerInfo();
  setHeaderText(() => (timer ? TimerComponent : ""));
  if (timer) {
    header.classList.add("has-timer");
  } else {
    header.classList.remove("has-timer");
  }
});
