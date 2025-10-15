import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import type { Player } from "@/types/player";
import type { UUID } from "@/types/common";
import type { MatchWithPlayerCount } from "@/types/match";

const {
  MOCK_MATCH_ID,
  MOCK_NEW_PLAYER_ID,
  mockMatch,
  mockPlayers,
  mockGetMatch,
  mockGetMatchPlayers,
  mockHttpService,
  mockOn,
  mockOff,
  mockUseWebSocketService,
  mockNavigate,
  mockSocketsEvents,
  FRONTEND_PATHS,
} = vi.hoisted(() => {
  const MOCK_MATCH_ID = "match-id" as UUID;
  const MOCK_OWNER_ID = "owner-id" as UUID;
  const MOCK_NEW_PLAYER_ID = "new-player-id" as UUID;

  const mockMatch = {
    id: MOCK_MATCH_ID,
    name: "Test Lobby",
    status: "WAITING",
    min_players: 2,
    max_players: 4,
    owner_id: MOCK_OWNER_ID,
    current_player_count: 2,
    current_player_order: 0,
  } as MatchWithPlayerCount;

  const mockPlayers = [
    { id: MOCK_OWNER_ID, name: "Owner Player" },
    { id: "player-id" as UUID, name: "Current Player" },
  ] as Player[];

  // Mock de HTTP
  const mockGetMatch = vi.fn().mockResolvedValue(mockMatch);
  const mockGetMatchPlayers = vi.fn().mockResolvedValue(mockPlayers);
  const mockHttpService = {
    getMatch: mockGetMatch,
    getMatchPlayers: mockGetMatchPlayers,
    startMatch: vi.fn(), // No se usa aquí, pero se mantiene para coherencia
  };

  // Mock de WebSocket
  const mockOn = vi.fn();
  const mockOff = vi.fn();
  const mockUseWebSocketService = vi.fn(() => ({
    wsService: { on: mockOn, off: mockOff },
    isConnected: true,
  }));

  // Mock de react-router (navegación y parámetro)
  const mockNavigate = vi.fn();

  // Mock de constantes
  const mockSocketsEvents = {
    LOBBY_JOIN: "lobby_join",
    MATCH: "match",
  };
  const FRONTEND_PATHS = {
    MATCH_GAME: (id: string) => `/match/${id}/game`,
  };

  return {
    MOCK_MATCH_ID,
    MOCK_OWNER_ID,
    MOCK_NEW_PLAYER_ID,
    mockMatch,
    mockPlayers,
    mockGetMatch,
    mockGetMatchPlayers,
    mockHttpService,
    mockOn,
    mockOff,
    mockUseWebSocketService,
    mockNavigate,
    mockSocketsEvents,
    FRONTEND_PATHS,
  };
});

vi.mock("@/contexts/HttpServiceContext", () => ({
  useHttpService: vi.fn(() => ({
    httpService: mockHttpService,
  })),
}));

vi.mock("@/contexts/WebSocketServiceContext", () => ({
  useWebSocketService: mockUseWebSocketService,
}));

vi.mock("react-router", () => {
  return {
    useNavigate: vi.fn(() => mockNavigate),
  };
});

vi.mock("@/constants/backend", () => ({
  BACKEND_SOCKETS_EVENTS: mockSocketsEvents,
}));

vi.mock("@/constants/frontend", () => ({
  FRONTEND_PATHS,
}));

// Función auxiliar para obtener el handler por el nombre del evento
const getEventHandler = (eventName: string) => {
  const call = mockOn.mock.calls.find((call) => call[0] === eventName);
  if (!call) throw new Error(`Handler for event ${eventName} not found.`);
  return call[1]; // El handler es el segundo elemento del array [nombre, handler]
};

import { useLobbyData } from "./useLobbyData";

describe("useLobbyData", () => {
  const originalAlert = window.alert;

  beforeEach(() => {
    vi.clearAllMocks();

    window.alert = vi.fn();

    mockGetMatch.mockResolvedValue(mockMatch);
    mockGetMatchPlayers.mockResolvedValue(mockPlayers);

    mockUseWebSocketService.mockReturnValue({
      wsService: { on: mockOn, off: mockOff },
      isConnected: true,
    });
  });

  afterEach(() => {
    window.alert = originalAlert;
  });

  it("should fetch initial data and set state on successful mount", async () => {
    const { result } = renderHook(() => useLobbyData(MOCK_MATCH_ID));

    expect(result.current.loading).toBe(true);
    expect(result.current.match).toBe(null);

    await waitFor(() => {
      // Verifica las llamadas HTTP
      expect(mockGetMatch).toHaveBeenCalledWith(MOCK_MATCH_ID);
      expect(mockGetMatchPlayers).toHaveBeenCalledWith(MOCK_MATCH_ID);

      // Verifica el estado final
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(false);
      expect(result.current.match!.name).toBe(mockMatch.name);
      expect(result.current.players.length).toBe(mockPlayers.length);

      // Verifica que el conteo de jugadores se actualizó correctamente en el match
      expect(result.current.match!.current_player_count).toBe(
        mockPlayers.length,
      );
    });
  });

  it("should handle initial fetch error", async () => {
    const mockConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockGetMatch.mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useLobbyData(MOCK_MATCH_ID));

    await waitFor(() => {
      // Verifica el estado de error
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(true);
      expect(window.alert).toHaveBeenCalledWith(
        "Could not connect to the server.",
      );
    });

    mockConsoleError.mockRestore();
  });

  it("should register and cleanup WebSocket handlers", async () => {
    const { unmount } = renderHook(() => useLobbyData(MOCK_MATCH_ID));

    await waitFor(() => {
      // Verificación de registro
      expect(mockOn).toHaveBeenCalledWith(
        mockSocketsEvents.LOBBY_JOIN,
        expect.any(Function),
      );
      expect(mockOn).toHaveBeenCalledWith(
        mockSocketsEvents.MATCH,
        expect.any(Function),
      );
    });

    // Verificación de cleanup
    unmount();
    expect(mockOff).toHaveBeenCalledWith(
      mockSocketsEvents.LOBBY_JOIN,
      expect.any(Function),
    );
    expect(mockOff).toHaveBeenCalledWith(
      mockSocketsEvents.MATCH,
      expect.any(Function),
    );
  });

  // --- WebSocket Handlers Testing ---
  it('should handle "lobby_join" and update players', async () => {
    const { result } = renderHook(() => useLobbyData(MOCK_MATCH_ID));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Obtener el handler
    const joinHandler = getEventHandler(mockSocketsEvents.LOBBY_JOIN);

    // Simular un nuevo jugador uniéndose
    const newPlayer = {
      id: MOCK_NEW_PLAYER_ID,
      name: "New Player",
    } as Player;
    await act(() => joinHandler(newPlayer));

    // Verificar la actualización de jugadores (3 jugadores ahora)
    expect(result.current.players.length).toBe(3);
    expect(result.current.players).toContainEqual(newPlayer);
    expect(result.current.match!.current_player_count).toBe(3); // El reducer actualiza el conteo
  });

  it('should handle "matches" event with status "IN_PROGRESS" and navigate', async () => {
    const { result } = renderHook(() => useLobbyData(MOCK_MATCH_ID));
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Obtener el handler
    const startHandler = getEventHandler(mockSocketsEvents.MATCH);

    // Simular el evento de inicio de partida
    const matchInProgress = {
      id: MOCK_MATCH_ID,
      status: "IN_PROGRESS",
    } as MatchWithPlayerCount;
    await act(() => startHandler(matchInProgress));

    // Verificar la navegación
    expect(mockNavigate).toHaveBeenCalledWith(
      FRONTEND_PATHS.MATCH_GAME(MOCK_MATCH_ID),
    );
  });

  it('should handle "matches" event with status "WAITING" and refetch players on count increase', async () => {
    const updatedPlayers = [
      ...mockPlayers,
      { id: MOCK_NEW_PLAYER_ID, name: "Fetched Player" },
    ] as Player[];

    // El mock de getMatchPlayers será llamado una vez en init y una vez en el handler
    mockGetMatchPlayers.mockResolvedValueOnce(mockPlayers);
    mockGetMatchPlayers.mockResolvedValueOnce(updatedPlayers); // para el refetch

    const { result } = renderHook(() => useLobbyData(MOCK_MATCH_ID));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Obtener el handler
    const updateHandler = getEventHandler(mockSocketsEvents.MATCH);

    // Simular el evento 'matches' con un conteo mayor
    const matchUpdate = {
      ...mockMatch,
      status: "WAITING",
      current_player_count: 3, // Mayor que el inicial (2)
    } as MatchWithPlayerCount;

    await act(() => updateHandler(matchUpdate));

    // Verificar que se hizo el refetch de jugadores
    await waitFor(() => {
      expect(mockGetMatchPlayers).toHaveBeenCalledTimes(2);
      expect(result.current.players.length).toBe(3);
      expect(result.current.match!.current_player_count).toBe(3);
    });
  });

  it("should not refetch players if player count is the same or less", async () => {
    const { result } = renderHook(() => useLobbyData(MOCK_MATCH_ID));
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Conteo inicial: 2
    expect(mockGetMatchPlayers).toHaveBeenCalledTimes(1);

    const updateHandler = getEventHandler(mockSocketsEvents.MATCH);

    // Simular el evento con el mismo conteo
    const matchSameCount = {
      ...mockMatch,
      status: "WAITING",
      current_player_count: 2,
    } as MatchWithPlayerCount;
    await act(() => updateHandler(matchSameCount));

    // Simular el evento con menor conteo (lo cual no debería ocurrir)
    const matchLowerCount = {
      ...mockMatch,
      status: "WAITING",
      current_player_count: 1,
    } as MatchWithPlayerCount;
    await act(() => updateHandler(matchLowerCount));

    // Verificar que NO se hizo un segundo fetch
    expect(mockGetMatchPlayers).toHaveBeenCalledTimes(1);
  });
});
