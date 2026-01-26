import { useEffect, useReducer } from "react";
import {
  matchesReducer,
  initialMatchesState,
  type MatchesState,
} from "./matchesReducer";

import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";
import { useWebSocketService } from "@/contexts/WebSocketServiceContext";

import { BACKEND_SOCKETS_EVENTS } from "@/constants/backend";

import type { MatchWithPlayerCount } from "@/types/match";

export function useMatchesData(): MatchesState {
  const { httpService } = useHttpService();
  const { wsService, isConnected } = useWebSocketService();
  const { player } = usePlayer();

  const [state, dispatch] = useReducer(matchesReducer, initialMatchesState);

  useEffect(() => {
    if (
      httpService === null ||
      wsService === null ||
      !isConnected ||
      player == null
    )
      return;

    const handleMatchEvents = (eventMatch: MatchWithPlayerCount) => {
      dispatch({ type: "AVAILABLE_MATCH_UPDATE", payload: eventMatch });
    };

    const handleOngoingMatchEvents = (eventMatch: MatchWithPlayerCount) => {
      dispatch({ type: "AVAILABLE_ONGOING_MATCH_UPDATE", payload: eventMatch });
    };

    const init = async () => {
      dispatch({ type: "FETCH_START" });

      try {
        const matches = await httpService.getMatches();
        const filteredMatches = matches.filter(
          (match) => match.status.toLocaleUpperCase() === "WAITING",
        );

        dispatch({
          type: "FETCH_SUCCESS",
          payload: { matches: filteredMatches, ongointMatches },
        });

        wsService.on(BACKEND_SOCKETS_EVENTS.MATCH, handleMatchEvents);
        wsService.on(
          BACKEND_SOCKETS_EVENTS.ONGOING_MATCH,
          handleOngoingMatchEvents,
        );
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
      wsService.off(
        BACKEND_SOCKETS_EVENTS.ONGOING_MATCH,
        handleOngoingMatchEvents,
      );
    };
  }, [httpService, wsService, isConnected, player]);

  return state;
}
