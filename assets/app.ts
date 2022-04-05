import { bangs } from './middlewares/bangs.js'
import { calculator } from './middlewares/calculator.js';
import './css/app.scss'
import type { SearchResult } from "./types";
import { youtubeThumbnail } from './youtube.js';
import { timer } from './middlewares/timer'

const form = document.querySelector('form') as HTMLFormElement
const url = new URL(window.location.href)
const searchInput = document.querySelector('.search-input') as HTMLInputElement

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = new FormData(e.target as HTMLFormElement).get('q')!
  if (search(q.toString())) {
    url.searchParams.set('q', q.toString())
    history.pushState(null, '', url.toString())
  }
})

searchInput.addEventListener('focus', () => {
  document.body.classList.add('has-focus')
})

searchInput.addEventListener('blur', () => {
  document.body.classList.remove('has-focus')
})

const middlewares = [bangs, calculator, timer]

function search(q: string): boolean {
  searchInput.value = q
  // Short-circuit the search with specific handlers
  for (const middleware of middlewares) {
    if (middleware(q)) {
      return false;
    }
  }
  document.title = `${q} - Recherche`
  document.body.classList.add('has-results')
  document.body.classList.add('is-loading')
  // @ts-ignore
  Promise.any([
    fetch(`/api/google?q=${q}`).then(r => r.json()).then(injectResult('#google')).catch(console.error),
    fetch(`/api/ddg?q=${q}`).then(r => r.json()).then(injectResult('#ddg')).catch(console.error)
  ]).then(() => document.body.classList.remove('is-loading'))
  return true
}

const injectResult = (selector: string) => (results: SearchResult[]) => {
  const container = document.querySelector(selector) as HTMLDivElement
  container.innerHTML = results.map(r => {
    const favicon = `https://external-content.duckduckgo.com/ip3/${r.domain}.ico`
    const link = r.url
      .replace('https://', '')
      .replace('www.', '')
      .replace(/\/$/, '')
    let img = null
    if (r.url.startsWith("https://www.youtube.com/watch")) {
      img = youtubeThumbnail(r.url)
      const [_, durationInWords] = r.desc.split(". ")
      const duration = durationInWords ? durationInWords
        .replaceAll(" minutes", "min")
        .replaceAll(" et ", "")
        .replaceAll("secondes", "") : ''
      const author = r.author ? r.author.replace('YouTube · ', '') : 'YouTube'
      return `<div class="result result--img">
            <img class="result__img" src="${img}" alt="">
            <div>
              <a tabindex="-1" class="result__title" href="${r.url}">${r.title}</a>
              <a tabindex="-1" class="result__url" href="${r.url}">
                  <img src="${favicon}" alt="">
                  <span>${author}</span>
              </a>
              <p class="result__desc">${duration}</p>
            </div>
            <a class="result__link" href="${r.url}"></a>
        </div>`
    }
    return `<div class="result">
      <a tabindex="-1" class="result__title" href="${r.url}">${r.title}</a>
      <a tabindex="-1" class="result__url" href="${r.url}">
          <img src="${favicon}" alt="">
          <span>${link}</span>
      </a>
      <p class="result__desc">${r.desc}</p>
      ${buildRelated(r)}
      <a class="result__link" href="${r.url}"></a>
    </div>`
  }).join('')
}

/**
 * Build the structure for related links
 *
 * @param {{related: {url: string, title: string}[]}} result
 * @returns
 */
function buildRelated(result: SearchResult) {
  if (!result.related || result.related.length === 0) {
    return '';
  }
  return `<div class="result__related">` + result.related.map(l => `<a href="${l.url}">${l.title}</a>`).join('') + `</div>`
}

const q = url.searchParams.get('q')
if (q) {
  search(q)
}

// Handle history
window.onpopstate = function (e) {
  const q = new URL(window.location.href).searchParams.get('q')
  if (!q) {
    document.body.classList.remove('has-results')
    document.querySelector('#google')!.innerHTML = ''
    document.querySelector('#ddg')!.innerHTML = ''
    searchInput.value = ''
  } else {
    search(q)
  }
}
