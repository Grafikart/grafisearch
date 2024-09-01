import { describe, it, expect } from "vitest";
import { siteName } from "./string";

describe("string", () => {
  describe("domain()", () => {
    const testCases: [string, string, string][] = [
      ["Simple URL", "https://example.com", "Example"],
      ["URL Without protocol", "example.com", "Example"],
      ["URL with www", "http://www.example.com", "Example"],
      ["URL with subdomain", "https://blog.example.com", "Example"],
      ["URL with path", "https://example.com/path/to/page", "Example"],
      ["URL with query params", "https://example.com?param=value", "Example"],
      ["Invalid URL", "not-a-url", ""],
    ];

    testCases.forEach(([name, url, expected]) => {
      it(name, () => {
        const result = siteName(url);
        expect(result).toBe(expected);
      });
    });
  });
});
