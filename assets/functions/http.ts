export function jsonFetch<T>(
  url: string,
  params: { query?: Record<string, string> } & RequestInit = {}
): Promise<T> {
  const query = params.query
    ? `?${new URLSearchParams(params.query).toString()}`
    : "";
  params.headers = {
    Accept: "application/json",
    ...params.headers,
  };
  return fetch(`${url}${query}`, params).then((r) => {
    if (r.ok) {
      return r.json();
    }
    throw new Error(`Cannot fetch ${url}: ${r.status} ${r.statusText}`);
  });
}
