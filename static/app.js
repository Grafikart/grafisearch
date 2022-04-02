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
    fetch(`/google?q=${q}`).then(r => r.json()).then(injectResult('#google'))    
}

const injectResult = (selector) => (results) => {
    const container = document.querySelector(selector)
    container.innerHTML = results.map(r => `<div class="result">
        <h2 class="result__title">${r.title}</h2>
        <em>${r.url.replace('https://', '')}</em>
        <p>${r.desc}</p>
        <a class="result__link" href="${r.url}"></a>
    </div>`).join('')
}

const q = url.searchParams.get('q')
if (q) {
    search(q)
}