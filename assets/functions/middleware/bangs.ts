let bangs: null | Record<string, string> = null;

export function handleBangs(q: string): boolean {
  if (q.startsWith("http")) {
    window.location.href = q;
    return true;
  }

  if (!bangs) {
    bangs = JSON.parse(document.getElementById("bangs")!.textContent!);
  }

  if (!q.includes("!")) {
    return false;
  }
  for (let bang of Object.keys(bangs!)) {
    if (q.includes(bang)) {
      const search = q.replace(bang, "").trim();
      const url = bangs![bang];
      if (url) {
        window.location.href = url.replace(
          "%s",
          encodeURIComponent(search.replaceAll(bang, "").trim()),
        );
        return true;
      }
    }
  }
  return false;
}
