import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpServiceProvider, useHttpService } from "./HttpServiceContext";

import { createHttpService } from "@/services/httpService";

vi.mock("@/services/httpService", () => ({
  createHttpService: vi.fn(),
}));

describe("HttpServiceContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("HttpServiceProvider", () => {
    it("renders children correctly", () => {
      render(
        <HttpServiceProvider>
          <div data-testid="mock-child">Test Child</div>
        </HttpServiceProvider>,
      );

      expect(screen.getByTestId("mock-child")).toBeInTheDocument();
    });

    it("provides initial context value", () => {
      const TestComponent = () => {
        const context = useHttpService();
        return (
          <div data-testid="mock-service">
            {context.httpService ? "Service Available" : "No Service"}
          </div>
        );
      };

      render(
        <HttpServiceProvider>
          <TestComponent />
        </HttpServiceProvider>,
      );

      expect(screen.getByTestId("mock-service")).toHaveTextContent(
        "No Service",
      );
    });

    it("provide context value after initialization", () => {
      vi.mocked(createHttpService).mockReturnValue({
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
      });

      const TestComponent = () => {
        const context = useHttpService();

        return (
          <div data-testid="mock-service">
            {context.httpService ? "Service Available" : "No Service"}
          </div>
        );
      };

      render(
        <HttpServiceProvider>
          <TestComponent />
        </HttpServiceProvider>,
      );

      expect(screen.getByTestId("mock-service")).toHaveTextContent(
        "Service Available",
      );
    });
  });
});
