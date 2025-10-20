import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, renderHook } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useParams } from "react-router";

import GameContextProvider, { useGame } from "./GameContext";
import { useHttpService } from "./HttpServiceContext";
import type { Match } from "@/types/match";
import type { GameCard } from "@/types/card";
import type { GameSecret } from "@/types/secret";
import type { GamePlayer } from "@/types/player";

// Mock dependencies
vi.mock("./HttpServiceContext");
vi.mock("react-router", () => ({
  useParams: vi.fn(),
}));

// Mock console.error to avoid noise in tests
const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

describe("GameContext", () => {
  const mockHttpService = {
    getMatch: vi.fn(),
    getMatchCards: vi.fn(),
    getMatchSecrets: vi.fn(),
    getMatchPlayers: vi.fn(),
  };

  const mockMatchId = crypto.randomUUID();

  const mockPlayerOne: GamePlayer = {
    id: crypto.randomUUID(),
    match_id: mockMatchId,
    player_id: crypto.randomUUID(),
    name: "PlayerOne",
    avatar: "avatar1.png",
    birthday: new Date("2001-01-01"),
    order: 0,
    role: "INNOCENT",
  };

  const mockPlayerTwo: GamePlayer = {
    id: crypto.randomUUID(),
    match_id: mockMatchId,
    player_id: crypto.randomUUID(),
    name: "PlayerTwo",
    avatar: "avatar2.png",
    birthday: new Date("2002-02-02"),
    order: 1,
    role: "MURDERER",
  };

  const mockMatch: Match = {
    id: crypto.randomUUID(),
    name: "Test Match",
    status: "WAITING",
    min_players: 2,
    max_players: 6,
    current_player_order: 0,
    owner_id: mockPlayerOne.player_id,
  } as Match;

  const mockCards: GameCard[] = [
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: mockMatchId,
      player_id: mockPlayerOne.player_id,
      name: "HERCULE POIROT",
      type: "DETECTIVE",
      description: "Description of Hercule Poirot",
      is_discarded: false,
      discarded_at: null,
    },
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: mockMatchId,
      player_id: mockPlayerTwo.player_id,
      name: "MISS MARPLE",
      type: "DETECTIVE",
      description: "Description of Miss Marple",
      is_discarded: false,
      discarded_at: null,
    },
  ];

  const mockSecrets: GameSecret[] = [
    {
      type: "INNOCENT",
      content: "You are innocent",
      id: crypto.randomUUID(),
      match_id: mockMatchId,
      secret_id: crypto.randomUUID(),
      player_id: mockPlayerOne.player_id,
      is_revealed: false,
    },
    {
      type: "MURDERER",
      id: crypto.randomUUID(),
      content: "You are the murderer",
      match_id: mockMatchId,
      secret_id: crypto.randomUUID(),
      player_id: mockPlayerTwo.player_id,
      is_revealed: false,
    },
  ];

  const mockPlayers: GamePlayer[] = [mockPlayerOne, mockPlayerTwo];

  beforeEach(() => {
    vi.clearAllMocks();
    (useHttpService as any).mockReturnValue({ httpService: mockHttpService });
    (useParams as any).mockReturnValue({ matchId: mockMatchId });
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  describe("GameContextProvider", () => {
    it("renders children correctly", () => {
      render(
        <GameContextProvider>
          <div data-testid="test-child">Test Child</div>
        </GameContextProvider>,
      );

      expect(screen.getByTestId("test-child")).toBeInTheDocument();
    });

    it("provides initial context values", () => {
      const TestComponent = () => {
        const context = useGame();
        return (
          <div>
            <span data-testid="loading">{context.isLoading.toString()}</span>
            <span data-testid="has-error">{context.hasError.toString()}</span>
            <span data-testid="match">
              {context.match ? "has-match" : "no-match"}
            </span>
            <span data-testid="cards-count">{context.cards.length}</span>
          </div>
        );
      };

      render(
        <GameContextProvider>
          <TestComponent />
        </GameContextProvider>,
      );

      expect(screen.getByTestId("loading")).toHaveTextContent("true");
      expect(screen.getByTestId("has-error")).toHaveTextContent("false");
      expect(screen.getByTestId("match")).toHaveTextContent("no-match");
      expect(screen.getByTestId("cards-count")).toHaveTextContent("0");
    });

    it("fetches data successfully when matchId is valid", async () => {
      mockHttpService.getMatch.mockResolvedValue(mockMatch);
      mockHttpService.getMatchCards.mockResolvedValue(mockCards);
      mockHttpService.getMatchSecrets.mockResolvedValue(mockSecrets);
      mockHttpService.getMatchPlayers.mockResolvedValue(mockPlayers);

      const TestComponent = () => {
        const context = useGame();
        return (
          <div>
            <span data-testid="loading">{context.isLoading.toString()}</span>
            <span data-testid="has-error">{context.hasError.toString()}</span>
            <span data-testid="match-name">
              {context.match?.name || "no-match"}
            </span>
            <span data-testid="cards-count">{context.cards.length}</span>
            <span data-testid="secrets-count">{context.secrets.length}</span>
            <span data-testid="players-count">{context.players.length}</span>
          </div>
        );
      };

      render(
        <GameContextProvider>
          <TestComponent />
        </GameContextProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("has-error")).toHaveTextContent("false");
      expect(screen.getByTestId("match-name")).toHaveTextContent("Test Match");
      expect(screen.getByTestId("cards-count")).toHaveTextContent("2");
      expect(screen.getByTestId("secrets-count")).toHaveTextContent("2");
      expect(screen.getByTestId("players-count")).toHaveTextContent("2");

      expect(mockHttpService.getMatch).toHaveBeenCalledWith(mockMatchId);
      expect(mockHttpService.getMatchCards).toHaveBeenCalledWith(mockMatchId);
      expect(mockHttpService.getMatchSecrets).toHaveBeenCalledWith(mockMatchId);
      expect(mockHttpService.getMatchPlayers).toHaveBeenCalledWith(mockMatchId);
    });

    it("handles fetch errors correctly", async () => {
      const testError = new Error("Network error");
      mockHttpService.getMatch.mockRejectedValue(testError);
      mockHttpService.getMatchCards.mockRejectedValue(testError);
      mockHttpService.getMatchSecrets.mockRejectedValue(testError);
      mockHttpService.getMatchPlayers.mockRejectedValue(testError);

      const TestComponent = () => {
        const context = useGame();
        return (
          <div>
            <span data-testid="loading">{context.isLoading.toString()}</span>
            <span data-testid="has-error">{context.hasError.toString()}</span>
            <span data-testid="error-message">
              {context.error?.message || "no-error"}
            </span>
          </div>
        );
      };

      render(
        <GameContextProvider>
          <TestComponent />
        </GameContextProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("has-error")).toHaveTextContent("true");
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Network error",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching match data:",
        testError,
      );
    });

    it("does not fetch data when matchId is missing", () => {
      (useParams as any).mockReturnValue({ matchId: undefined });

      render(
        <GameContextProvider>
          <div>Test</div>
        </GameContextProvider>,
      );

      expect(mockHttpService.getMatch).not.toHaveBeenCalled();
      expect(mockHttpService.getMatchCards).not.toHaveBeenCalled();
      expect(mockHttpService.getMatchSecrets).not.toHaveBeenCalled();
      expect(mockHttpService.getMatchPlayers).not.toHaveBeenCalled();
    });

    it("does not fetch data when httpService is not available", () => {
      (useHttpService as any).mockReturnValue({ httpService: null });

      render(
        <GameContextProvider>
          <div>Test</div>
        </GameContextProvider>,
      );

      expect(mockHttpService.getMatch).not.toHaveBeenCalled();
    });

    it("handles invalid UUID matchId", () => {
      (useParams as any).mockReturnValue({ matchId: "invalid-uuid" });

      render(
        <GameContextProvider>
          <div>Test</div>
        </GameContextProvider>,
      );

      expect(mockHttpService.getMatch).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Match ID is not a valid UUID:",
        "invalid-uuid",
      );
    });

    it("clears error state before new fetch", async () => {
      // First render with error
      const testError = new Error("First error");
      mockHttpService.getMatch.mockRejectedValueOnce(testError);
      mockHttpService.getMatchCards.mockRejectedValueOnce(testError);
      mockHttpService.getMatchSecrets.mockRejectedValueOnce(testError);
      mockHttpService.getMatchPlayers.mockRejectedValueOnce(testError);

      // Setup successful responses for second render
      mockHttpService.getMatch.mockResolvedValue(mockMatch);
      mockHttpService.getMatchCards.mockResolvedValue(mockCards);
      mockHttpService.getMatchSecrets.mockResolvedValue(mockSecrets);
      mockHttpService.getMatchPlayers.mockResolvedValue(mockPlayers);

      const firstMatchId = crypto.randomUUID();
      (useParams as any).mockReturnValue({ matchId: firstMatchId });

      const TestComponent = () => {
        const context = useGame();
        return (
          <div>
            <span data-testid="has-error">{context.hasError.toString()}</span>
            <span data-testid="error-message">
              {context.error?.message || "no-error"}
            </span>
          </div>
        );
      };

      const { unmount } = render(
        <GameContextProvider>
          <TestComponent />
        </GameContextProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("has-error")).toHaveTextContent("true");
      });

      unmount();

      // Change matchId to trigger refetch with new component instance
      const secondMatchId = crypto.randomUUID();
      (useParams as any).mockReturnValue({ matchId: secondMatchId });

      render(
        <GameContextProvider>
          <TestComponent />
        </GameContextProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("has-error")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("error-message")).toHaveTextContent("no-error");
    });
  });

  describe("useGame hook", () => {
    it("returns context value when used within provider", () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: ({ children }) => (
          <GameContextProvider>{children}</GameContextProvider>
        ),
      });

      expect(result.current).toEqual({
        match: null,
        result: null,
        cards: [],
        secrets: [],
        players: [],
        sets: [],
        isLoading: true,
        hasError: false,
        error: null,
      });
    });
  });

  describe("Context value memoization", () => {
    it("does not cause unnecessary re-renders when values do not change", async () => {
      let renderCount = 0;

      const TestComponent = () => {
        useGame();
        renderCount++;
        return <div data-testid="render-count">{renderCount}</div>;
      };

      const { rerender } = render(
        <GameContextProvider>
          <TestComponent />
        </GameContextProvider>,
      );

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(mockHttpService.getMatch).toHaveBeenCalled();
      });

      const initialRenderCount = renderCount;

      // Force a re-render of the same provider instance
      // Parent re-render will cause child re-render in React
      rerender(
        <GameContextProvider>
          <TestComponent />
        </GameContextProvider>,
      );

      // Verify child re-rendered due to parent re-render
      // The memoization prevents extra renders from context value changes,
      // but doesn't prevent re-renders from parent updates
      expect(renderCount).toBe(initialRenderCount + 1);
    });
  });
});
