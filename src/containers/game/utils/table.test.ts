import { describe, it, expect } from "vitest";

import type { GamePlayer, Player } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";
import type { Match } from "@/types/match";
import type { UUID } from "@/types/common";

import {
  getGridPositionsForPlayerCount,
  getVisiblePlayersWithGridPositions,
} from "./table"; // Asegúrate que la ruta de importación sea correcta

// Datos Mock Comunes
const MOCK_PLAYER_ID_1 = "id-curr" as UUID;
const MOCK_PLAYER_ID_2 = "id-p2" as UUID;
const MOCK_PLAYER_ID_3 = "id-p3" as UUID;
const MOCK_PLAYER_ID_4 = "id-p4" as UUID;
const MOCK_PLAYER_ID_5 = "id-p5" as UUID;
const MOCK_PLAYER_ID_6 = "id-p6" as UUID;

const mockCurrentPlayer: Player = {
  id: MOCK_PLAYER_ID_1,
  name: "Current",
  avatar: "a.png",
  birthday: new Date(),
};

const mockMatch: Match = {
  id: "match-1" as UUID,
  name: "Match 1",
  status: "IN_PROGRESS",
  current_player_order: 3, // El turno es del Player 3 por defecto
} as Match;

const mockAllPlayers = [
  {
    ...mockCurrentPlayer,
    player_id: MOCK_PLAYER_ID_1,
    match_id: "m",
    order: 1,
  },
  {
    id: MOCK_PLAYER_ID_2,
    name: "P2",
    player_id: MOCK_PLAYER_ID_2,
    match_id: "m",
    order: 2,
    avatar: "a.png",
    birthday: new Date(),
  },
  {
    id: MOCK_PLAYER_ID_3,
    name: "P3",
    player_id: MOCK_PLAYER_ID_3,
    match_id: "m",
    order: 3,
    avatar: "a.png",
    birthday: new Date(),
  },
  {
    id: MOCK_PLAYER_ID_4,
    name: "P4",
    player_id: MOCK_PLAYER_ID_4,
    match_id: "m",
    order: 4,
    avatar: "a.png",
    birthday: new Date(),
  },
  {
    id: MOCK_PLAYER_ID_5,
    name: "P5",
    player_id: MOCK_PLAYER_ID_5,
    match_id: "m",
    order: 5,
    avatar: "a.png",
    birthday: new Date(),
  },
  {
    id: MOCK_PLAYER_ID_6,
    name: "P6",
    player_id: MOCK_PLAYER_ID_6,
    match_id: "m",
    order: 6,
    avatar: "a.png",
    birthday: new Date(),
  },
] as unknown as GamePlayer[];

const mockSecrets = [
  {
    id: "s1",
    type: "INNOCENT",
    player_id: MOCK_PLAYER_ID_3,
    is_revealed: false,
  },
  {
    id: "s2",
    type: "INNOCENT",
    player_id: MOCK_PLAYER_ID_3,
    is_revealed: false,
  },
  {
    id: "s3",
    type: "MURDERER",
    player_id: MOCK_PLAYER_ID_4,
    is_revealed: false,
  },
] as unknown as GameSecret[];

const mockSets = [
  {
    id: "set1",
    type: "SET_TYPE",
    player_id: MOCK_PLAYER_ID_2,
    quin_play: false,
  },
  {
    id: "set2",
    type: "SET_TYPE",
    player_id: MOCK_PLAYER_ID_2,
    quin_play: false,
  },
  {
    id: "set3",
    type: "SET_TYPE",
    player_id: MOCK_PLAYER_ID_5,
    quin_play: false,
  },
] as unknown as MatchSet[];

describe("getGridPositionsForPlayerCount", () => {
  it("should return correct positions for 2 players (1 visible player)", () => {
    expect(getGridPositionsForPlayerCount(2)).toEqual([
      "col-start-2 row-start-1",
    ]);
  });

  it("should return correct positions for 3 players (2 visible players)", () => {
    expect(getGridPositionsForPlayerCount(3)).toEqual([
      "col-start-2 row-start-1",
      "col-start-3 row-start-2",
    ]);
  });

  it("should return correct positions for 4 players (3 visible players)", () => {
    expect(getGridPositionsForPlayerCount(4)).toEqual([
      "col-start-2 row-start-1",
      "col-start-1 row-start-2",
      "col-start-3 row-start-2",
    ]);
  });

  it("should return correct positions for 5 players (4 visible players)", () => {
    expect(getGridPositionsForPlayerCount(5)).toEqual([
      "col-start-2 row-start-1",
      "col-start-3 row-start-1",
      "col-start-1 row-start-2",
      "col-start-3 row-start-2",
    ]);
  });

  it("should return correct positions for 6 players (5 visible players)", () => {
    expect(getGridPositionsForPlayerCount(6)).toEqual([
      "col-start-1 row-start-1",
      "col-start-2 row-start-1",
      "col-start-3 row-start-1",
      "col-start-1 row-start-2",
      "col-start-3 row-start-2",
    ]);
  });

  it("should return an empty array for 1 player (0 visible players)", () => {
    expect(getGridPositionsForPlayerCount(1)).toEqual([]);
  });

  it("should return an empty array for more than 6 players", () => {
    expect(getGridPositionsForPlayerCount(7)).toEqual([]);
  });
});

describe("getVisiblePlayersWithGridPositions", () => {
  it("should exclude the current player and correctly sort visible players by 'order'", () => {
    // Caso de prueba con 4 jugadores totales (3 visibles: P2, P3, P4)
    const players4 = mockAllPlayers.slice(0, 4);

    const result = getVisiblePlayersWithGridPositions(
      mockCurrentPlayer,
      players4,
      mockMatch,
      mockSecrets,
      mockSets,
    );

    expect(result).toHaveLength(3);
    // Verificar orden: P2 (order 2), P3 (order 3), P4 (order 4)
    expect(result[0].playerData.name).toBe("P2");
    expect(result[1].playerData.name).toBe("P3");
    expect(result[2].playerData.name).toBe("P4");

    // Verificar que el jugador actual NO está incluido
    expect(result.some((p) => p.playerData.id === MOCK_PLAYER_ID_1)).toBe(
      false,
    );
  });

  it("should correctly assign 'position' based on the total player count", () => {
    // Caso de prueba con 4 jugadores totales (3 visibles)
    const players4 = mockAllPlayers.slice(0, 4);

    const result = getVisiblePlayersWithGridPositions(
      mockCurrentPlayer,
      players4,
      mockMatch,
      mockSecrets,
      mockSets,
    );

    // Esperamos las posiciones para `count=4`:
    // ["col-start-2 row-start-1", "col-start-1 row-start-2", "col-start-3 row-start-2"]

    expect(result[0].position).toBe("col-start-2 row-start-1"); // P2
    expect(result[1].position).toBe("col-start-1 row-start-2"); // P3
    expect(result[2].position).toBe("col-start-3 row-start-2"); // P4
  });

  it("should correctly assign 'turn' based on match.current_player_order", () => {
    // Caso de prueba con 4 jugadores totales (Turno del Player 3, order: 3)
    const players4 = mockAllPlayers.slice(0, 4);

    const result = getVisiblePlayersWithGridPositions(
      mockCurrentPlayer,
      players4,
      mockMatch, // current_player_order = 3
      mockSecrets,
      mockSets,
    );

    // P2 (order 2): NO es turno
    expect(result[0].turn).toBe(false);
    // P3 (order 3): SÍ es turno
    expect(result[1].turn).toBe(true);
    // P4 (order 4): NO es turno
    expect(result[2].turn).toBe(false);
  });

  it("should correctly filter and attach 'secrets' and 'sets' to the corresponding player", () => {
    // Caso de prueba con 5 jugadores totales (P2, P3, P4, P5 visibles)
    const players5 = mockAllPlayers.slice(0, 5);

    const result = getVisiblePlayersWithGridPositions(
      mockCurrentPlayer,
      players5,
      mockMatch,
      mockSecrets,
      mockSets,
    );

    // P2 tiene 2 sets (set1, set2)
    expect(result[0].playerData.name).toBe("P2");
    expect(result[0].playerSecrets).toHaveLength(0);
    expect(result[0].playerSets).toHaveLength(2);

    // P3 tiene 2 secretos (s1, s2)
    expect(result[1].playerData.name).toBe("P3");
    expect(result[1].playerSecrets).toHaveLength(2);
    expect(result[1].playerSets).toHaveLength(0);

    // P4 tiene 1 secreto (s3)
    expect(result[2].playerData.name).toBe("P4");
    expect(result[2].playerSecrets).toHaveLength(1);
    expect(result[2].playerSets).toHaveLength(0);

    // P5 tiene 1 set (set3)
    expect(result[3].playerData.name).toBe("P5");
    expect(result[3].playerSecrets).toHaveLength(0);
    expect(result[3].playerSets).toHaveLength(1);
  });
});
