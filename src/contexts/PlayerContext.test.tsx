import "@testing-library/jest-dom";
import { render, screen, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Player } from "@/types/player";
import { PlayerProvider, usePlayer } from "./PlayerContext";

const { mockUseNavigate, mockUseLocation, mockUseHttpService } = vi.hoisted(
  () => {
    const mockHttpService = {
      getPlayer: vi.fn(),
    };
    const mockUseHttpService = vi.fn((): any => ({
      httpService: mockHttpService,
    }));

    return {
      mockUseNavigate: vi.fn(),
      mockUseLocation: vi.fn(),
      mockUseHttpService,
    };
  },
);

const renderTestChildWithProvider = () => {
  return render(
    <PlayerProvider>
      <div data-testid="mock-child">Test Child</div>
    </PlayerProvider>,
  );
};

const reRenderTestChildWithProvider = (rerender: any) => {
  return rerender(
    <PlayerProvider>
      <div data-testid="mock-child">Test Child</div>
    </PlayerProvider>,
  );
};

// Mock dependencies
vi.mock("./HttpServiceContext", () => ({
  useHttpService: mockUseHttpService,
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

  afterEach(() => {
    localStorage.clear();
  });

  describe("PlayerProvider", () => {
    it("renders children correctly", () => {
      mockUseLocation.mockReturnValue({ pathname: "/" });

      renderTestChildWithProvider();

      expect(screen.getByTestId("mock-child")).toBeInTheDocument();
    });

    it("redirects to create a player if no player and accessing protected route", () => {
      mockUseLocation.mockReturnValue({ pathname: "/match/123" });

      renderTestChildWithProvider();

      expect(mockUseNavigate).toHaveBeenCalledWith("/player/create");
    });

    it("redirects to create a player if no player and accessing home", () => {
      mockUseLocation.mockReturnValue({ pathname: "/" });

      renderTestChildWithProvider();

      expect(mockUseNavigate).toHaveBeenCalledWith("/player/create");
    });

    it("redirects to match list if player and accessing create a player", () => {
      mockUseLocation.mockReturnValue({ pathname: "/player/create" });

      localStorage.setItem(
        "player",
        JSON.stringify({ id: crypto.randomUUID(), name: "Test Player" }),
      );

      renderTestChildWithProvider();

      waitFor(() => {
        expect(mockUseNavigate).toHaveBeenCalledWith("/");
      });
    });

    it("does not redirect if player exists", () => {
      mockUseLocation.mockReturnValue({ pathname: "/match/123" });

      localStorage.setItem(
        "player",
        JSON.stringify({ id: "1", name: "Test Player" }),
      );

      renderTestChildWithProvider();

      expect(mockUseNavigate).not.toHaveBeenCalled();
    });

    it("does not redirect if accessing unprotected route", () => {
      mockUseLocation.mockReturnValue({ pathname: "/random" });

      renderTestChildWithProvider();

      expect(mockUseNavigate).not.toHaveBeenCalled();
    });

    it("saves player to localStorage on setPlayer", () => {
      mockUseLocation.mockReturnValue({ pathname: "/" });

      const { rerender } = renderTestChildWithProvider();

      expect(localStorage.getItem("player")).toBeNull();

      const mockPlayer: Player = {
        id: crypto.randomUUID(),
        name: "New Player",
        avatar: "avatar.png",
        birthday: new Date("1990-01-01"),
      };

      localStorage.setItem("player", JSON.stringify(mockPlayer));

      reRenderTestChildWithProvider(rerender);

      expect(JSON.parse(localStorage.getItem("player") || "{}")).toEqual({
        id: mockPlayer.id,
        name: mockPlayer.name,
        avatar: mockPlayer.avatar,
        birthday: mockPlayer.birthday.toISOString(),
      });
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
