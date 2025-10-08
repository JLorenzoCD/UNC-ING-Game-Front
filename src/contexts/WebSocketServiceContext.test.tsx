import "@testing-library/jest-dom";
import { render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useContext } from "react";

import {
  useWebSocketService,
  WebSocketServiceContext,
  WebSocketServiceProvider,
} from "./WebSocketServiceContext";

const { mockUsePlayer } = vi.hoisted(() => {
  const mockUsePlayer = vi.fn();

  return { mockUsePlayer };
});

vi.mock("./PlayerContext", () => ({
  usePlayer: mockUsePlayer,
}));

describe("WebSocketServiceContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("WebSocketServiceProvider", () => {
    it("renders children correctly", () => {
      mockUsePlayer.mockReturnValue({ player: null, setPlayer: vi.fn() });

      render(
        <WebSocketServiceProvider>
          <div data-testid="mock-child">Test Child</div>
        </WebSocketServiceProvider>,
      );

      expect(screen.getByTestId("mock-child")).toBeInTheDocument();
    });

    it("provides default context values", () => {
      mockUsePlayer.mockReturnValue({ player: null, setPlayer: vi.fn() });

      const TestComponent = () => {
        const { wsService, isConnected } = useContext(WebSocketServiceContext);
        return (
          <div>
            <span data-testid="ws-service">
              {wsService ? "Has WS Service" : "No WS Service"}
            </span>
            <span data-testid="is-connected">
              {isConnected ? "Connected" : "Not Connected"}
            </span>
          </div>
        );
      };

      render(
        <WebSocketServiceProvider>
          <TestComponent />
        </WebSocketServiceProvider>,
      );

      expect(screen.getByTestId("ws-service")).toHaveTextContent(
        "No WS Service",
      );
      expect(screen.getByTestId("is-connected")).toHaveTextContent(
        "Not Connected",
      );
    });

    it("provides initialized context values when player id is valid", () => {
      mockUsePlayer.mockReturnValue({
        player: {
          id: crypto.randomUUID(),
          name: "Test Player",
          avatar: "avatar.png",
          birthday: new Date("2000-01-01"),
        },
        setPlayer: vi.fn(),
      });

      const TestComponent = () => {
        const { wsService, isConnected } = useContext(WebSocketServiceContext);
        return (
          <div>
            <span data-testid="ws-service">
              {wsService ? "Has WS Service" : "No WS Service"}
            </span>
            <span data-testid="is-connected">
              {isConnected ? "Connected" : "Not Connected"}
            </span>
          </div>
        );
      };

      render(
        <WebSocketServiceProvider>
          <TestComponent />
        </WebSocketServiceProvider>,
      );

      expect(screen.getByTestId("ws-service")).toHaveTextContent(
        "Has WS Service",
      );
      expect(screen.getByTestId("is-connected")).toHaveTextContent(
        "Not Connected",
      );
    });
  });

  describe("useWebSocketService", () => {
    it("can be used outside provider (uses default context)", () => {
      const { result } = renderHook(() => useWebSocketService());

      expect(result.current.wsService).toBeNull();
      expect(result.current.isConnected).toBe(false);

      // Esto no lanza error porque no estamos en un provider
      expect(() => {
        result.current.wsService?.connect();
      }).not.toThrow();
    });
  });
});
