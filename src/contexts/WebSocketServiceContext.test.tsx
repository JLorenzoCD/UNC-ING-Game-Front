import "@testing-library/jest-dom";
import type { ReactNode } from "react";
import { render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useWebSocketService,
  WebSocketServiceProvider,
} from "./WebSocketServiceContext";
import { createWsService } from "@/services/wsService";

const { mockUsePlayer } = vi.hoisted(() => {
  const mockUsePlayer = vi.fn();

  return { mockUsePlayer };
});

vi.mock("./PlayerContext", () => ({
  usePlayer: mockUsePlayer,
}));

vi.mock("@/services/wsService", () => ({
  createWsService: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

const renderWithProvider = (children: ReactNode) => {
  return render(
    <WebSocketServiceProvider>{children}</WebSocketServiceProvider>,
  );
};

const TestServiceComponent = () => {
  const context = useWebSocketService();
  return (
    <div>
      <span data-testid="mock-service">
        {context.wsService ? "Has WS Service" : "No WS Service"}
      </span>

      <span data-testid="mock-connection-status">
        {context.isConnected ? "Connected" : "Not Connected"}
      </span>
    </div>
  );
};

describe("WebSocketServiceContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUsePlayer.mockReturnValue({ player: null, setPlayer: vi.fn() });
  });

  describe("WebSocketServiceProvider", () => {
    it("renders children correctly", () => {
      renderWithProvider(<div data-testid="mock-child">Test Child</div>);

      expect(screen.getByTestId("mock-child")).toBeInTheDocument();
    });

    it("provides default context values", () => {
      renderWithProvider(<TestServiceComponent />);

      expect(screen.getByTestId("mock-service")).toHaveTextContent(
        "No WS Service",
      );
      expect(screen.getByTestId("mock-connection-status")).toHaveTextContent(
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

      renderWithProvider(<TestServiceComponent />);

      expect(screen.getByTestId("mock-service")).toHaveTextContent(
        "Has WS Service",
      );
      expect(screen.getByTestId("mock-connection-status")).toHaveTextContent(
        "Not Connected",
      );
    });

    it("cleans up WebSocket on unmount", () => {
      mockUsePlayer.mockReturnValue({
        player: {
          id: crypto.randomUUID(),
          name: "Test Player",
          avatar: "avatar.png",
          birthday: new Date("2000-01-01"),
        },
        setPlayer: vi.fn(),
      });

      const mockWsService = {
        on: vi.fn(),
        off: vi.fn(() => {}),
        send: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(() => {}),
        isConnected: vi.fn(),
      };

      vi.mocked(createWsService).mockReturnValue(mockWsService);

      const { unmount } = renderWithProvider(<div>Test</div>);

      unmount();

      expect(mockWsService.disconnect).toHaveBeenCalled();
      expect(mockWsService.off).toHaveBeenCalled();
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
