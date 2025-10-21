import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";

import type { GamePlayer, Player as PlayerSchema } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";
import type { UUID } from "@/types/common";
import type { Match } from "@/types/match";

import Table from "./Table";

vi.mock("@/contexts/GameContext");
vi.mock("@/contexts/PlayerContext");
vi.mock("../utils/tablePositions.ts", () => ({
  getVisiblePlayersWithGridPositions: vi.fn(),
}));
vi.mock("./Player", () => ({
  __esModule: true,
  default: vi.fn(
    ({
      player,
      secrets,
      sets,
      hasCurrentTurn,
      isSelectablePlayer,
      isSelectableSecret,
      isPlayerEvent,
      isTargetSecret,
    }) => (
      <div
        data-testid={`mock-player-${player.id}`}
        data-player-name={player.name}
        data-player-order={player.order}
        data-secrets-count={secrets.length}
        data-sets-count={sets.length}
        data-current-turn={hasCurrentTurn ? "true" : "false"}
        // NUEVOS ATRIBUTOS PARA PROPS BOOLEANAS
        data-is-selectable-player={isSelectablePlayer ? "true" : "false"}
        data-is-selectable-secret={isSelectableSecret ? "true" : "false"}
        data-is-player-event={isPlayerEvent ? "true" : "false"}
        data-is-target-secret={isTargetSecret ? "true" : "false"}
      >
        Player: {player.name}
      </div>
    ),
  ),
}));

import { getVisiblePlayersWithGridPositions } from "../utils/tablePositions";

const mockGetVisiblePlayersWithGridPositions = vi.mocked(
  getVisiblePlayersWithGridPositions,
);
const mockUseGame = vi.mocked(useGame);
const mockUsePlayer = vi.mocked(usePlayer);

// Datos Mock (Se mantienen)
const MOCK_PLAYER_ID_1 = crypto.randomUUID();
const MOCK_PLAYER_ID_2 = crypto.randomUUID();
const MOCK_PLAYER_ID_3 = crypto.randomUUID();
const MOCK_MATCH_ID = "match-1" as UUID;

const mockMatch = {
  id: MOCK_MATCH_ID,
  name: "Match 1",
  status: "IN_PROGRESS",
  current_player_order: 1,
} as Match;

const mockCurrPlayer: PlayerSchema = {
  id: MOCK_PLAYER_ID_1,
  name: "Current Player",
  avatar: "avatar1.png",
  birthday: new Date("2000-01-01"),
};

const mockGamePlayers = [
  {
    ...mockCurrPlayer,
    player_id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    order: 1,
  },
  {
    id: MOCK_PLAYER_ID_2,
    name: "Player 2",
    avatar: "avatar2.png",
    birthday: new Date("2000-01-01"),
    player_id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    order: 2,
  },
  {
    id: MOCK_PLAYER_ID_3,
    name: "Player 3",
    avatar: "avatar3.png",
    birthday: new Date("2000-01-01"),
    player_id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    order: 3,
  },
] as GamePlayer[];

const mockSecrets: GameSecret[] = [
  {
    type: "INNOCENT",
    content: "You are innocent",
    id: crypto.randomUUID(),
    match_id: crypto.randomUUID(),
    secret_id: crypto.randomUUID(),
    player_id: MOCK_PLAYER_ID_2,
    is_revealed: false,
  },
  {
    type: "INNOCENT",
    id: crypto.randomUUID(),
    content: "You are the innocent",
    match_id: crypto.randomUUID(),
    secret_id: crypto.randomUUID(),
    player_id: MOCK_PLAYER_ID_2,
    is_revealed: false,
  },
  {
    type: "MURDERER",
    id: crypto.randomUUID(),
    content: "You are the murderer",
    match_id: crypto.randomUUID(),
    secret_id: crypto.randomUUID(),
    player_id: MOCK_PLAYER_ID_3,
    is_revealed: false,
  },
];

const mockSets = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    type: "HERCULE POIROT",
    player_id: MOCK_PLAYER_ID_3,
    match_id: MOCK_MATCH_ID,
    quin_play: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    type: "MISS MARPLE",
    player_id: MOCK_PLAYER_ID_3,
    match_id: MOCK_MATCH_ID,
    quin_play: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    type: "TOMMY BERESFORD",
    player_id: MOCK_PLAYER_ID_2,
    match_id: MOCK_MATCH_ID,
    quin_play: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    type: "LADY EILEEN",
    player_id: MOCK_PLAYER_ID_2,
    match_id: MOCK_MATCH_ID,
    quin_play: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    type: "TWO BERESFORD",
    player_id: MOCK_PLAYER_ID_2,
    match_id: MOCK_MATCH_ID,
    quin_play: false,
  },
] as unknown as MatchSet[];

// Datos que simulan el resultado de getVisiblePlayersWithGridPositions
const getMockVisiblePlayers = (
  currPlayerId: string,
  players: GamePlayer[],
  secrets: GameSecret[],
  sets: MatchSet[],
  currentPlayerOrder: number = 1,
) => {
  const visiblePlayers = players.filter((p) => p.id !== currPlayerId);

  const sortedPlayers = [...visiblePlayers].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  return sortedPlayers.map((playerData, i) => ({
    turn: currentPlayerOrder === playerData.order,
    position: i === 0 ? "col-start-2 row-start-1" : "col-start-3 row-start-2", // Simplified positions for 2 other players
    playerData,
    playerSets: sets.filter((set) => set.player_id === playerData.id),
    playerSecrets: secrets.filter(
      (secret) => secret.player_id === playerData.id,
    ),
  }));
};

// Default props for Table component (will be changed later)
const defaultTableProps = {
  draft: <div>Draft Area</div>,
  drawPile: <div>Draw Pile</div>,
  discardPile: <div>Discard Pile</div>,
  isEvent: false,
  isTargetPlayer: false,
  isTargetSecret: false,
  isTargetSet: false,
  target: null,
  onSelectTargetEvent: () => {},
  isSelectablePlayer: () => false,
  isSelectableSecret: () => false,
  isSelectableSet: () => false,
};

describe("Table Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGame.mockReturnValue({
      secrets: mockSecrets,
      cards: [],
      match: mockMatch,
      players: mockGamePlayers,
      sets: mockSets,
      isLoading: false,
      hasError: false,
      error: null,
    } as any);

    mockUsePlayer.mockReturnValue({
      player: mockCurrPlayer,
      setPlayer: vi.fn(),
    });

    // Mock por defecto de la función de utilidades
    mockGetVisiblePlayersWithGridPositions.mockImplementation(() =>
      getMockVisiblePlayers(
        mockCurrPlayer.id,
        mockGamePlayers,
        mockSecrets,
        mockSets,
        mockMatch.current_player_order,
      ),
    );
  });

  it("should render without crashing", () => {
    render(<Table {...defaultTableProps} />);

    expect(
      screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_2}`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_3}`),
    ).toBeInTheDocument();

    // Se verifica que la función de utilidades fue llamada
    expect(mockGetVisiblePlayersWithGridPositions).toHaveBeenCalledWith(
      mockCurrPlayer,
      mockGamePlayers,
      mockMatch,
      mockSecrets,
      mockSets,
    );

    // No debería renderizar al jugador actual
    expect(
      screen.queryByTestId(`mock-player-${MOCK_PLAYER_ID_1}`),
    ).not.toBeInTheDocument();
  });

  it("should render other players in order, starting from the next one", () => {
    // Como el jugador actual tiene el order = 1. Entonces el orden esperado es:
    // Jugador con order 2, luego Jugador con order 3. (Manejado por getMockVisiblePlayers)
    render(<Table {...defaultTableProps} />);

    const renderedPlayers = screen.getAllByTestId(/mock-player-/);
    expect(renderedPlayers).toHaveLength(2);

    // El primer jugador renderizado debería ser Player 2 (orden 2)
    expect(renderedPlayers[0]).toHaveAttribute("data-player-name", "Player 2");
    // El segundo jugador renderizado debería ser Player 3 (orden 3)
    expect(renderedPlayers[1]).toHaveAttribute("data-player-name", "Player 3");
  });

  it("should correctly handle player order when the current player is not Order 1", () => {
    // Simulamos que el jugador actual es el Player 2 (order 2)
    const currPlayerP2: PlayerSchema = {
      id: MOCK_PLAYER_ID_2,
      name: "Player 2",
      avatar: "avatar2.png",
      birthday: new Date("2000-01-01"),
    };

    mockUsePlayer.mockReturnValue({
      player: currPlayerP2,
      setPlayer: vi.fn(),
    });

    // Mock específico para este caso
    mockGetVisiblePlayersWithGridPositions.mockImplementation(() =>
      getMockVisiblePlayers(
        currPlayerP2.id,
        mockGamePlayers,
        mockSecrets,
        mockSets,
        mockMatch.current_player_order,
      ),
    );

    render(<Table {...defaultTableProps} />);

    const renderedPlayers = screen.getAllByTestId(/mock-player-/);
    expect(renderedPlayers).toHaveLength(2);

    // Los jugadores se ordenan por 'order' ascendente dentro del mock:
    // Player 1 (orden 1), luego Player 3 (orden 3)
    expect(renderedPlayers[0]).toHaveAttribute(
      "data-player-name",
      "Current Player",
    );
    expect(renderedPlayers[1]).toHaveAttribute("data-player-name", "Player 3");
  });

  it("should pass correct secrets and sets counts to each Player component", () => {
    // Los datos se pasan a través del resultado mockeado de getVisiblePlayersWithGridPositions
    render(<Table {...defaultTableProps} />);

    // Player 2 (MOCK_PLAYER_ID_2): 2 secretos, 3 sets
    const player2 = screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_2}`);
    expect(player2).toHaveAttribute("data-secrets-count", "2");
    expect(player2).toHaveAttribute("data-sets-count", "3");

    // Player 3 (MOCK_PLAYER_ID_3): 1 secreto, 2 sets
    const player3 = screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_3}`);
    expect(player3).toHaveAttribute("data-secrets-count", "1");
    expect(player3).toHaveAttribute("data-sets-count", "2");
  });

  describe("Current Turn Indicator", () => {
    it("should mark the correct player as 'hasCurrentTurn' when match.current_player_order changes", () => {
      // Caso 1: Turno del Player 2 (Order 2)
      const mockMatchP2 = { ...mockMatch, current_player_order: 2 };

      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        match: mockMatchP2,
      });

      // Se actualiza el mock de utilidades para el nuevo turno
      mockGetVisiblePlayersWithGridPositions.mockImplementation(() =>
        getMockVisiblePlayers(
          mockCurrPlayer.id,
          mockGamePlayers,
          mockSecrets,
          mockSets,
          mockMatchP2.current_player_order,
        ),
      );

      render(<Table {...defaultTableProps} />);

      // Player 2 tiene el turno
      expect(
        screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_2}`),
      ).toHaveAttribute("data-current-turn", "true");
      // Player 3 no tiene el turno
      expect(
        screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_3}`),
      ).toHaveAttribute("data-current-turn", "false");
    });

    it("should mark the correct player as 'hasCurrentTurn' when match.current_player_order matches player 3 (Order 3)", () => {
      // Caso 2: Turno del Player 3 (Order 3)
      const mockMatchP3 = { ...mockMatch, current_player_order: 3 };

      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        match: mockMatchP3,
      });

      // Se actualiza el mock de utilidades para el nuevo turno
      mockGetVisiblePlayersWithGridPositions.mockImplementation(() =>
        getMockVisiblePlayers(
          mockCurrPlayer.id,
          mockGamePlayers,
          mockSecrets,
          mockSets,
          mockMatchP3.current_player_order,
        ),
      );

      render(<Table {...defaultTableProps} />);

      // Player 2 no tiene el turno
      expect(
        screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_2}`),
      ).toHaveAttribute("data-current-turn", "false");
      // Player 3 tiene el turno
      expect(
        screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_3}`),
      ).toHaveAttribute("data-current-turn", "true");
    });
  });

  describe("Position Class Name", () => {
    it("should apply correct positionClassName for 2 other players", () => {
      // Tenemos 3 jugadores en total, se renderizan 2 'other players'
      // Las posiciones mockeadas son:
      // Player 2 (Order 2): col-start-2 row-start-1 (posición [0])
      // Player 3 (Order 3): col-start-3 row-start-2 (posición [1])
      render(<Table {...defaultTableProps} />);

      const player2Div = screen.getByTestId(
        `mock-player-${MOCK_PLAYER_ID_2}`,
      ).parentElement;
      const player3Div = screen.getByTestId(
        `mock-player-${MOCK_PLAYER_ID_3}`,
      ).parentElement;

      expect(player2Div).toHaveClass("col-start-2 row-start-1");
      expect(player3Div).toHaveClass("col-start-3 row-start-2");
    });

    it("should apply correct positionClassName for 1 other player", () => {
      const mockGamePlayers2: GamePlayer[] = [
        mockGamePlayers[0], // Current Player (Order 1)
        mockGamePlayers[1], // Player 2 (Order 2)
      ];

      const mockSecretsP2 = mockSecrets.filter(
        (s) => s.player_id === MOCK_PLAYER_ID_2,
      );
      const mockSetsP2 = mockSets.filter(
        (s) => s.player_id === MOCK_PLAYER_ID_2,
      );

      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        players: mockGamePlayers2, // 1 solo "otro" jugador
        secrets: mockSecretsP2,
        sets: mockSetsP2,
      });

      // Mock específico para 1 jugador visible (posición 0)
      mockGetVisiblePlayersWithGridPositions.mockImplementation(() =>
        getMockVisiblePlayers(
          mockCurrPlayer.id,
          mockGamePlayers2,
          mockSecretsP2,
          mockSetsP2,
        ).slice(0, 1),
      );

      render(<Table {...defaultTableProps} />);

      const renderedPlayers = screen.getAllByTestId(/mock-player-/);
      expect(renderedPlayers).toHaveLength(1);

      const player2Div = screen.getByTestId(
        `mock-player-${MOCK_PLAYER_ID_2}`,
      ).parentElement;

      // Debería usar la posición 0 del mock (col-start-2 row-start-1)
      expect(player2Div).toHaveClass("col-start-2 row-start-1");
    });
  });

  it("should correctly pass isSelectable, isPlayerEvent, and isTargetSecret props to Player", () => {
    const MOCK_TARGET = { id: "some-target-id" };

    const customProps = {
      ...defaultTableProps,
      isEvent: true,
      isTargetPlayer: true,
      isTargetSecret: false,
      target: MOCK_TARGET,

      isSelectablePlayer: (player: GamePlayer) => player.order === 2,
      isSelectableSecret: () => true,
    } as any;

    render(<Table {...customProps} />);

    // Obtenemos las referencias a los elementos mockeados
    const player2 = screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_2}`);
    const player3 = screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_3}`);

    expect(player2).toHaveAttribute("data-is-selectable-player", "true");

    // Verificaciones adicionales de las otras props
    expect(player3).toHaveAttribute("data-is-selectable-secret", "true");
    expect(player3).toHaveAttribute("data-is-player-event", "true");
    expect(player3).toHaveAttribute("data-is-target-secret", "false");
  });
});
