import type { MatchWithPlayerCount } from "@/types/match";

export interface MatchesState {
  matches: MatchWithPlayerCount[];
  ongoingMatches: MatchWithPlayerCount[];
  loading: boolean;
  error: boolean;
}

export type MatchesAction =
  | { type: "FETCH_START" }
  | {
      type: "FETCH_SUCCESS";
      payload: {
        matches: MatchWithPlayerCount[];
        ongoingMatches: MatchWithPlayerCount[];
      };
    }
  | { type: "FETCH_ERROR" }
  | { type: "AVAILABLE_MATCH_UPDATE"; payload: MatchWithPlayerCount }
  | { type: "AVAILABLE_ONGOING_MATCH_UPDATE"; payload: MatchWithPlayerCount };

export const initialMatchesState: MatchesState = {
  matches: [],
  ongoingMatches: [],
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
        matches: action.payload.matches,
        ongoingMatches: action.payload.ongoingMatches,
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

    case "AVAILABLE_ONGOING_MATCH_UPDATE": {
      const eventMatch = action.payload;

      const exists = state.ongoingMatches.find(
        (match) => match.id === eventMatch.id,
      );
      const matchStatus = eventMatch.status.toLocaleUpperCase();

      if (exists) {
        if (matchStatus === "COMPLETED") {
          // Si el match existe y se cancelo o termino (status === 'COMPLETED'),
          // se lo elimina de la lista de ongoingMatches
          return {
            ...state,
            ongoingMatches: state.ongoingMatches.filter(
              (match) => match.id !== eventMatch.id,
            ),
          };
        } else {
          // Si el match existe y su estatus es diferente de 'COMPLETED', entonces
          // se lo actualiza
          return {
            ...state,
            ongoingMatches: state.ongoingMatches.map((match) =>
              match.id === eventMatch.id ? eventMatch : match,
            ),
          };
        }
      } else if (matchStatus !== "COMPLETED") {
        // Si no existe y su estado es deferente de 'COMPLETED', se añade a la lista
        return {
          ...state,
          ongoingMatches: [...state.ongoingMatches, eventMatch],
        };
      }

      return state;
    }

    default:
      return state;
  }
}
