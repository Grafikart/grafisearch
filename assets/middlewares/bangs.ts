const redirectBangs: Record<string, string> = {
    "!rt": "https://www.rottentomatoes.com/search?search=%s",
    "!npm": "https://www.npmjs.com/search?q=%s",
    "!t": "https://www.wordreference.com/enfr/%s",
    "!imdb": "https://www.imdb.com/find?s=all&q=%s",
    "!gh": "https://github.com/search?utf8=%E2%9C%93&q=%s",
    "!yt": "https://www.youtube.com/results?search_query=%s",
    "!d": "https://www.larousse.fr/dictionnaires/francais/%s",
    "!g": "https://www.google.com/search?q=%s",
    "!w": "https://www.yr.no/en/search?q=%s"
}

export function bangs (q: string): boolean {
    if (!q.includes('!')) {
        return false;
    }
    for (let bang of Object.keys(bangs)) {
        if (q.startsWith(bang + " ") || q.endsWith(" " + bang)) {
            const search = q.replace(bang, "").trim()
            const url = redirectBangs[bang]
            window.location.href = url.replace("%s", encodeURIComponent(search))
            return true
        }
    }
    return false
}
