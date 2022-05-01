const headerText = document.querySelector('.header-text') as HTMLDivElement
let hasResult = false

export function uppercase(q: string): boolean {
  const majRe = /^!maj *| *!maj$/
  if (majRe.test(q)) {
    headerText.innerText = ` = ${q.replace(majRe, '').toUpperCase()}`
    hasResult = true
    return true
  } else if (hasResult) {
    headerText.innerHTML = ''
    hasResult = false
  }
  return false
}
