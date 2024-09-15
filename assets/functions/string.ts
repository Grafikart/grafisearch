/**
 * Extract site name from a domain name
 */
export function domainName(url: string): string {
  url = url.replace(/^(https?:\/\/)?(www\.)?/, "");
  const domain = url.split("/")[0].split(".");
  return capitalize(domain.at(-2) ?? "");
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
