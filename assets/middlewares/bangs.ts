export function bangs (q: string): boolean {
    if (!q.includes('!')) {
        return false;
    }
    for (let bang of Object.keys(window.BANGS)) {
        if (q.startsWith(bang + " ") || q.endsWith(" " + bang)) {
            const search = q.replace(bang, "").trim()
            const url = window.BANGS[bang]
            window.location.href = url.replace("%s", encodeURIComponent(search.replaceAll(bang, "").trim()))
            return true
        }
    }
    return false
}
