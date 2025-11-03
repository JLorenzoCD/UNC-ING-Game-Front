import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  renderHook,
  act,
} from "@testing-library/react";

import GameContextProvider, { useGame } from "./GameContext";

import type { UUID } from "@/types/common";
import type { Match } from "@/types/match";
import type { GameCard } from "@/types/card";
import type { GameSecret } from "@/types/secret";
import type { GamePlayer } from "@/types/player";
import type { MatchSet } from "@/types/set";

const {
  mockOn,
  mockOff,
  mockUseWebSocketService,
  mainToastFunction,
  mockSocketsEvents,
  mockHttpService,
  mockUseHttpService,
  mockUseParams,
  mockUsePlayer,
  mockMatchId,
  mockPlayerOne,
  mockPlayerTwo,
  mockMatch,
  mockCards,
  mockSecrets,
  mockPlayers,
} = vi.hoisted(() => {
  const mockHttpService = {
    getMatch: vi.fn(),
    getMatchCards: vi.fn(),
    getMatchSecrets: vi.fn(),
    getMatchPlayers: vi.fn(),
    getMatchSets: vi.fn(),
  };
  const mockUseHttpService = vi.fn((): any => ({
    httpService: mockHttpService,
  }));

  const mockMatchId = crypto.randomUUID() as UUID;

  const playerOneId = crypto.randomUUID();
  const mockPlayerOne: GamePlayer = {
    id: playerOneId,
    match_id: mockMatchId,
    player_id: playerOneId,
    name: "PlayerOne",
    avatar: "avatar1.png",
    birthday: new Date("2001-01-01"),
    order: 0,
    role: "INNOCENT",
  };

  const playerTwoId = crypto.randomUUID();
  const mockPlayerTwo: GamePlayer = {
    id: playerTwoId,
    match_id: mockMatchId,
    player_id: playerTwoId,
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

  // Mock de WebSocket
  const mockOn = vi.fn();
  const mockOff = vi.fn();
  const mockUseWebSocketService = vi.fn(() => ({
    wsService: { on: mockOn, off: mockOff },
    isConnected: true,
  }));

  // Mock de constantes
  const mockSocketsEvents = {
    CARDS: "cards_WS_event",
    TURN: "turns_WS_event",
    SET: "sets_WS_event",
    SECRET: "secret_WS_event",
    PLAYER_SECRET_REVEAL: "player_secret_reveal_WS_event",
  };

  const mockUseParams = vi.fn((): any => ({
    matchId: mockMatchId,
  }));

  const MOCKED_CURRENT_PLAYER = {
    id: mockPlayerOne.id as UUID,
    name: mockPlayerOne.name,
  };

  // Mock del hook usePlayer
  const mockUsePlayer = vi.fn((): any => ({
    player: MOCKED_CURRENT_PLAYER,
  }));

  const mockToast = {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    custom: vi.fn(),
  };
  const mainToastFunction = vi.fn();
  Object.assign(mainToastFunction, mockToast);

  return {
    mockOn,
    mockOff,
    mockUseWebSocketService,
    mockUseHttpService,
    mockSocketsEvents,
    mockHttpService,
    mockUseParams,
    mainToastFunction,
    mockUsePlayer,
    mockMatchId,
    mockPlayerOne,
    mockPlayerTwo,
    mockMatch,
    mockCards,
    mockSecrets,
    mockPlayers,
  };
});

// Mock dependencies
vi.mock("./HttpServiceContext", () => ({
  useHttpService: mockUseHttpService,
}));
vi.mock("@/constants/backend", () => ({
  BACKEND_SOCKETS_EVENTS: mockSocketsEvents,
}));
vi.mock("./WebSocketServiceContext", () => ({
  useWebSocketService: mockUseWebSocketService,
}));
vi.mock("./PlayerContext", () => ({
  usePlayer: mockUsePlayer,
}));
vi.mock("react-router", () => ({
  useParams: mockUseParams,
}));
vi.mock("sonner", () => {
  return { toast: mainToastFunction };
});

// Mock console.error to avoid noise in tests
const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

// Función auxiliar para obtener el handler por el nombre del evento
const getEventHandler = (eventName: string) => {
  // Encuentra TODAS las llamadas para ese evento
  const calls = mockOn.mock.calls.filter((call) => call[0] === eventName);
  if (calls.length === 0)
    throw new Error(`Handler for event ${eventName} not found.`);

  // Devuelve el handler de la ÚLTIMA llamada (la más reciente/actualizada)
  return calls[calls.length - 1][1];
};

// Helper para montar el hook y ejecutar la carga inicial de datos
const setupContextAndGetResult = async (currentPlayer: GamePlayer | null) => {
  // Mockear la carga inicial para que el estado de players esté disponible
  mockHttpService.getMatch.mockResolvedValue(mockMatch);
  mockHttpService.getMatchCards.mockResolvedValue(mockCards);
  mockHttpService.getMatchSecrets.mockResolvedValue(mockSecrets);
  mockHttpService.getMatchPlayers.mockResolvedValue(mockPlayers);
  mockHttpService.getMatchSets.mockResolvedValue([]);

  const playerInHook = currentPlayer
    ? { id: currentPlayer.id, name: currentPlayer.name }
    : null;
  mockUsePlayer.mockReturnValue({ player: playerInHook });

  const { result } = renderHook(() => useGame(), {
    wrapper: ({ children }) => (
      <GameContextProvider>{children}</GameContextProvider>
    ),
  });

  // Esperar a que la carga inicial termine
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  return result;
};

describe("GameContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseHttpService.mockReturnValue({ httpService: mockHttpService });

    mockUseWebSocketService.mockReturnValue({
      wsService: { on: mockOn, off: mockOff },
      isConnected: true,
    });
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
      mockHttpService.getMatchSets.mockResolvedValue([]);

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
            <span data-testid="sets-count">{context.sets.length}</span>
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
      expect(screen.getByTestId("sets-count")).toHaveTextContent("0");

      expect(mockHttpService.getMatch).toHaveBeenCalledWith(mockMatchId);
      expect(mockHttpService.getMatchCards).toHaveBeenCalledWith(mockMatchId);
      expect(mockHttpService.getMatchSecrets).toHaveBeenCalledWith(mockMatchId);
      expect(mockHttpService.getMatchPlayers).toHaveBeenCalledWith(mockMatchId);
      expect(mockHttpService.getMatchSets).toHaveBeenCalledWith(mockMatchId);
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
      mockUseParams.mockReturnValue({ matchId: undefined });

      render(
        <GameContextProvider>
          <div>Test</div>
        </GameContextProvider>,
      );

      expect(mockHttpService.getMatch).not.toHaveBeenCalled();
      expect(mockHttpService.getMatchCards).not.toHaveBeenCalled();
      expect(mockHttpService.getMatchSecrets).not.toHaveBeenCalled();
      expect(mockHttpService.getMatchPlayers).not.toHaveBeenCalled();
      expect(mockHttpService.getMatchSets).not.toHaveBeenCalled();
    });

    it("does not fetch data when httpService is not available", () => {
      mockUseHttpService.mockReturnValue({ httpService: null });

      render(
        <GameContextProvider>
          <div>Test</div>
        </GameContextProvider>,
      );

      expect(mockHttpService.getMatch).not.toHaveBeenCalled();
    });

    it("handles invalid UUID matchId", () => {
      mockUseParams.mockReturnValue({ matchId: "invalid-uuid" });

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
      mockHttpService.getMatchSets.mockRejectedValueOnce(testError);

      // Setup successful responses for second render
      mockHttpService.getMatch.mockResolvedValue(mockMatch);
      mockHttpService.getMatchCards.mockResolvedValue(mockCards);
      mockHttpService.getMatchSecrets.mockResolvedValue(mockSecrets);
      mockHttpService.getMatchPlayers.mockResolvedValue(mockPlayers);
      mockHttpService.getMatchSets.mockResolvedValue([]);

      const firstMatchId = crypto.randomUUID();
      mockUseParams.mockReturnValue({ matchId: firstMatchId });

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
      mockUseParams.mockReturnValue({ matchId: secondMatchId });

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
        hasFinishedAction: false,
        lastUpdatedSecretId: null,
        playerFinishActionTurn: expect.any(Function),
        playerSelectsOneOfHisSecrets: {
          isCurrPlayer: false,
          isSelecting: false,
        },
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

  describe("WebSocket Handlers", () => {
    it("should register and cleanup WebSocket handlers", async () => {
      const { unmount } = render(
        <GameContextProvider>
          <div>Children</div>
        </GameContextProvider>,
      );

      await waitFor(() => {
        // Verificación de registro
        expect(mockOn).toHaveBeenCalledWith(
          mockSocketsEvents.CARDS,
          expect.any(Function),
        );
        expect(mockOn).toHaveBeenCalledWith(
          mockSocketsEvents.TURN,
          expect.any(Function),
        );
        expect(mockOn).toHaveBeenCalledWith(
          mockSocketsEvents.SET,
          expect.any(Function),
        );
        expect(mockOn).toHaveBeenCalledWith(
          mockSocketsEvents.SECRET,
          expect.any(Function),
        );
        expect(mockOn).toHaveBeenCalledWith(
          mockSocketsEvents.PLAYER_SECRET_REVEAL,
          expect.any(Function),
        );
      });

      // Verificación de cleanup
      unmount();
      expect(mockOff).toHaveBeenCalledWith(
        mockSocketsEvents.CARDS,
        expect.any(Function),
      );
      expect(mockOff).toHaveBeenCalledWith(
        mockSocketsEvents.TURN,
        expect.any(Function),
      );
      expect(mockOff).toHaveBeenCalledWith(
        mockSocketsEvents.SET,
        expect.any(Function),
      );
      expect(mockOff).toHaveBeenCalledWith(
        mockSocketsEvents.SECRET,
        expect.any(Function),
      );
      expect(mockOff).toHaveBeenCalledWith(
        mockSocketsEvents.PLAYER_SECRET_REVEAL,
        expect.any(Function),
      );
    });

    it("handleUpdateCards: should update existing cards with new values", async () => {
      const result = await setupContextAndGetResult(mockPlayerOne);
      const handler = getEventHandler(mockSocketsEvents.CARDS);

      expect(result.current.cards.length).toBe(2);
      expect(result.current.cards[0].player_id).toBe(mockPlayerOne.player_id);
      expect(result.current.cards[1].is_discarded).toBe(false);

      const updatedCards: GameCard[] = [
        {
          ...mockCards[0],
          player_id: mockPlayerTwo.player_id, // Cambia de dueño
        },
        {
          ...mockCards[1],
          is_discarded: true, // Se descarta
          discarded_at: new Date("2025-10-19T10:00:00Z"),
        },
      ];

      // Act: Ejecutar el handler de WS
      handler(updatedCards);

      // Assert: Verificar el estado actualizado
      await waitFor(() => {
        expect(result.current.cards[0].player_id).toBe(mockPlayerTwo.player_id);
        expect(result.current.cards[1].is_discarded).toBe(true);
      });
    });

    it("handleUpdateMatchTurn: should update match turn and reset playerFinishAction", async () => {
      const result = await setupContextAndGetResult(mockPlayerOne);
      const handler = getEventHandler(mockSocketsEvents.TURN);

      // Estado inicial
      expect(result.current.match?.current_player_order).toBe(0);

      // Simular que el jugador actual terminó su acción
      result.current.playerFinishActionTurn();
      await waitFor(() => expect(result.current.hasFinishedAction).toBe(true));

      const newMatch: Match = {
        ...mockMatch,
        current_player_order: 1, // Nuevo turno
      };

      // Act: Ejecutar el handler de WS
      handler(newMatch);

      // Assert: Verificar el estado actualizado
      await waitFor(() => {
        expect(result.current.match?.current_player_order).toBe(1);
        expect(result.current.hasFinishedAction).toBe(false); // Debe resetearse
      });
    });

    it("handleUpdateSets: should add a new set and remove the deleted cards", async () => {
      const result = await setupContextAndGetResult(mockPlayerOne);

      expect(result.current.sets.length).toBe(0);
      expect(result.current.cards.length).toBe(2);
      expect(result.current.players.length).toBe(2);

      const handler = getEventHandler(mockSocketsEvents.SET);

      const newSetId = crypto.randomUUID();
      const cardToDeleteId = mockCards[0].id;

      const newSetEvent = {
        id: newSetId as UUID,
        match_id: mockMatchId as UUID,
        player_id: result.current.players[0].id as UUID,
        deleted_cards: [cardToDeleteId],
        quin_count: 0,
        quin_play: false,
        type: "HERCULE POIROT",
      } as MatchSet & { deleted_cards: UUID[] };

      expect(result.current.players.length).toBeGreaterThan(0);

      // Act: Ejecutar el handler de WS
      await act(() => handler(newSetEvent));

      // Assert: Verificar el estado actualizado (ya no necesitamos waitFor)
      expect(result.current.sets.length).toBe(1);
      expect(result.current.sets[0].id).toBe(newSetId);
      expect(result.current.cards.length).toBe(1);
      expect(result.current.cards.some((c) => c.id === cardToDeleteId)).toBe(
        false,
      );
      expect(mainToastFunction).toHaveBeenCalledWith(
        `Player "${mockPlayerOne.name}" played a set.`,
      );
    });

    it("handleUpdateSecrets: should update a secret as revealed and set lastUpdatedSecretId", async () => {
      const result = await setupContextAndGetResult(mockPlayerOne);
      const handler = getEventHandler(mockSocketsEvents.SECRET);

      // Se usa el mockSecrets inicial
      const secretToUpdate = mockSecrets[0]; // Innocent
      expect(
        result.current.secrets.find((s) => s.id === secretToUpdate.id)
          ?.is_revealed,
      ).toBe(false);

      const updatedSecret = {
        ...secretToUpdate,
        is_revealed: true, // Revelado
      };

      // Act: Ejecutar el handler de WS
      handler(updatedSecret);

      // Assert: Verificar el estado actualizado
      await waitFor(() => {
        const updated = result.current.secrets.find(
          (s) => s.id === secretToUpdate.id,
        );
        expect(updated?.is_revealed).toBe(true);
        expect(result.current.lastUpdatedSecretId).toBe(secretToUpdate.id);
        expect(mainToastFunction).toHaveBeenCalledWith(
          `A secret from player "${mockPlayerOne.name}" was selected to be revealed.`,
        );
      });
    });

    it("handleUpdateSecrets: should handle STOLEN and HIDDEN secret (player_id change and is_revealed false)", async () => {
      const result = await setupContextAndGetResult(mockPlayerOne);
      const handler = getEventHandler(mockSocketsEvents.SECRET);

      // El secreto se REVELA primero (para poder simular que se OCULTA/ROBA después)
      const initialSecret = mockSecrets[1]; // Murderer, dueño: PlayerTwo
      const revealedSecret = {
        ...initialSecret,
        is_revealed: true,
      };
      handler(revealedSecret);
      await waitFor(() => {
        expect(
          result.current.secrets.find((s) => s.id === initialSecret.id)
            ?.is_revealed,
        ).toBe(true);
      });
      mainToastFunction.mockClear(); // Limpiar el toast del primer evento

      // Se ROBA y se OCULTA
      const stolenAndHiddenSecret = {
        ...initialSecret,
        player_id: mockPlayerOne.player_id, // Cambia el dueño a PlayerOne (robo)
        is_revealed: false, // Se oculta
      };

      // Act: Ejecutar el handler de WS
      handler(stolenAndHiddenSecret);

      // Assert: Verificar el estado actualizado y el mensaje de robo
      await waitFor(() => {
        const updated = result.current.secrets.find(
          (s) => s.id === initialSecret.id,
        );
        expect(updated?.is_revealed).toBe(false);
        expect(updated?.player_id).toBe(mockPlayerOne.player_id);
        // El jugador objetivo es el ANTERIOR dueño (PlayerTwo)
        expect(mainToastFunction).toHaveBeenCalledWith(
          `A secret was stolen from player "${mockPlayerTwo.name}" and hidden.`,
        );
      });
    });

    it("handleCurrPlayerSelectItsSecret: should set selecting state for CURRENT player and show a specific toast", async () => {
      // Configurar el mockPlayerOne como el jugador actual
      const result = await setupContextAndGetResult(mockPlayerOne);
      const handler = getEventHandler(mockSocketsEvents.PLAYER_SECRET_REVEAL);

      const eventData = { target_player_id: mockPlayerOne.id }; // PlayerOne es el objetivo

      // Act: Ejecutar el handler de WS
      await act(() => handler(eventData));

      // Assert: Verificar el estado y el toast
      expect(result.current.playerSelectsOneOfHisSecrets.isSelecting).toBe(
        true,
      );
      expect(result.current.playerSelectsOneOfHisSecrets.isCurrPlayer).toBe(
        true,
      );
      expect(mainToastFunction).toHaveBeenCalledWith(
        "You've been selected to reveal one of your secrets. Choose one.",
      );
    });

    it("handleCurrPlayerSelectItsSecret: should set selecting state for OTHER player and show a general toast", async () => {
      // Configurar el mockPlayerOne como el jugador actual
      const result = await setupContextAndGetResult(mockPlayerOne);
      const handler = getEventHandler(mockSocketsEvents.PLAYER_SECRET_REVEAL);

      const eventData = { target_player_id: mockPlayerTwo.id }; // PlayerTwo es el objetivo (no es el actual)

      // Act: Ejecutar el handler de WS
      handler(eventData);

      // Assert: Verificar el estado y el toast
      await waitFor(() => {
        expect(result.current.playerSelectsOneOfHisSecrets.isSelecting).toBe(
          true,
        );
        expect(result.current.playerSelectsOneOfHisSecrets.isCurrPlayer).toBe(
          false,
        );
        expect(mainToastFunction).toHaveBeenCalledWith(
          "A player was selected to reveal one of his secrets.",
        );
      });
    });
  });
});
