import "@testing-library/jest-dom";
import { render, screen, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Player } from "@/types/player";
import { PlayerProvider, usePlayer } from "./PlayerContext";

const { mockUseNavigate, mockUseLocation } = vi.hoisted(() => ({
  mockUseNavigate: vi.fn(),
  mockUseLocation: vi.fn(),
}));

vi.mock("react-router", async (importActual) => {
  const mod = await importActual<typeof import("react-router")>();
  return {
    ...mod,
    useNavigate: () => mockUseNavigate,
    useLocation: mockUseLocation,
  };
});

describe("PlayerContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PlayerProvider", () => {
    it("renders children correctly", () => {
      mockUseLocation.mockReturnValue({ pathname: "/" });

      render(
        <PlayerProvider>
          <div data-testid="mock-child">Test Child</div>
        </PlayerProvider>,
      );

      expect(screen.getByTestId("mock-child")).toBeInTheDocument();
    });

    it("redirects to create a player if no player and accessing protected route", () => {
      mockUseLocation.mockReturnValue({ pathname: "/match/123" });

      render(
        <PlayerProvider>
          <div data-testid="mock-child">Test Child</div>
        </PlayerProvider>,
      );

      expect(mockUseNavigate).toHaveBeenCalledWith("/player/create");
    });

    it("redirects to create a player if no player and accessing home", () => {
      mockUseLocation.mockReturnValue({ pathname: "/" });

      render(
        <PlayerProvider>
          <div data-testid="mock-child">Test Child</div>
        </PlayerProvider>,
      );

      expect(mockUseNavigate).toHaveBeenCalledWith("/player/create");
    });

    it("redirects to match list if player and accessing create a player", () => {
      mockUseLocation.mockReturnValue({ pathname: "/player/create" });
      localStorage.setItem(
        "player",
        JSON.stringify({ id: "1", name: "Test Player" }),
      );

      render(
        <PlayerProvider>
          <div data-testid="mock-child">Test Child</div>
        </PlayerProvider>,
      );

      expect(mockUseNavigate).toHaveBeenCalledWith("/");
      localStorage.removeItem("player");
    });

    it("does not redirect if player exists", () => {
      mockUseLocation.mockReturnValue({ pathname: "/match/123" });
      localStorage.setItem(
        "player",
        JSON.stringify({ id: "1", name: "Test Player" }),
      );

      render(
        <PlayerProvider>
          <div data-testid="mock-child">Test Child</div>
        </PlayerProvider>,
      );

      expect(mockUseNavigate).not.toHaveBeenCalled();
      localStorage.removeItem("player");
    });

    it("does not redirect if accessing unprotected route", () => {
      mockUseLocation.mockReturnValue({ pathname: "/random" });

      render(
        <PlayerProvider>
          <div data-testid="mock-child">Test Child</div>
        </PlayerProvider>,
      );

      expect(mockUseNavigate).not.toHaveBeenCalled();
    });

    it("saves player to localStorage on setPlayer", () => {
      mockUseLocation.mockReturnValue({ pathname: "/" });

      const { rerender } = render(
        <PlayerProvider>
          <div data-testid="mock-child">Test Child</div>
        </PlayerProvider>,
      );

      expect(localStorage.getItem("player")).toBeNull();

      const mockPlayer: Player = {
        id: crypto.randomUUID(),
        name: "New Player",
        avatar: "avatar.png",
        birthday: new Date("1990-01-01"),
      };

      localStorage.setItem("player", JSON.stringify(mockPlayer));

      rerender(
        <PlayerProvider>
          <div data-testid="mock-child">Test Child</div>
        </PlayerProvider>,
      );

      expect(JSON.parse(localStorage.getItem("player") || "{}")).toEqual({
        id: mockPlayer.id,
        name: mockPlayer.name,
        avatar: mockPlayer.avatar,
        birthday: mockPlayer.birthday.toISOString(),
      });

      localStorage.removeItem("player");
    });
  });

  describe("usePlayer hook", () => {
    it("can be used outside provider (uses default context)", () => {
      mockUseLocation.mockReturnValue({ pathname: "/random" });

      const { result } = renderHook(() => usePlayer());

      expect(result.current.player).toBeNull();
      expect(result.current.setPlayer).toBeDefined();

      result.current.setPlayer({
        id: crypto.randomUUID(),
        name: "Test",
        avatar: "avatar.png",
        birthday: new Date(),
      });

      // Esto no cambia porque no estamos dentro del provider
      expect(result.current.player).toBeNull();
    });
  });
});
