import "@testing-library/jest-dom";
import type { ReactNode } from "react";
import { render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createHttpService } from "@/services/httpService";
import { HttpServiceProvider, useHttpService } from "./HttpServiceContext";

const MOCK_HTTP_SERVICE = {
  request: vi.fn(),
  createMatch: vi.fn(),
  createPlayer: vi.fn(),
  getMatches: vi.fn(),
  getMatch: vi.fn(),
  getMatchCards: vi.fn(),
  getMatchPlayers: vi.fn(),
  getMatchSecrets: vi.fn(),
  joinMatch: vi.fn(),
  startMatch: vi.fn(),
  putTakeCards: vi.fn(),
  putDiscardCards: vi.fn(),
  putPassTurn: vi.fn(),
};

vi.mock("@/services/httpService", () => ({
  createHttpService: vi.fn(),
}));

const renderWithProvider = (children: ReactNode) => {
  return render(<HttpServiceProvider>{children}</HttpServiceProvider>);
};

const TestServiceComponent = () => {
  const context = useHttpService();
  return (
    <div data-testid="mock-service">
      {context.httpService ? "Service Available" : "No Service"}
    </div>
  );
};

describe("HttpServiceContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("HttpServiceProvider", () => {
    it("renders children correctly", () => {
      renderWithProvider(<div data-testid="mock-child">Test Child</div>);

      expect(screen.getByTestId("mock-child")).toBeInTheDocument();
    });

    it("provides initial context value", () => {
      renderWithProvider(<TestServiceComponent />);

      expect(screen.getByTestId("mock-service")).toHaveTextContent(
        "No Service",
      );
    });

    it("provides context value after initialization", () => {
      vi.mocked(createHttpService).mockReturnValue(MOCK_HTTP_SERVICE);

      renderWithProvider(<TestServiceComponent />);

      expect(screen.getByTestId("mock-service")).toHaveTextContent(
        "Service Available",
      );
    });
  });

  describe("useHttpService", () => {
    it("can be used outside provider (uses default context)", () => {
      const { result } = renderHook(() => useHttpService());

      expect(result.current.httpService).toBeNull();
    });

    it("can be used inside provider", () => {
      vi.mocked(createHttpService).mockReturnValue(MOCK_HTTP_SERVICE);

      const { result } = renderHook(() => useHttpService(), {
        wrapper: ({ children }) => (
          <HttpServiceProvider>{children}</HttpServiceProvider>
        ),
      });

      expect(result.current.httpService).toBeDefined();
      expect(result.current.httpService).not.toBeNull();
    });
  });
});
