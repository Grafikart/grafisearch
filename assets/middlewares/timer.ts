const headerText = document.querySelector('.header-text') as HTMLDivElement
const header = document.querySelector('.header') as HTMLDivElement

let currentTimer: Timer | null = null
let timeout: number | null = null
const storageKey = 'timer'
let previousTimer = localStorage.getItem(storageKey)
if (previousTimer) {
	currentTimer = JSON.parse(previousTimer)
	headerText.addEventListener('click', cleanTimer, { once: true })
	updateTimer()
}

export function timer(q: string): boolean {
	if (q.startsWith('!t')) {
		const matches = q.match(/^!t ([0-9\.]+)$/)
		if (matches && matches.length > 1) {
			const duration = parseFloat(matches[1]) * 60_000
			const end = duration + Date.now()
			currentTimer = { duration, end }
			localStorage.setItem(storageKey, JSON.stringify(currentTimer))
			updateTimer()
			headerText.addEventListener('click', cleanTimer, { once: true })
			return true
		}
	}
	return false
}

function cleanTimer() {
	header.classList.remove('has-timer')
	header.style.removeProperty('--progress')
	headerText.innerHTML = ''
	headerText.removeEventListener('click', cleanTimer)
	localStorage.removeItem(storageKey)
	if (timeout) {
		clearTimeout(timeout)
		timeout = null
	}
}

function updateTimer() {
	if (timeout) {
		clearTimeout(timeout)
		timeout = null
	}
	if (!currentTimer) {
		return
	}
	const ms = Math.max(currentTimer.end - Date.now(), 0)
	const minutes = Math.floor(ms / 60_000)
		.toString()
		.padStart(2, '0')
	const secondes = Math.round((ms / 1000) % 60)
		.toString()
		.padStart(2, '0')
	headerText.innerText = `${minutes}:${secondes}`
	header.classList.add('has-timer')
	header.style.setProperty(
		'--progress',
		(ms / currentTimer.duration).toFixed(4)
	)
	if (ms > 0) {
		timeout = window.setTimeout(updateTimer, 1000)
	} else {
		const audio = new Audio('/static/alarm.ogg')
		audio.loop = true
		audio.play()
		window.addEventListener(
			'click',
			() => {
				audio.pause()
				cleanTimer()
			},
			{ once: true }
		)
		localStorage.removeItem(storageKey)
	}
}
