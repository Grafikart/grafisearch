import { type ComponentChild, type JSX } from "preact";
import { handleBangs } from "./bangs.ts";
import { handleTimer } from "./timer.ts";

/**
 * Pass the query through a list of middleware that can intercept the default behaviour and add custom logic
 */
export const matchMiddlewares = (q: string): ComponentChild => {
  for (const middleware of [
    handleBangs,
    handleCalculation,
    handleTimer,
    handleMaj,
    handleHex,
  ]) {
    const component = middleware(q);
    if (component) {
      return component;
    }
  }
  return null;
};

export function handleHex(q: string): JSX.Element | null {
  if (q.startsWith("!hex")) {
    const n = Math.round(parseInt(q.replaceAll("!hex", "").trim(), 10) * 2.55);
    return <div class="search-top__text">= {n.toString(16)}</div>;
  }
  return null;
}

export function handleCalculation(q: string): JSX.Element | null {
  if (q.match(/^[0-9]{1}[0-9\s\+\/\-\*\.]*$/)) {
    const precision = Math.pow(10, 15);
    return (
      <div class="search-top__text">
        = {Math.round(eval(q) * precision) / precision}
      </div>
    );
  }
  return null;
}

export function handleMaj(q: string): JSX.Element | null {
  if (q.includes("!maj")) {
    return (
      <div class="search-top__text">
        = {q.replaceAll("!maj", "").trim().toUpperCase()}
      </div>
    );
  }
  return null;
}
