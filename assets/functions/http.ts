export function jsonFetch<T>(
  url: string,
  params: { query?: Record<string, string> } & RequestInit
): Promise<T> {
  const query = params.query
    ? `?${new URLSearchParams(params.query).toString()}`
    : "";
  params.headers = {
    Accept: "application/json",
    ...params.headers,
  };
  return fetch(`${url}${query}`, params).then((r) => r.json());
}