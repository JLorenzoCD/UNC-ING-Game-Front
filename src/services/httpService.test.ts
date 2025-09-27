import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createHttpService, type HttpService } from "./httpService";

declare const global: any;

// Mockeamos fetch globalmente
global.fetch = vi.fn();

describe("httpService", () => {
  let httpService: HttpService;
  let mockFetch: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reseteamos la variable de entorno antes de cada test
    delete (import.meta.env as any).VITE_API_URL;

    mockFetch = global.fetch as any;
    httpService = createHttpService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Service creation", () => {
    it("creates an HTTP service with correct initial state", () => {
      expect(httpService).toHaveProperty("request");
      expect(typeof httpService.request).toBe("function");
    });

    it("creates independent service instances", () => {
      const anotherHttpService = createHttpService();

      expect(anotherHttpService).not.toBe(httpService);
      expect(anotherHttpService).toHaveProperty("request");
    });

    it("uses default base URL when VITE_API_URL is not defined", () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ test: "data" })
      });

      httpService.request("/test");

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/test", {
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    it("uses VITE_API_URL when defined", () => {
      vi.mocked(import.meta.env).VITE_API_URL = "https://api.example.com";
      const customHttpService = createHttpService();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ test: "data" })
      });

      customHttpService.request("/test");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  });

  describe("Request method", () => {
    it("makes successful GET request", async () => {
      const mockData = { id: "1", name: "Test" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockData)
      });

      const result = await httpService.request<typeof mockData>("/test");

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/test", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(mockData);
    });

    it("makes successful POST request with body", async () => {
      const mockData = { id: "1", name: "Test" };
      const requestBody = { name: "Test" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockData)
      });

      const result = await httpService.request<typeof mockData>("/test", {
        method: "POST",
        body: JSON.stringify(requestBody)
      });

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/test", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(result).toEqual(mockData);
    });

    it("merges custom headers with default headers", async () => {
      const mockData = { test: "data" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockData)
      });

      await httpService.request("/test", {
        headers: {
          "Authorization": "Bearer token",
          "Custom-Header": "value"
        }
      });

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/test", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer token",
          "Custom-Header": "value"
        },
      });
    });

    it("handles HTTP error responses", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(httpService.request("/test")).rejects.toThrow("HTTP error! status: 404");
      expect(consoleSpy).toHaveBeenCalledWith("API request failed with error:", expect.any(Error));
      consoleSpy.mockRestore();
    });

    it("handles network errors", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const networkError = new Error("Network error");
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(httpService.request("/test")).rejects.toThrow("Network error");
      expect(consoleSpy).toHaveBeenCalledWith("API request failed with error:", networkError);
      consoleSpy.mockRestore();
    });

    it("handles JSON parsing errors", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockRejectedValueOnce(new Error("Invalid JSON"))
      });

      await expect(httpService.request("/test")).rejects.toThrow("Invalid JSON");
      expect(consoleSpy).toHaveBeenCalledWith("API request failed with error:", expect.any(Error));
      consoleSpy.mockRestore();
    });

    it("constructs URLs correctly with different routes", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({})
      });

      await httpService.request("/users");
      expect(mockFetch).toHaveBeenLastCalledWith("http://localhost:8000/users", expect.any(Object));

      await httpService.request("/api/v1/data");
      expect(mockFetch).toHaveBeenLastCalledWith("http://localhost:8000/api/v1/data", expect.any(Object));

      await httpService.request("/");
      expect(mockFetch).toHaveBeenLastCalledWith("http://localhost:8000/", expect.any(Object));
    });

    it("handles undefined and null options", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ test: "data" })
      });

      await httpService.request("/test", undefined);

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/test", {
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    it("handles various HTTP status codes", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const statusCodes = [400, 401, 403, 404, 500, 502, 503];

      for (const status of statusCodes) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status
        });

        await expect(httpService.request("/test")).rejects.toThrow(`HTTP error! status: ${status}`);
      }

      consoleSpy.mockRestore();
    });
  });
});