const headerText = document.querySelector('.header-text') as HTMLDivElement
let hasCalculation = false
const precision = Math.pow(10, 15)

export function calculator(q: string): boolean {
  if (q.match(/^[0-9]{1}[0-9\s\+\/\-\*\.]*$/)) {
    const result = eval(q);
    headerText.innerText =
      " = " + Math.round(result * precision) / precision;
    hasCalculation = true;
    return true;
  } else if (hasCalculation) {
    headerText!.innerHTML = "";
    hasCalculation = false;
  }
  return false;
}
