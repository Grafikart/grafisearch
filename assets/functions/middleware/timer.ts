import { setTimerInfo } from "../../components/Timer.tsx";

/**
 * Handle !t and !c bangs
 */
export function handleTimer(q: string): boolean {
    // Starts a countdown timer in minutes "!t 10"
    if (q.startsWith("!t")) {
        const matches = q.match(/^!t ([0-9.]+)$/);
        if (matches && matches.length > 1) {
          const duration = parseFloat(matches[1]) * 60_000;
          setTimerInfo({ end: duration + Date.now(), duration: duration });
          return true;
        }
    }
    // Starts a stopwatch
    if (q === "!tt") {
        setTimerInfo({ start: Date.now() });
        return true;
    }
    return false;
}