export function bangs(q: string): boolean {
  if (!q.includes('!') || !window.BANGS) {
    return false
  }
  for (let bang of Object.keys(window.BANGS)) {
    // regex for test if the query start or finish with the bang
    const bangRe = RegExp(`^${bang} *| *${bang}$`)
    if (bangRe.test(q)) {
      // clear the bang
      const search = q.replace(bangRe, '')
      const url = window.BANGS[bang]
      if (url) {
        window.location.assign(
          url.replace(
            '%s',
            encodeURIComponent(search)
          )
        )
        return true
      }
    }
  }
  return false
}
