import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toast } from "sonner";
import { handleApiError, logError, getErrorMessage } from "./errorHandler";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("errorHandler", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("handleApiError", () => {
    it("should log error and show toast", () => {
      const error = new Error("Test error");
      const message = "Failed to perform action";

      handleApiError(error, message);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[API Error]",
        message,
        expect.objectContaining({
          error,
          timestamp: expect.any(String),
        })
      );
      expect(toast.error).toHaveBeenCalledWith(message);
    });

    it("should include context in log when provided", () => {
      const error = new Error("Test error");
      const message = "Failed to perform action";
      const context = { userId: "123", action: "delete" };

      handleApiError(error, message, context);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[API Error]",
        message,
        expect.objectContaining({
          error,
          context,
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe("logError", () => {
    it("should log error without showing toast", () => {
      const error = new Error("Test error");
      const context = "Component mount";

      logError(error, context);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Error] Component mount",
        expect.objectContaining({
          error,
          timestamp: expect.any(String),
        })
      );
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("should include additional info when provided", () => {
      const error = new Error("Test error");
      const context = "Data fetch";
      const additionalInfo = { endpoint: "/api/users" };

      logError(error, context, additionalInfo);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Error] Data fetch",
        expect.objectContaining({
          error,
          additionalInfo,
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe("getErrorMessage", () => {
    it("should extract message from Error instance", () => {
      const error = new Error("Error message");
      expect(getErrorMessage(error)).toBe("Error message");
    });

    it("should return string error as-is", () => {
      const error = "String error";
      expect(getErrorMessage(error)).toBe("String error");
    });

    it("should extract message from error-like object", () => {
      const error = { message: "Object error" };
      expect(getErrorMessage(error)).toBe("Object error");
    });

    it("should return default message for unknown error types", () => {
      expect(getErrorMessage(null)).toBe("Unknown error occurred");
      expect(getErrorMessage(undefined)).toBe("Unknown error occurred");
      expect(getErrorMessage(123)).toBe("Unknown error occurred");
      expect(getErrorMessage({})).toBe("Unknown error occurred");
    });
  });
});
