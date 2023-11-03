import { headerText } from "../signals/headerText.tsx";

let hasCalculation = false;
const precision = Math.pow(10, 15);

export function calculator(q: string): boolean {
  if (q.match(/^[0-9]{1}[0-9\s\+\/\-\*\.]*$/)) {
    const result = eval(q);
    headerText.value = " = " + Math.round(result * precision) / precision;
    hasCalculation = true;
    return true;
  } else if (hasCalculation) {
    headerText.value = "";
    hasCalculation = false;
  }
  return false;
}
