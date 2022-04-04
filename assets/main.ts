import {handleBang} from './bangs.js'
import './css/app.scss'
import type {SearchResult} from "./types";

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

function search(q: string): boolean {
  if (handleBang(q)) {
    return false;
  }
  searchInput.value = q
  document.body.classList.add('has-results')
  document.body.classList.add('is-loading')
  // @ts-ignore
  Promise.any([
    fetch(`/api/google?q=${q}`).then(r => r.json()).then(injectResult('#google'))   ,
    fetch(`/api/ddg?q=${q}`).then(r => r.json()).then(injectResult('#ddg'))
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
    return `<div class="result">
            <a class="result__title" href="${r.url}">${r.title}</a>
            <a class="result__url">
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
  const q = new URL(e.target.location.href).searchParams.get('q')
  if (!q) {
    document.body.classList.remove('has-results')
    document.querySelector('#google')!.innerHTML = ''
    document.querySelector('#ddg')!.innerHTML = ''
    searchInput.value = ''
  } else {
    search(q)
  }
}