import { describe, it, expect } from "vitest";

import type { Player } from "@/types/player";
import type { MatchWithPlayerCount } from "@/types/match";
import type { UUID } from "@/types/common";

import { lobbyReducer, type LobbyState } from "./lobbyReducer";

const MOCK_MATCH_ID = "match-id" as UUID;
const MOCK_PLAYER_1_ID = "player-1-id" as UUID;
const MOCK_PLAYER_2_ID = "player-2-id" as UUID;

const initialMatch: MatchWithPlayerCount = {
  id: MOCK_MATCH_ID,
  name: "Test Lobby",
  status: "WAITING",
  min_players: 2,
  max_players: 4,
  owner_id: MOCK_PLAYER_1_ID,
  current_player_count: 2,
  current_player_order: 0,
};

const initialPlayers = [
  { id: MOCK_PLAYER_1_ID, name: "Player 1" },
  { id: MOCK_PLAYER_2_ID, name: "Player 2" },
] as Player[];

const initialState: LobbyState = {
  match: initialMatch,
  players: initialPlayers,
  loading: false,
  error: false,
};

describe("lobbyReducer", () => {
  it("should handle FETCH_START correctly", () => {
    const newState = lobbyReducer(initialState, { type: "FETCH_START" });

    expect(newState.loading).toBe(true);
    expect(newState.error).toBe(false);
  });

  it("should handle FETCH_SUCCESS correctly and update player count", () => {
    const newMatchData = { ...initialMatch, current_player_count: 5 };
    const newPlayers = [
      ...initialPlayers,
      { id: "p3" as UUID, name: "Player 3" },
    ] as Player[];

    const newState = lobbyReducer(initialState, {
      type: "FETCH_SUCCESS",
      payload: { match: newMatchData, players: newPlayers },
    });

    expect(newState.loading).toBe(false);
    expect(newState.match).toEqual({
      ...newMatchData,
      current_player_count: newPlayers.length, // El reducer debe corregir el conteo
    });
    expect(newState.players).toEqual(newPlayers);
  });

  it("should handle FETCH_ERROR correctly", () => {
    const newState = lobbyReducer(initialState, { type: "FETCH_ERROR" });

    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(true);
  });

  it("should handle PLAYER_JOINED when player is new", () => {
    const newPlayer = { id: "p3" as UUID, name: "Player 3" } as Player;
    const newState = lobbyReducer(initialState, {
      type: "PLAYER_JOINED",
      payload: newPlayer,
    });

    expect(newState.players.length).toBe(3);
    expect(newState.players).toContainEqual(newPlayer);
  });

  it("should not add player on PLAYER_JOINED if player already exists", () => {
    const existingPlayer: Player = initialPlayers[0];
    const newState = lobbyReducer(initialState, {
      type: "PLAYER_JOINED",
      payload: existingPlayer,
    });

    expect(newState.players.length).toBe(2);
    expect(newState.players).toEqual(initialPlayers);
  });

  it("should handle PLAYERS_UPDATED and update player count in match", () => {
    const updatedPlayers = [
      ...initialPlayers,
      { id: "p3" as UUID, name: "Player 3" },
      { id: "p4" as UUID, name: "Player 4" },
    ] as Player[];
    const newState = lobbyReducer(initialState, {
      type: "PLAYERS_UPDATED",
      payload: updatedPlayers,
    });

    expect(newState.players).toEqual(updatedPlayers);
    expect(newState.match!.current_player_count).toBe(4);
  });

  it("should handle UPDATE_MATCH and preserve current player count", () => {
    const updatedMatch: MatchWithPlayerCount = {
      ...initialMatch,
      status: "IN_PROGRESS",
      current_player_count: 99, // Un valor incorrecto que debería ser ignorado
    };

    const newState = lobbyReducer(initialState, {
      type: "UPDATE_MATCH",
      payload: updatedMatch,
    });

    // El match se actualiza, pero el conteo de jugadores se mantiene basado en el state.players
    expect(newState.match!.status).toBe("IN_PROGRESS");
    expect(newState.match!.current_player_count).toBe(
      initialState.players.length,
    );
  });
});
