import {handleBang} from './bangs.js'

const form = document.querySelector('form')
const url = new URL(window.location.href)
const searchInput = document.querySelector('.search-input')

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = new FormData(e.target).get('q')
    if (search(q)) {
        url.searchParams.set('q', q)
        history.pushState(null, '', url.toString())
        searchInput.value = q
    }
})

searchInput.addEventListener('focus', () => {
    document.body.classList.add('has-focus')
})

searchInput.addEventListener('blur', () => {
    document.body.classList.remove('has-focus')
})

/**
 * Search the result
 * 
 * @param {string} q
 * @return {boolean}
 */
function search(q) {
    if (handleBang(q)) {
        return false;
    }
    document.body.classList.add('has-results')
    document.body.classList.add('is-loading')
    Promise.any([
        fetch(`/google?q=${q}`).then(r => r.json()).then(injectResult('#google'))   , 
        fetch(`/ddg?q=${q}`).then(r => r.json()).then(injectResult('#ddg'))    
    ]).then(() => document.body.classList.remove('is-loading'))
    return true
}

const injectResult = (selector) => (results) => {
    const container = document.querySelector(selector)
    container.innerHTML = results.map(r => {
        const url = new URL(r.url)
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
function buildRelated(result) {
    if (!result.related || result.related.length === 0) {
        return '';
    }
    return `<div class="result__related">` + result.related.map(l => `<a href="${l.url}">${l.title}</a>`).join('') + `</div>`
}

const q = url.searchParams.get('q')
if (q) {
    searchInput.value = q
    search(q)
}