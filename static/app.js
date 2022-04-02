const form = document.querySelector('form')
const url = new URL(window.location.href)

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = new FormData(e.target).get('q')
    search(q)
    url.searchParams.set('q', q)
    history.pushState(null, '', url.toString())
})

/**
 * Search the result
 * 
 * @param {string} q
 */
function search(q) {
    document.body.classList.add('has-results')
    fetch(`/google?q=${q}`).then(r => r.json()).then(injectResult('#google'))    
}

const injectResult = (selector) => (results) => {
    const container = document.querySelector(selector)
    container.innerHTML = results.map(r => {
        const url = new URL(r.url)
        const favicon = `https://external-content.duckduckgo.com/ip3/${url.host}.ico`
        const domain = r.url
            .replace('https://', '')
            .replace(/\/$/, '')
        return `<div class="result">
            <a class="result__title" href="${r.url}">${r.title}</a>
            <a class="result__url">
                <img src="${favicon}" alt="">
                <span>${domain}</span>
            </a>
            <p>${r.desc}</p>
            <a class="result__link" href="${r.url}"></a>
        </div>`
    }).join('')
}

const q = url.searchParams.get('q')
if (q) {
    search(q)
}