import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PlayerInput, GamePlayer } from "@/types/player";
import type {
  Match,
  MatchCreateInput,
  MatchWithPlayerCount,
} from "@/types/match";
import type { GameCard } from "@/types/card";
import type { GameSecret } from "@/types/secret";

import { createHttpService, type HttpService } from "./httpService";

declare const global: any;

// Mockeamos fetch globalmente
global.fetch = vi.fn();

describe("httpService", () => {
  let httpService: HttpService;

  let mockFetch: any;

  // Helper function to mock successful fetch responses
  const mockSuccessResponse = (data: unknown) => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(data),
    });
  };

  // Helper function to mock fetch errors
  const mockErrorResponse = (status: number) => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status,
    });
  };

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
      mockSuccessResponse({ test: "data" });

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

      mockSuccessResponse({ test: "data" });

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
      mockSuccessResponse(mockData);

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
      mockSuccessResponse(mockData);

      const result = await httpService.request<typeof mockData>("/test", {
        method: "POST",
        body: JSON.stringify(requestBody),
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
      mockSuccessResponse(mockData);

      await httpService.request("/test", {
        headers: {
          Authorization: "Bearer token",
          "Custom-Header": "value",
        },
      });

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/test", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
          "Custom-Header": "value",
        },
      });
    });

    it("handles HTTP error responses", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockErrorResponse(404);

      await expect(httpService.request("/test")).rejects.toThrow(
        "HTTP error! status: 404",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "API request failed with error:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it("handles network errors", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const networkError = new Error("Network error");
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(httpService.request("/test")).rejects.toThrow(
        "Network error",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "API request failed with error:",
        networkError,
      );
      consoleSpy.mockRestore();
    });

    it("handles JSON parsing errors", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
      });

      await expect(httpService.request("/test")).rejects.toThrow(
        "Invalid JSON",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "API request failed with error:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it("constructs URLs correctly with different routes", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      await httpService.request("/users");
      expect(mockFetch).toHaveBeenLastCalledWith(
        "http://localhost:8000/users",
        expect.any(Object),
      );

      await httpService.request("/api/v1/data");
      expect(mockFetch).toHaveBeenLastCalledWith(
        "http://localhost:8000/api/v1/data",
        expect.any(Object),
      );

      await httpService.request("/");
      expect(mockFetch).toHaveBeenLastCalledWith(
        "http://localhost:8000/",
        expect.any(Object),
      );
    });

    it("handles undefined and null options", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ test: "data" }),
      });

      await httpService.request("/test", undefined);

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/test", {
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    it("handles various HTTP status codes", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const statusCodes = [400, 401, 403, 404, 500, 502, 503];

      for (const status of statusCodes) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status,
        });

        await expect(httpService.request("/test")).rejects.toThrow(
          `HTTP error! status: ${status}`,
        );
      }

      consoleSpy.mockRestore();
    });
  });

  describe("Higher-level methods", () => {
    it("createPlayer sends correct request and returns player", async () => {
      const newPlayer: PlayerInput = {
        name: "Test Player",
        avatar: "avatar.png",
        birthday: new Date("2000-01-01"),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: crypto.randomUUID(),
          name: newPlayer.name,
          avatar: newPlayer.avatar,
          birthday: newPlayer.birthday,
        }),
      });

      const result = await httpService.createPlayer({
        name: newPlayer.name,
        avatar: newPlayer.avatar,
        birthday: newPlayer.birthday,
      });

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/players", {
        method: "POST",
        body: JSON.stringify({
          name: newPlayer.name,
          avatar: newPlayer.avatar,
          birthday: newPlayer.birthday,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(result).toHaveProperty("id");
      expect(result.name).toBe(newPlayer.name);
      expect(result.avatar).toBe(newPlayer.avatar);
      expect(result.birthday).toEqual(newPlayer.birthday);
    });

    it("createMatch sends correct request and returns match", async () => {
      const matchInput: MatchCreateInput = {
        name: "New Match",
        max_players: 4,
        min_players: 2,
        owner_id: crypto.randomUUID(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: crypto.randomUUID(),
          name: matchInput.name,
          status: "WAITING",
          max_players: matchInput.max_players,
          min_players: matchInput.min_players,
          owner_id: matchInput.owner_id,
          current_player_order: 0,
        }),
      });

      const result = await httpService.createMatch(matchInput);

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/matches", {
        method: "POST",
        body: JSON.stringify(matchInput),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(result).toHaveProperty("id");
      expect(result.name).toBe(matchInput.name);
      expect(result.status).toBe("WAITING");
      expect(result.max_players).toBe(matchInput.max_players);
      expect(result.min_players).toBe(matchInput.min_players);
      expect(result.owner_id).toBe(matchInput.owner_id);
      expect(result.current_player_order).toBe(0);
    });

    it("getMatches fetches and returns matches", async () => {
      const mockMatches: Match[] = [
        {
          id: crypto.randomUUID(),
          name: "Match 1",
          status: "WAITING",
          max_players: 4,
          min_players: 2,
          owner_id: crypto.randomUUID(),
          current_player_order: 0,
        },
        {
          id: crypto.randomUUID(),
          name: "Match 2",
          status: "IN_PROGRESS",
          max_players: 6,
          min_players: 2,
          owner_id: crypto.randomUUID(),
          current_player_order: 1,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockMatches),
      });

      const result = await httpService.getMatches();

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:8000/matches", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(result).toEqual(mockMatches);
    });

    it("joinMatch sends correct request and returns match_id", async () => {
      const matchId = crypto.randomUUID();
      const playerId = crypto.randomUUID();
      const expectedResponse = { match_id: matchId };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(expectedResponse),
      });

      const result = await httpService.joinMatch(playerId, matchId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8000/matches/${matchId}/join?player_id=${playerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect(result).toEqual(expectedResponse);
      expect(result.match_id).toBe(matchId);
    });

    it("getMatch fetches and returns a single match with player count", async () => {
      const matchId = crypto.randomUUID();
      const mockMatch: MatchWithPlayerCount = {
        id: matchId,
        name: "Test Match",
        status: "WAITING",
        max_players: 4,
        min_players: 2,
        owner_id: crypto.randomUUID(),
        current_player_order: 0,
        current_player_count: 3,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockMatch),
      });

      const result = await httpService.getMatch(matchId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8000/matches/${matchId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect(result).toEqual(mockMatch);
    });

    it("startMatch sends correct request and returns status", async () => {
      const matchId = crypto.randomUUID();
      const expectedResponse = { status: "IN_PROGRESS" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(expectedResponse),
      });

      const result = await httpService.startMatch(matchId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8000/matches/${matchId}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect(result).toEqual(expectedResponse);
      expect(result.status).toBe("IN_PROGRESS");
    });

    it("getMatchPlayers fetches and returns match players", async () => {
      const matchId = crypto.randomUUID();
      const mockPlayers: GamePlayer[] = [
        {
          id: crypto.randomUUID(),
          match_id: matchId,
          player_id: crypto.randomUUID(),
          order: 0,
          name: "Player 1",
          role: "MURDERER",
          avatar: "avatar1.png",
          birthday: new Date("2000-01-01"),
        },
        {
          id: crypto.randomUUID(),
          match_id: matchId,
          player_id: crypto.randomUUID(),
          order: 1,
          name: "Player 2",
          role: "INNOCENT",
          avatar: "avatar2.png",
          birthday: new Date("1995-05-15"),
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockPlayers),
      });

      const result = await httpService.getMatchPlayers(matchId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8000/matches/${matchId}/players`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect(result).toEqual(mockPlayers);
      expect(result).toHaveLength(2);
    });

    it("getMatchCards fetches and returns match cards", async () => {
      const matchId = crypto.randomUUID();
      const playerId = crypto.randomUUID();
      const mockCards: GameCard[] = [
        {
          id: crypto.randomUUID(),
          card_id: crypto.randomUUID(),
          match_id: matchId,
          player_id: playerId,
          is_discarded: false,
          discarded_at: null,
          name: "HERCULE POIROT",
          type: "DETECTIVE",
          description: "A famous Belgian detective",
        },
        {
          id: crypto.randomUUID(),
          card_id: crypto.randomUUID(),
          match_id: matchId,
          player_id: null,
          is_discarded: true,
          discarded_at: null,
          name: "NOT SO FAST",
          type: "INSTANT",
          description: "Stop an action",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockCards),
      });

      const result = await httpService.getMatchCards(matchId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8000/matches/${matchId}/cards`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect(result).toEqual(mockCards);
      expect(result).toHaveLength(2);
    });

    it("getMatchSecrets fetches and returns match secrets", async () => {
      const matchId = crypto.randomUUID();
      const playerId = crypto.randomUUID();
      const mockSecrets: GameSecret[] = [
        {
          id: crypto.randomUUID(),
          secret_id: crypto.randomUUID(),
          match_id: matchId,
          player_id: playerId,
          is_revealed: false,
          type: "MURDERER",
          content: "You are the murderer",
        },
        {
          id: crypto.randomUUID(),
          secret_id: crypto.randomUUID(),
          match_id: matchId,
          player_id: crypto.randomUUID(),
          is_revealed: true,
          type: "INNOCENT",
          content: "You are innocent",
        },
        {
          id: crypto.randomUUID(),
          secret_id: crypto.randomUUID(),
          match_id: matchId,
          player_id: crypto.randomUUID(),
          is_revealed: false,
          type: "ACCOMPLICE",
          content: "You are an accomplice",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockSecrets),
      });

      const result = await httpService.getMatchSecrets(matchId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8000/matches/${matchId}/secrets`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect(result).toEqual(mockSecrets);
      expect(result).toHaveLength(3);
    });

    it("putMatchCards sends correct request to update cards", async () => {
      const matchId = crypto.randomUUID();
      const playerId = crypto.randomUUID();
      const takenCardIds = [crypto.randomUUID(), crypto.randomUUID()];
      const discardedCardIds = [crypto.randomUUID(), crypto.randomUUID()];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(undefined),
      });

      await httpService.putMatchCards(
        matchId,
        playerId,
        takenCardIds,
        discardedCardIds,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8000/matches/${matchId}/cards`,
        {
          method: "PUT",
          body: JSON.stringify({
            player_id: playerId,
            taken_card_ids: takenCardIds,
            discarded_card_ids: discardedCardIds,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    });

    it("putPassTurn sends correct request to pass turn", async () => {
      const matchId = crypto.randomUUID();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(undefined),
      });

      await httpService.putPassTurn(matchId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8000/matches/${matchId}/pass_turn`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    });
  });
});
