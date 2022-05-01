const headerText = document.querySelector('.header-text') as HTMLDivElement
let hasResult = false

export function uppercase(q: string): boolean {
	if (q.includes('!maj')) {
		headerText.innerText = ` = ${q.replaceAll('!maj', '').trim().toUpperCase()}`
		return true
	} else if (hasResult) {
		headerText.innerHTML = ''
		hasResult = false
	}
	return false
}
