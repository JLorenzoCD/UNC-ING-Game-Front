import { useEffect, useReducer, useRef } from "react";
import { useNavigate } from "react-router";
import { lobbyReducer, type LobbyState } from "./lobbyReducer";

import { useHttpService } from "@/contexts/HttpServiceContext";
import { useWebSocketService } from "@/contexts/WebSocketServiceContext";

import { BACKEND_SOCKETS_EVENTS } from "@/constants/backend";
import { FRONTEND_PATHS } from "@/constants/frontend";

import type { UUID } from "@/types/common";
import type { Player } from "@/types/player";
import type { Match, MatchWithPlayerCount } from "@/types/match";

const initialState: LobbyState = {
  match: null,
  players: [],
  loading: false,
  error: false,
};

export function useLobbyData(matchId: UUID | null) {
  const navigate = useNavigate();

  const { httpService } = useHttpService();
  const { wsService, isConnected } = useWebSocketService();

  const [state, dispatch] = useReducer(lobbyReducer, initialState);

  // Para evitar que el useEffect se ponga loco por las referencias del
  // state.match que se debería de utilizar para validación
  const matchRef = useRef(state.match);

  useEffect(() => {
    matchRef.current = state.match;
  }, [state.match]);

  useEffect(() => {
    if (httpService == null || wsService == null || matchId == null) return;

    const handleLobbyJoin = (newPlayer: Player) => {
      dispatch({ type: "PLAYER_JOINED", payload: newPlayer });
    };

    const handleMatchStart = async (
      updateMatch: MatchWithPlayerCount | { status: Match },
    ) => {
      // Manejo del inicio de la partida
      let statusString = "";
      if ("id" in updateMatch) {
        statusString = updateMatch.status.toLocaleUpperCase();
      } else {
        statusString = updateMatch.status.status.toLocaleUpperCase();
      }

      if (statusString === "IN_PROGRESS") {
        navigate(FRONTEND_PATHS.MATCH_GAME(matchId));
        return;
      }

      // Manejo de la actualización de match y jugadores
      const currMatch = matchRef.current;
      if (
        "id" in updateMatch &&
        updateMatch.id === matchId &&
        updateMatch.status.toLocaleUpperCase() === "WAITING" &&
        currMatch &&
        currMatch.current_player_count < updateMatch.current_player_count
      ) {
        try {
          // Si la cantidad de jugadores actuales cambia, volvemos a obtener la
          // lista de jugadores actualizada
          const updatePlayers = await httpService.getMatchPlayers(matchId);
          if (updatePlayers == null) throw new Error("No could fetch data.");

          dispatch({ type: "PLAYERS_UPDATED", payload: updatePlayers });
        } catch (err) {
          console.error(err);
        }
      }
    };

    const init = async () => {
      dispatch({ type: "FETCH_START" });

      try {
        const [match, players] = await Promise.all([
          httpService.getMatch(matchId),
          httpService.getMatchPlayers(matchId),
        ]);

        dispatch({ type: "FETCH_SUCCESS", payload: { match, players } });

        if (isConnected) {
          wsService.on(BACKEND_SOCKETS_EVENTS.LOBBY_JOIN, handleLobbyJoin);
          wsService.on(BACKEND_SOCKETS_EVENTS.MATCHES, handleMatchStart);
        }
      } catch (err) {
        console.error(err);

        dispatch({ type: "FETCH_ERROR" });
        alert("Could not connect to the server.");
      }
    };

    init();

    // Cleanup de WebSockets
    return () => {
      wsService.off(BACKEND_SOCKETS_EVENTS.LOBBY_JOIN, handleLobbyJoin);
      wsService.off(BACKEND_SOCKETS_EVENTS.MATCHES, handleMatchStart);
    };
    // ! DUDAS: state.match
  }, [httpService, wsService, isConnected, navigate, matchId]);

  return state;
}
