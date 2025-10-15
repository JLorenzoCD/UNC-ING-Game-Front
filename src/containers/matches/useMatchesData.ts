import { useEffect, useReducer } from "react";
import {
  matchesReducer,
  initialMatchesState,
  type MatchesState,
} from "./matchesReducer";

import { useHttpService } from "@/contexts/HttpServiceContext";
import { useWebSocketService } from "@/contexts/WebSocketServiceContext";

import { BACKEND_SOCKETS_EVENTS } from "@/constants/backend";

import type { MatchWithPlayerCount } from "@/types/match";

export function useMatchesData(): MatchesState {
  const { httpService } = useHttpService();
  const { wsService, isConnected } = useWebSocketService();

  const [state, dispatch] = useReducer(matchesReducer, initialMatchesState);

  useEffect(() => {
    if (httpService === null || wsService === null || !isConnected) return;

    const handleMatchEvents = (eventMatch: MatchWithPlayerCount) => {
      dispatch({ type: "AVAILABLE_MATCH_UPDATE", payload: eventMatch });
    };

    const init = async () => {
      dispatch({ type: "FETCH_START" });

      try {
        const matches = await httpService.getMatches();
        const filteredMatches = matches.filter(
          (match) => match.status.toLocaleUpperCase() === "WAITING",
        );

        dispatch({ type: "FETCH_SUCCESS", payload: filteredMatches });

        wsService.on(BACKEND_SOCKETS_EVENTS.MATCH, handleMatchEvents);
      } catch (err) {
        console.error(err);
        dispatch({ type: "FETCH_ERROR" });
        alert("Could not connect to the server.");
      }
    };

    init();

    // Cleanup de WebSockets
    return () => {
      wsService.off(BACKEND_SOCKETS_EVENTS.MATCH, handleMatchEvents);
    };
  }, [httpService, wsService, isConnected]);

  return state;
}
