import type { MatchWithPlayerCount } from "@/types/match";
import type { Player } from "@/types/player";

export interface LobbyState {
  match: MatchWithPlayerCount | null;
  players: Player[];
  loading: boolean;
  error: boolean;
}

export type LobbyAction =
  | { type: "FETCH_START" }
  | {
      type: "FETCH_SUCCESS";
      payload: { match: MatchWithPlayerCount; players: Player[] };
    }
  | { type: "FETCH_ERROR" }
  | { type: "PLAYER_JOINED"; payload: Player }
  | { type: "PLAYERS_UPDATED"; payload: Player[] }
  | { type: "UPDATE_MATCH"; payload: MatchWithPlayerCount };

export function lobbyReducer(
  state: LobbyState,
  action: LobbyAction,
): LobbyState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: false };

    case "FETCH_SUCCESS": {
      const updateMatch = {
        ...action.payload.match,
        current_player_count: action.payload.players.length,
      } as MatchWithPlayerCount;

      return {
        ...state,
        match: updateMatch,
        players: action.payload.players,
        loading: false,
      };
    }

    case "FETCH_ERROR":
      return { ...state, loading: false, error: true };

    case "PLAYER_JOINED":
      if (state.players.some((p) => p.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        players: [...state.players, action.payload],
      };

    case "PLAYERS_UPDATED": {
      const matchWithNewCount = state.match
        ? {
            ...state.match,
            current_player_count: action.payload.length,
          }
        : null;

      return {
        ...state,
        match: matchWithNewCount,
        players: action.payload,
      };
    }

    case "UPDATE_MATCH": {
      const matchWithCorrectCount = {
        ...action.payload,
        current_player_count: state.players.length,
      };
      return {
        ...state,
        match: matchWithCorrectCount,
      };
    }

    default:
      return state;
  }
}
