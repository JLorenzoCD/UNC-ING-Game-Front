import "@testing-library/jest-dom";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

import { BACKEND_SOCKETS_EVENTS } from "@/constants/backend";

import { type MatchWithPlayerCount } from "@/types/match";
import type { UUID } from "@/types/common";
import type { Player } from "@/types/player";

import { useMatchesData } from "./useMatchesData";

const { mockUseHttpService, mockUseWebSocketService, mockUsePlayer } =
  vi.hoisted(() => {
    const mockUseHttpService = { useHttpService: vi.fn() };
    const mockUseWebSocketService = { useWebSocketService: vi.fn() };
    const mockUsePlayer = { usePlayer: vi.fn() };

    return {
      mockUseHttpService,
      mockUseWebSocketService,
      mockUsePlayer,
    };
  });

vi.mock("@/contexts/PlayerContext", () => mockUsePlayer);

vi.mock("@/contexts/HttpServiceContext", () => mockUseHttpService);

vi.mock("@/contexts/WebSocketServiceContext", () => mockUseWebSocketService);

const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});

const mockMatches = [
  {
    id: "1" as UUID,
    name: "Match 1",
    status: "WAITING",
    current_player_count: 2,
  },
  {
    id: "2" as UUID,
    name: "Match 2",
    status: "IN_PROGRESS",
    current_player_count: 4,
  }, // Will be filtered
  {
    id: "3" as UUID,
    name: "Match 3",
    status: "WAITING",
    current_player_count: 1,
  },
] as MatchWithPlayerCount[];

const mockPlayer: Player = {
  id: "123-uuid" as UUID,
  name: "Hercule Poirot",
  avatar: "poirot.png",
  birthday: new Date("2000-01-01"),
};

const mockHttpService = {
  getMatches: vi.fn(),
  joinMatch: vi.fn(),
  getOngoingMatchesFromPlayer: vi.fn(),
};

const mockWsService = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
};

const setUpMocks = (
  httpService: typeof mockHttpService | null = mockHttpService,
  wsService: typeof mockWsService | null = mockWsService,
  isConnected: boolean = true,
  player: typeof mockPlayer | null = mockPlayer,
) => {
  mockUseHttpService.useHttpService.mockReturnValue({ httpService });
  mockUseWebSocketService.useWebSocketService.mockReturnValue({
    wsService,
    isConnected,
  });
  mockUsePlayer.usePlayer.mockReturnValue({ player });
};

describe("useMatchesData", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockHttpService.getMatches.mockResolvedValue(mockMatches);

    setUpMocks();
  });

  afterAll(() => {
    mockAlert.mockRestore();
  });

  it("should return the initial state and start loading", async () => {
    const { result } = renderHook(() => useMatchesData());

    expect(result.current.loading).toBe(true);
    expect(result.current.matches).toEqual([]);
    expect(result.current.error).toBe(false);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.matches).toEqual([mockMatches[0], mockMatches[2]]);
  });

  it('should load, filter only "WAITING" matches, and subscribe to WebSocket events', async () => {
    const { result } = renderHook(() => useMatchesData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockHttpService.getMatches).toHaveBeenCalledTimes(1);

    // Verificar filtrado (solo Match 1 y Match 3 están WAITING)
    expect(result.current.matches).toEqual([mockMatches[0], mockMatches[2]]);

    // Verificar la suscripción del WebSocket
    expect(mockWsService.on).toHaveBeenCalledWith(
      BACKEND_SOCKETS_EVENTS.MATCH,
      expect.any(Function),
    );
  });

  it("should handle API loading errors", async () => {
    const mockConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockHttpService.getMatches.mockRejectedValue(new Error("API Down"));

    const { result } = renderHook(() => useMatchesData());

    // Esperar a que el hook termine de cargar/manejar el error
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
    expect(result.current.matches).toEqual([]);
    expect(window.alert).toHaveBeenCalledWith(
      "Could not connect to the server.",
    );

    mockConsoleError.mockRestore();
  });

  it("should not start loading if services or connection are unavailable", () => {
    // Caso 1: httpService es null
    setUpMocks(null, mockWsService, true);
    renderHook(() => useMatchesData());
    expect(mockHttpService.getMatches).not.toHaveBeenCalled();

    // Caso 2: isConnected es false
    setUpMocks(mockHttpService, mockWsService, false);
    renderHook(() => useMatchesData());
    expect(mockHttpService.getMatches).not.toHaveBeenCalled();

    // Caso 3: wsService es null
    setUpMocks(mockHttpService, null, true);
    renderHook(() => useMatchesData());
    expect(mockHttpService.getMatches).not.toHaveBeenCalled();
  });

  it("should unsubscribe from WebSocket on unmount (cleanup)", async () => {
    const { unmount } = renderHook(() => useMatchesData());

    // Se realizó la suscripción inicial en los WebSocket
    await waitFor(() => expect(mockWsService.on).toHaveBeenCalledTimes(2));

    unmount();

    // Verifique que wsService.off se haya llamado con el mismo controlador
    expect(mockWsService.off).toHaveBeenCalledWith(
      BACKEND_SOCKETS_EVENTS.MATCH,
      mockWsService.on.mock.calls[0][1],
    );
  });
});
