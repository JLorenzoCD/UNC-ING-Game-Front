import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from "vitest";
import userEvent from "@testing-library/user-event";

import type { Player } from "@/types/player";
import type { UUID } from "@/types/common";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let LobbyContainer: any;

// Mock de IDs y Data
const MOCK_MATCH_ID = "match-id" as UUID;
const MOCK_OWNER_ID = "owner-id" as UUID;
const MOCK_PLAYER_ID = "simple-player-id" as UUID;
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
};

const mockPlayers = [
  { id: MOCK_OWNER_ID, name: "Owner Player" },
  { id: MOCK_PLAYER_ID, name: "Current Player" },
] as Player[];

const mockNewPlayer = {
  id: MOCK_NEW_PLAYER_ID,
  name: "New Joined Player",
} as Player;

// Mock de servicios HTTP
const mockGetMatch = vi.fn().mockResolvedValue(mockMatch);
const mockGetMatchPlayers = vi.fn().mockResolvedValue(mockPlayers);
const mockStartMatch = vi.fn().mockResolvedValue({ status: true });
vi.doMock("@/contexts/HttpServiceContext", () => ({
  useHttpService: vi.fn(() => ({
    httpService: {
      getMatch: mockGetMatch,
      getMatchPlayers: mockGetMatchPlayers,
      startMatch: mockStartMatch,
    },
  })),
}));

// Mock de WebSocket
const mockOn = vi.fn();
const mockOff = vi.fn();
vi.doMock("@/contexts/WebSocketServiceContext", () => ({
  useWebSocketService: vi.fn(() => ({
    wsService: {
      on: mockOn,
      off: mockOff,
    },
    isConnected: true,
  })),
}));

// Mock de react-router
const mockNavigate = vi.fn();
vi.doMock("react-router", async (importOriginal) => {
  const mod = await importOriginal<typeof import("react-router")>();
  return {
    ...mod,
    useNavigate: vi.fn(() => mockNavigate),
    useParams: vi.fn(() => ({ matchId: MOCK_MATCH_ID })),
  };
});

// Mock del contexto del jugador (por defecto, no es el dueño)
const mockUsePlayer = vi.fn(() => ({
  player: {
    id: MOCK_PLAYER_ID,
    name: "Current Player",
  },
}));
vi.doMock("@/contexts/PlayerContext", () => ({
  usePlayer: mockUsePlayer,
}));

// Mock de utilidades
vi.mock("@/utils", () => ({
  isUUID: vi.fn().mockReturnValue(true),
}));

// Mock de constantes
const mockSocketsEvents = {
  LOBBY_JOIN: "lobby_join",
  MATCHES: "match",
};
vi.doMock("@/constants/backend", () => ({
  BACKEND_SOCKETS_EVENTS: mockSocketsEvents,
}));

const FRONTEND_PATHS = {
  MATCH_GAME: (id: string) => `/match/${id}/game`,
};
vi.doMock("@/constants/frontendPaths", () => ({
  FRONTEND_PATHS,
}));

// --------- Mock de componentes hijos
// Se mackea LobbyLayout para exponer el botón de inicio de partida
vi.mock("./components/LobbyLayout", () => ({
  default: vi.fn(({ children, isOwner, match, startGame }) => (
    <div
      data-testid="mock-lobby-layout"
      data-isowner={isOwner}
      data-match-name={match.name}
    >
      {isOwner && (
        <button data-testid="start-game-button" onClick={startGame}>
          Start Game
        </button>
      )}
      <div data-testid="player-list">{children}</div>
    </div>
  )),
}));

vi.mock("./components/PlayerCard", () => ({
  default: vi.fn(({ player, isOwner, isMe }) => (
    <div
      data-testid={`player-card-${player.id}`}
      data-isowner={isOwner}
      data-isme={isMe}
    >
      {player.name}
    </div>
  )),
  EmptyPlayerPosition: vi.fn(() => (
    <div data-testid="empty-position">Empty Slot</div>
  )),
}));

// Función auxiliar para obtener el handler por el nombre del evento
const getEventHandler = (eventName: string) => {
  const call = mockOn.mock.calls.find((call) => call[0] === eventName);
  if (!call) throw new Error(`Handler for event ${eventName} not found.`);

  return call[1]; // El handler es el segundo elemento del array [nombre, handler]
};

describe("LobbyContainer", () => {
  const originalAlert = window.alert;

  beforeAll(async () => {
    const module = await import("./LobbyContainer");
    LobbyContainer = module.default;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMatch.mockResolvedValue(mockMatch);
    mockGetMatchPlayers.mockResolvedValue(mockPlayers);
    mockStartMatch.mockResolvedValue({ status: true });
    window.alert = vi.fn(); // Mock alert for error handling
  });

  afterEach(() => {
    window.alert = originalAlert;
  });

  it("should call getMatch and getMatchPlayers on mount", async () => {
    render(<LobbyContainer />);

    await waitFor(() => {
      expect(mockGetMatch).toHaveBeenCalledWith(MOCK_MATCH_ID);
      expect(mockGetMatchPlayers).toHaveBeenCalledWith(MOCK_MATCH_ID);
      expect(mockGetMatch).toHaveBeenCalledTimes(1);
      expect(mockGetMatchPlayers).toHaveBeenCalledTimes(1);
    });
  });

  it("should render loading state initially", () => {
    // no se pone await ni wait para ver el loading
    mockGetMatch.mockReturnValue(new Promise(() => {}));
    render(<LobbyContainer />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render the lobby correctly with players and empty slots", async () => {
    render(<LobbyContainer />);

    await waitFor(() => {
      // Verifica el nombre del lobby (match)
      const layout = screen.getByTestId("mock-lobby-layout");
      expect(layout).toHaveAttribute("data-match-name", mockMatch.name);

      // Verifica los jugadores iniciales
      expect(screen.getByText("Owner Player")).toBeInTheDocument();
      expect(screen.getByText("Current Player")).toBeInTheDocument();

      // Verifica los slots vacíos (max_players 4 - current 2 = 2 empty slots)
      const emptySlots = screen.getAllByTestId("empty-position");
      expect(emptySlots.length).toBe(2);
    });
  });

  it("should show 'Fatal error!!' on http fetch failure", async () => {
    mockGetMatch.mockRejectedValue(new Error("Fetch failed"));

    render(<LobbyContainer />);

    await waitFor(() => {
      expect(screen.getByText("Fatal error!!")).toBeInTheDocument();
    });
    expect(window.alert).toHaveBeenCalledWith(
      "Could not connect to the server.",
    );
  });

  it("should connect to WebSocket and register handlers on mount", async () => {
    render(<LobbyContainer />);

    await waitFor(() => {
      // Verifica el registro de ambos eventos WebSocket
      expect(mockOn).toHaveBeenCalledWith(
        mockSocketsEvents.LOBBY_JOIN,
        expect.any(Function),
      );
      expect(mockOn).toHaveBeenCalledWith(
        mockSocketsEvents.MATCHES,
        expect.any(Function),
      );
    });
  });

  /*   it('should handle "lobby_join" event and display the new player', async () => {
    render(<LobbyContainer />);

    await waitFor(() => {
      expect(mockOn).toHaveBeenCalled();
      expect(mockOn).toHaveBeenCalledWith(
        mockSocketsEvents.LOBBY_JOIN,
        expect.any(Function),
      );
    });

    const joinHandler = getEventHandler(mockSocketsEvents.LOBBY_JOIN);
    act(() => {
      joinHandler(mockNewPlayer);
    });

    // Verificamos que el nuevo jugador se renderiza y se reduce un slot vacío (3 jugadores, 1 slot)
    await waitFor(() => {
      expect(screen.getByText(mockNewPlayer.name)).toBeInTheDocument();
      expect(screen.getAllByTestId("empty-position").length).toBe(1);
    });

    // Simulamos un evento de jugador duplicado (debería ser ignorado)
    act(() => {
      joinHandler(mockNewPlayer);
    });
    // La cuenta de slots vacíos no debe cambiar
    expect(screen.getAllByTestId("empty-position").length).toBe(1);
  }); */

  it('should handle "matches" event with status "IN_PROGRESS" and navigate to game', async () => {
    render(<LobbyContainer />);

    await waitFor(() => {
      expect(mockOn).toHaveBeenCalled();
    });

    // Simulamos el evento 'matches' con status IN_PROGRESS
    const startHandler = getEventHandler(mockSocketsEvents.MATCHES);
    act(() => {
      startHandler({
        id: MOCK_MATCH_ID,
        id_match: MOCK_MATCH_ID, // El campo id_match viene en el evento
        name: mockMatch.name,
        status: "IN_PROGRESS",
        min_players: 2,
        max_players: 4,
        owner_id: MOCK_OWNER_ID,
        current_player_count: 2,
        current_player_order: 0,
      });
    });

    // Verificamos la navegación
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        FRONTEND_PATHS.MATCH_GAME(MOCK_MATCH_ID),
      );
    });
  });

  /* it('should handle "matches" event with status "WAITING" and updated player count', async () => {
    // Nuevo mock de getMatchPlayers para simular un nuevo jugador en la base de datos
    const updatedPlayers = [
      ...mockPlayers,
      { id: MOCK_NEW_PLAYER_ID, name: "Fetched Player" },
    ] as Player[];
    mockGetMatchPlayers.mockResolvedValueOnce(updatedPlayers);

    render(<LobbyContainer />);

    await waitFor(() => {
      expect(mockGetMatchPlayers).toHaveBeenCalledTimes(2);
      // Verificamos que el handler WS esté registrado
      expect(mockOn).toHaveBeenCalledWith(
        mockSocketsEvents.MATCHES,
        expect.any(Function),
      );
    });

    // Simulamos el evento 'matches' con status WAITING y mayor current_player_count
    const updateHandler = getEventHandler(mockSocketsEvents.MATCHES);
    act(() => {
      updateHandler({
        id: MOCK_MATCH_ID,
        id_match: MOCK_MATCH_ID,
        name: mockMatch.name,
        status: "WAITING",
        min_players: 2,
        max_players: 4,
        owner_id: MOCK_OWNER_ID,
        current_player_count: 3, // Count mayor que el inicial (2)
        current_player_order: 0,
      });
    });

    // Verificamos que se haya llamado a getMatchPlayers para obtener los datos actualizados
    await waitFor(() => {
      expect(mockGetMatchPlayers).toHaveBeenCalledTimes(4);
      expect(screen.getByText("Fetched Player")).toBeInTheDocument();
      expect(screen.getAllByTestId("empty-position").length).toBe(1);
    });
  }); */

  it("should allow the match owner to start the game", async () => {
    // Configuramos usePlayer para que el usuario sea el dueño
    mockUsePlayer.mockReturnValue({
      player: {
        id: MOCK_OWNER_ID,
        name: "Owner Player",
      },
    });

    render(<LobbyContainer />);

    await waitFor(() => {
      // Verificamos que el botón de inicio de juego se renderiza (solo para el dueño)
      const startGameButton = screen.getByTestId("start-game-button");
      expect(startGameButton).toBeInTheDocument();
      expect(screen.getByTestId("mock-lobby-layout")).toHaveAttribute(
        "data-isowner",
        "true",
      );
      // El dueño es también el jugador actual, por lo que es isMe: true
      expect(
        screen.getByTestId(`player-card-${MOCK_OWNER_ID}`),
      ).toHaveAttribute("data-isme", "true");
    });

    // Simular el click para iniciar la partida
    await act(async () => {
      await userEvent.click(screen.getByTestId("start-game-button"));
    });

    // Verificamos las llamadas de servicio y navegación
    expect(mockStartMatch).toHaveBeenCalledWith(MOCK_MATCH_ID);
    expect(mockNavigate).toHaveBeenCalledWith(
      FRONTEND_PATHS.MATCH_GAME(MOCK_MATCH_ID),
    );
  });

  it("should not allow a non-owner to start the game", async () => {
    // usePlayer es un no-dueño
    mockUsePlayer.mockReturnValue({
      player: {
        id: MOCK_PLAYER_ID,
        name: "Current Player",
      },
    });

    render(<LobbyContainer />);

    await waitFor(() => {
      // El layout no debe recibir isOwner=true y el botón no debe renderizarse
      expect(screen.getByTestId("mock-lobby-layout")).toHaveAttribute(
        "data-isowner",
        "false",
      );
      expect(screen.queryByTestId("start-game-button")).not.toBeInTheDocument();
    });

    // Verificamos que no se intentó llamar a startMatch
    expect(mockStartMatch).not.toHaveBeenCalled();
  });

  it("should off WebSocket events on unmount", () => {
    const { unmount } = render(<LobbyContainer />);

    // Verificar que al desmontar deja de escuchar los eventos
    unmount();

    expect(mockOff).toHaveBeenCalledWith(
      mockSocketsEvents.LOBBY_JOIN,
      expect.any(Function),
    );
    expect(mockOff).toHaveBeenCalledWith(
      mockSocketsEvents.MATCHES,
      expect.any(Function),
    );
    expect(mockOff).toHaveBeenCalledTimes(2);
  });
});
