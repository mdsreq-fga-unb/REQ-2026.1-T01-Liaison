import { API_BASE_URL, apiUrl } from "./api";

describe("API configuration", () => {
  describe("API_BASE_URL", () => {
    it("should export a non-empty string", () => {
      expect(typeof API_BASE_URL).toBe("string");
      expect(API_BASE_URL.length).toBeGreaterThan(0);
    });

    it("should start with http:// or https://", () => {
      expect(API_BASE_URL).toMatch(/^https?:\/\//);
    });

    it("should contain the API version path segment", () => {
      expect(API_BASE_URL).toContain("/api/v1");
    });
  });

  describe("apiUrl()", () => {
    it("should prepend the base URL to a path starting with /", () => {
      const url = apiUrl("/auth/token/");
      expect(url).toBe(`${API_BASE_URL.replace(/\/$/, "")}/auth/token/`);
    });

    it("should prepend the base URL to a path NOT starting with /", () => {
      const url = apiUrl("auth/token/");
      expect(url).toBe(`${API_BASE_URL.replace(/\/$/, "")}/auth/token/`);
    });

    it("should not double-slash when base URL ends with / and path starts with /", () => {
      const url = apiUrl("/health/");
      expect(url).not.toContain("//health");
    });

    it("should handle empty path gracefully by appending /", () => {
      const url = apiUrl("");
      expect(url).toBe(API_BASE_URL.replace(/\/$/, "") + "/");
    });

    it("should handle deeply nested paths", () => {
      const url = apiUrl("/users/profiles/123/");
      expect(url).toContain("/users/profiles/123/");
      expect(url).toMatch(/^https?:\/\//);
    });

    it("should return a valid URL string", () => {
      const url = apiUrl("/opportunities/");
      expect(() => new URL(url)).not.toThrow();
    });
  });
});
