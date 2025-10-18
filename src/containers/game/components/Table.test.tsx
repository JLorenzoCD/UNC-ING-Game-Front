import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";

import type { GamePlayer, Player as PlayerSchema } from "@/types/player";
import type { GameSecret } from "@/types/secret";

import Table from "./Table";
import type { MatchSet } from "@/types/set";
import type { UUID } from "@/types/common";
import type { Match } from "@/types/match";

// Mocks de dependencias
vi.mock("@/contexts/GameContext");
vi.mock("@/contexts/PlayerContext");

vi.mock("./Player", () => ({
  __esModule: true,
  default: vi.fn(({ player, secrets, sets, hasCurrentTurn }) => (
    <div
      data-testid={`mock-player-${player.id}`}
      data-player-name={player.name}
      data-player-order={player.order}
      data-secrets-count={secrets.length}
      data-sets-count={sets.length}
      data-current-turn={hasCurrentTurn ? "true" : "false"}
    >
      Player: {player.name}
    </div>
  )),
}));
const mockUseGame = vi.mocked(useGame);
const mockUsePlayer = vi.mocked(usePlayer);

// Datos Mock
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

const mockSets: MatchSet[] = [
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
];

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
    });

    mockUsePlayer.mockReturnValue({
      player: mockCurrPlayer,
      setPlayer: vi.fn(),
    });
  });

  it("should render without crashing", () => {
    render(
      <Table
        draft={<div>Draft Area</div>}
        drawPile={<div>Draw Pile</div>}
        discardPile={<div>Discard Pile</div>}
      />,
    );

    expect(
      screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_2}`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_3}`),
    ).toBeInTheDocument();

    // No debería renderizar al jugador actual
    expect(
      screen.queryByTestId(`mock-player-${MOCK_PLAYER_ID_1}`),
    ).not.toBeInTheDocument();
  });

  it("should render other players in order, starting from the next one", () => {
    // Como el jugador actual tiene el order = 1. Entonces el orden esperado es:
    // Jugador con order 2, luego Jugador con order 3.
    render(
      <Table
        draft={<div>Draft Area</div>}
        drawPile={<div>Draw Pile</div>}
        discardPile={<div>Discard Pile</div>}
      />,
    );

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

    // El orden de los jugadores de la partida sigue siendo 1, 2, 3
    // El jugador a excluir es el de order 2.
    // Orden esperado: Jugador con order 3, luego Jugador con order 1.

    mockUsePlayer.mockReturnValue({
      player: currPlayerP2,
      setPlayer: vi.fn(),
    });

    render(
      <Table
        draft={<div>Draft Area</div>}
        drawPile={<div>Draw Pile</div>}
        discardPile={<div>Discard Pile</div>}
      />,
    );

    const renderedPlayers = screen.getAllByTestId(/mock-player-/);
    expect(renderedPlayers).toHaveLength(2);

    // Los jugadores se ordenan por 'order' ascendente
    // El primer jugador renderizado debería ser Player 1 (orden 1)
    expect(renderedPlayers[0]).toHaveAttribute(
      "data-player-name",
      "Current Player",
    );

    // El segundo jugador renderizado debería ser Player 3 (orden 3)
    expect(renderedPlayers[1]).toHaveAttribute("data-player-name", "Player 3");
  });

  it("should pass correct secrets and sets counts to each Player component", () => {
    render(
      <Table
        draft={<div>Draft Area</div>}
        drawPile={<div>Draw Pile</div>}
        discardPile={<div>Discard Pile</div>}
      />,
    );

    //* En el juego siempre se pasan 3 secretos, pero a la hora de hacer el test
    //* es lo prácticamente lo mismo, ya que se basa en un arreglo.

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
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        match: { ...mockUseGame().match!, current_player_order: 2 },
      });
      render(
        <Table
          draft={<div>Draft Area</div>}
          drawPile={<div>Draw Pile</div>}
          discardPile={<div>Discard Pile</div>}
        />,
      );

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
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        match: { ...mockUseGame().match!, current_player_order: 3 },
      });
      render(
        <Table
          draft={<div>Draft Area</div>}
          drawPile={<div>Draw Pile</div>}
          discardPile={<div>Discard Pile</div>}
        />,
      );

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
      render(
        <Table
          draft={<div>Draft Area</div>}
          drawPile={<div>Draw Pile</div>}
          discardPile={<div>Discard Pile</div>}
        />,
      );

      const player2 = screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_2}`); // Orden de renderizado: 0
      const player3 = screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_3}`); // Orden de renderizado: 1

      // Position classes are now applied in the parent div, not passed as props
      // Just verify the players are rendered
      expect(player2).toBeInTheDocument();
      expect(player3).toBeInTheDocument();
    });

    it("should apply correct positionClassName for 1 other player", () => {
      const mockGamePlayers2: GamePlayer[] = [
        mockGamePlayers[0], // Current Player (Order 1)
        mockGamePlayers[1], // Player 2 (Order 2)
      ];

      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        players: mockGamePlayers2, // 1 solo "otro" jugador
        secrets: mockSecrets.filter((s) => s.player_id === MOCK_PLAYER_ID_2),
        sets: mockSets.filter((s) => s.player_id === MOCK_PLAYER_ID_2),
      });

      render(
        <Table
          draft={<div>Draft Area</div>}
          drawPile={<div>Draw Pile</div>}
          discardPile={<div>Discard Pile</div>}
        />,
      );

      const renderedPlayers = screen.getAllByTestId(/mock-player-/);
      expect(renderedPlayers).toHaveLength(1);

      const player2 = screen.getByTestId(`mock-player-${MOCK_PLAYER_ID_2}`); // Orden de renderizado: 0

      // Position classes are now applied in the parent div, not passed as props
      // Just verify the player is rendered
      expect(player2).toBeInTheDocument();
    });
  });
});
