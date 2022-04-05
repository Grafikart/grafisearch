const form = (document.querySelector('.search-form') as HTMLFormElement)
let calculatorResult: HTMLDivElement | null = null
let hasCalculation = false
const precision = Math.pow(10, 15)

export function handleCalc(q: string): boolean {
  if (q.match(/^[0-9]{1}[0-9\s\+\/\-\*\.]*$/)) {
    const result = eval(q);
    if (!calculatorResult) {
      calculatorResult = document.createElement("div");
      calculatorResult.classList.add("calculator-result");
      form.after(calculatorResult);
    }
    calculatorResult.innerText =
      " = " + Math.round(result * precision) / precision;
    hasCalculation = true;
    return true;
  } else if (hasCalculation) {
    calculatorResult.innerHTML = "";
    hasCalculation = false;
  }
  return false;
}