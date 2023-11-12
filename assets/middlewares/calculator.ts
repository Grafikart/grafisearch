import { setHeaderText } from "../signals/headerText.tsx";

let hasCalculation = false;
const precision = Math.pow(10, 15);

export function calculator(q: string): boolean {
  if (q.match(/^[0-9]{1}[0-9\s\+\/\-\*\.]*$/)) {
    const result = eval(q);
    setHeaderText(" = " + Math.round(result * precision) / precision);
    hasCalculation = true;
    return true;
  } else if (hasCalculation) {
    setHeaderText("");
    hasCalculation = false;
  }
  return false;
}
