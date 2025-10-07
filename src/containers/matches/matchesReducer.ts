import type { MatchWithPlayerCount } from "@/types/match";

export interface MatchesState {
  matches: MatchWithPlayerCount[];
  loading: boolean;
  error: boolean;
}

export type MatchesAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: MatchWithPlayerCount[] }
  | { type: "FETCH_ERROR" }
  | { type: "AVAILABLE_MATCH_UPDATE"; payload: MatchWithPlayerCount };

export const initialMatchesState: MatchesState = {
  matches: [],
  loading: true,
  error: false,
};

export function matchesReducer(
  state: MatchesState,
  action: MatchesAction,
): MatchesState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: false };

    case "FETCH_SUCCESS":
      return {
        ...state,
        matches: action.payload,
        loading: false,
        error: false,
      };

    case "FETCH_ERROR":
      return { ...state, loading: false, error: true };

    case "AVAILABLE_MATCH_UPDATE": {
      let eventMatch = action.payload;

      // Por el problema del mensaje que envía el server al evento "MATCH"
      if (!("id" in eventMatch)) {
        eventMatch = (eventMatch as any).status as MatchWithPlayerCount;
      }

      const exists = state.matches.find((match) => match.id === eventMatch.id);
      const matchStatus = eventMatch.status.toLocaleUpperCase();

      if (exists) {
        if (matchStatus !== "WAITING") {
          // Si el match existe y ya no está en 'WAITING', se elimina de la lista
          return {
            ...state,
            matches: state.matches.filter((match) => match.id !== exists.id),
          };
        } else {
          // Si el match existe y sigue en 'WAITING', se actualiza
          return {
            ...state,
            matches: state.matches.map((match) =>
              match.id === eventMatch.id ? eventMatch : match,
            ),
          };
        }
      } else if (matchStatus === "WAITING") {
        // Si no existe y su estado es 'WAITING', se añade a la lista
        return { ...state, matches: [...state.matches, eventMatch] };
      }

      return state;
    }

    default:
      return state;
  }
}
