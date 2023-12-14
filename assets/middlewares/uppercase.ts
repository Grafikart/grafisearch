import { headerText } from "../signals/headerText.tsx";

let hasResult = false;

export function uppercase(q: string): boolean {
  if (q.includes("!maj")) {
    headerText.value = q.replaceAll("!maj", "").trim().toUpperCase();
    return true;
  } else if (hasResult) {
    headerText.value = null;
    hasResult = false;
  }
  return false;
}
