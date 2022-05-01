import { bangs } from './middlewares/bangs.js'
import { calculator } from './middlewares/calculator.js'
import { youtubeThumbnail } from './youtube.js'
import { timer } from './middlewares/timer'
import { uppercase } from './middlewares/uppercase.js'
import './css/app.scss'

const form = document.querySelector('form') as HTMLFormElement
const url = new URL(window.location.href)
const searchInput = document.querySelector('.search-input') as HTMLInputElement

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const q = new FormData(e.target as HTMLFormElement).get('q')!
  const query = q.toString().trim()
  if (query == "") return
  if (search(query)) {
    url.searchParams.set('q', query)
    history.pushState(null, '', url.toString())
  }
})

searchInput.addEventListener('focus', () => {
  document.body.classList.add('has-focus')
})

searchInput.addEventListener('blur', () => {
  document.body.classList.remove('has-focus')
})

const middlewares = [bangs, calculator, timer, uppercase]

function search(q: string): boolean {
  searchInput.value = q
  // Short-circuit the search with specific handlers
  for (const middleware of middlewares) {
    if (middleware(q)) {
      return false
    }
  }
  document.title = `${q} - Recherche`
  document.body.classList.add('has-results')
  document.body.classList.add('is-loading')
  Promise.any([
    fetch(`/api/google?q=${q}`)
      .then((r) => r.json())
      .then(redirectIfExclamationMark(q))
      .then(injectResult('#google')),
    fetch(`/api/ddg?q=${q}`)
      .then((r) => r.json())
      .then(redirectIfExclamationMark(q))
      .then(injectResult('#ddg')),
  ])
    .then(() => document.body.classList.remove('is-loading'))
    .catch(console.error)
  return true
}

const redirectIfExclamationMark =
  (q: string) =>
    (r: SearchResult[]): SearchResult[] => {
      if (q.endsWith('!') && r[0] !== undefined) {
        window.location.href = r[0].url
        throw new Error('Redirecting')
      }
      return r
    }

const injectResult = (selector: string) => (results: SearchResult[]) => {
  const container = document.querySelector(selector) as HTMLDivElement
  const isGoogle = selector === '#google'
  container.innerHTML = results
    .map((r) => {
      const favicon = `https://external-content.duckduckgo.com/ip3/${r.domain}.ico`
      const link = r.url
        .replace('https://', '')
        .replace('www.', '')
        .replace(/\/$/, '')
      let img = null
      if (r.url.startsWith('https://www.youtube.com/watch')) {
        img = youtubeThumbnail(r.url)
        const [, durationInWords] = r.desc.split('. ')
        const duration = durationInWords
          ? durationInWords
            .replaceAll(' minutes', 'min')
            .replaceAll(' et ', '')
            .replaceAll('secondes', '')
          : ''
        const author = r.author ? r.author.replace('YouTube · ', '') : 'YouTube'
        return `<div class="result result--img">
            <img class="result__img" src="${img}" alt="">
            <div>
              <a tabindex="-1" rel="noopener noreferrer" class="result__title" href="${r.url}">${r.title}</a>
              <div tabindex="-1" class="result__url">
                  <img src="${favicon}" alt="">
                  <span>${author}</span>
              </div>
              <p class="result__desc">${duration}</p>
            </div>
            <a class="result__link" rel="noopener noreferrer" href="${r.url
          }"></a>
            ${logButton(!isGoogle, r.url)}
        </div>`
      }
      return `<div class="result">
      <a tabindex="-1" class="result__title" rel="noopener noreferrer" href="${r.url}">${r.title}</a>
      <div tabindex="-1" class="result__url">
          <img src="${favicon}" alt="">
          <span>${link}</span>
      </div>
      <p class="result__desc">${r.desc}</p>
      ${buildRelated(r)}
      <a class="result__link" rel="noopener noreferrer" href="${r.url}"></a>
      ${logButton(!isGoogle, r.url)}
    </div>`
    })
    .join('')
  container.querySelectorAll('.results-confirm').forEach((b) => {
    b.addEventListener('click', logButtonHandler)
  })
}

/**
 * Add log button
 */
function logButton(found: boolean, url: string) {
  return `<a rel="noopener noreferrer" href="${url}" class="btn-icon results-confirm" data-found="${Number(found)}">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
        </svg>
    </a>`
}

/**
 * Log a good result found on the page
 */
async function logButtonHandler(e: Event) {
  const target = e.currentTarget as HTMLAnchorElement
  const url = target.getAttribute('href')
  const found = target.dataset.found!
  const q = new URL(window.location.href).searchParams.get('q')!
  navigator.sendBeacon(
    '/api/log',
    JSON.stringify({
      q,
      found: found === '1',
      googleFound:
        found === '0' ||
        document.querySelector(`#google a[href^='${url}']`) !== null,
      url,
    })
  )
}

document
  .querySelector('.bad-results')!
  .addEventListener('click', async (e: Event) => {
    e.preventDefault()
    const button = e.currentTarget as HTMLButtonElement
    const q = new URL(window.location.href).searchParams.get('q')!
    const r = await fetch('/api/log', {
      body: JSON.stringify({
        q,
        found: false,
        googleFound: false,
      }),
      method: 'POST',
    })
    if (!r.ok) alert((await r.json()).message)
    else button.classList.add('is-active')
  })

/**
 * Build the structure for related links
 *
 * @param {{related: {url: string, title: string}[]}} result
 * @returns
 */
function buildRelated(result: SearchResult) {
  if (!result.related || result.related.length === 0) {
    return ''
  }
  return (
    `<div class="result__related">` +
    result.related
      .map((l) => `<a rel="noopener noreferrer" href="${l.url}">${l.title}</a>`)
      .join('') +
    `</div>`
  )
}

const q = url.searchParams.get('q')?.trim()
if (!!q) search(q)

// Handle history
window.onpopstate = function () {
  const q = new URL(window.location.href).searchParams.get('q')
  if (!q) {
    document.body.classList.remove('has-results')
    document.querySelector('#google')!.innerHTML = ''
    document.querySelector('#ddg')!.innerHTML = ''
    searchInput.value = ''
  } else search(q)
}
