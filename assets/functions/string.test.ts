import { describe, it, expect } from "vitest";
import { domainName } from "./string.ts";

describe("string", () => {
  describe("domain()", () => {
    it.each([
      ["Simple URL", "https://example.com", "Example"],
      ["URL Without protocol", "example.com", "Example"],
      ["URL with www", "http://www.example.com", "Example"],
      ["URL with subdomain", "https://blog.example.com", "Example"],
      ["URL with path", "https://example.com/path/to/page", "Example"],
      ["URL with query params", "https://example.com?param=value", "Example"],
      ["Invalid URL", "not-a-url", ""],
    ])("Work with %s domainName(%s) -> %s", (_, url, expected) => {
      expect(domainName(url)).toBe(expected);
    });
  });
});
