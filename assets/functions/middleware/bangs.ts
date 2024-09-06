let bangs: null | Record<string, string> = null;

/**
 * Handle bangs and redirection
 */
export function handleBangs(q: string): boolean {
  // The query is an URL
  if (q.startsWith("http://") || q.startsWith("https://")) {
    window.location.replace(q);
    return true;
  }

  // Load the bangs list from the page content
  if (!bangs) {
    bangs = JSON.parse(document.getElementById("bangs")!.textContent!);
  }

  // Extract a possible bang from the query
  const matches = q.match(/![a-z]+/);
  if (!matches) {
    return false;
  }

  const bang = matches[0];
  const redirectionURL = bangs![bang];
  if (!redirectionURL) {
    return false;
  }

  window.location.replace(
    redirectionURL.replace(
      "%s",
      encodeURIComponent(q.replaceAll(bang, "").trim()),
    ),
  );
  return true;
}
