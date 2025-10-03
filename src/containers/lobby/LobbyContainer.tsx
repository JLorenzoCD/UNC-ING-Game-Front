import { useEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router";
import { useHttpService } from "@/contexts/HttpServiceContext";
import { useWebSocketService } from "@/contexts/WebSocketServiceContext";
import { usePlayer } from "@/contexts/PlayerContext";

import LobbyLayout from "./components/LobbyLayout";
import PlayerCard, { EmptyPlayerPosition } from "./components/PlayerCard";

import { BACKEND_SOCKETS_EVENTS } from "@/constants/backend";
import { FRONTEND_PATHS } from "@/constants/frontend";

import { isUUID } from "@/utils";
import { fillAndShufflePlayers } from "./utils";

import type { UUID } from "@/types/common";
import type { Player } from "@/types/player";
import type { Match, MatchWithPlayerCount } from "@/types/match";

export default function LobbyContainer() {
  const navigate = useNavigate();

  const { player } = usePlayer();
  const { matchId } = useParams();

  const { httpService } = useHttpService();
  const { wsService, isConnected } = useWebSocketService();

  const [match, setMatch] = useState<MatchWithPlayerCount | null>(null);
  const matchRef = useRef<MatchWithPlayerCount | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    matchRef.current = match;
  }, [match]);

  useEffect(() => {
    setMatch((prev) => {
      if (prev === null) return null;

      return {
        ...prev,
        current_player_count: players.length,
      };
    });
  }, [players]);

  useEffect(() => {
    if (httpService == null || wsService == null || !matchId) return;

    const handleLobbyJoin = (newPlayer: Player) => {
      setPlayers((prev) => {
        const exist = prev.some((p) => p.id === newPlayer.id);

        if (exist) {
          return prev;
        }
        return [...prev, newPlayer];
      });
    };

    const handleMatchStart = async (
      updateMatch: MatchWithPlayerCount | { status: Match },
    ) => {
      const currentMatch = matchRef.current;

      if (currentMatch == null) {
        return;
      }

      if ("id" in updateMatch) {
        if (
          updateMatch.id === matchId &&
          updateMatch.status.toLocaleUpperCase() === "IN_PROGRESS"
        ) {
          navigate(FRONTEND_PATHS.MATCH_GAME(matchId));
        } else if (
          updateMatch.id === matchId &&
          updateMatch.status.toLocaleUpperCase() === "WAITING" &&
          currentMatch.current_player_count < updateMatch.current_player_count
        ) {
          try {
            const updatePlayers = await httpService?.getMatchPlayers(matchId);
            if (updatePlayers == null) throw new Error("No could fetch data.");

            setPlayers(updatePlayers);
          } catch (err) {
            console.error(err);
          }
        }
      } else if (
        updateMatch.status.status.toLocaleUpperCase() === "IN_PROGRESS"
      )
        navigate(FRONTEND_PATHS.MATCH_GAME(matchId));
    };

    const init = async () => {
      setLoading(true);

      try {
        // Se obtienen los datos mediante httpService
        const [match, players] = await Promise.all([
          httpService.getMatch(matchId as UUID),
          httpService.getMatchPlayers(matchId as UUID),
        ]);

        setMatch(match);
        setPlayers(players);

        if (isConnected) {
          wsService.on(BACKEND_SOCKETS_EVENTS.LOBBY_JOIN, handleLobbyJoin);
          wsService.on(BACKEND_SOCKETS_EVENTS.MATCHES, handleMatchStart);
        }
      } catch (err) {
        console.error(err);
        setError(true);

        alert("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      wsService.off(BACKEND_SOCKETS_EVENTS.LOBBY_JOIN, handleLobbyJoin);
      wsService.off(BACKEND_SOCKETS_EVENTS.MATCHES, handleMatchStart);
    };
  }, [httpService, wsService, isConnected, navigate, matchId]);

  if (player === null || matchId === undefined || !isUUID(matchId)) {
    return null;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || match == null) {
    return <p>Fatal error!!</p>;
  }

  const playersToView = fillAndShufflePlayers(players, match.max_players);

  async function startGame(matchId: UUID) {
    if (
      httpService === null ||
      player === null ||
      match === null ||
      match.current_player_count < match.min_players ||
      match.owner_id !== player.id
    )
      return;

    try {
      const result = await httpService.startMatch(matchId);

      if (result.status) {
        navigate(FRONTEND_PATHS.MATCH_GAME(matchId));
      } else {
        throw new Error("Unexpected response at the start of the game.");
      }
    } catch (err) {
      console.error(err);
      alert("The game could not be started.");
    }
  }

  return (
    <LobbyLayout
      match={match}
      startGame={() => startGame(match.id)}
      isOwner={player.id == match.owner_id}
    >
      {playersToView.map((p) =>
        p === null ? (
          <EmptyPlayerPosition key={Math.random()} />
        ) : (
          <PlayerCard
            key={p.id}
            player={p}
            isMe={p.id === player.id}
            isOwner={p.id === match.owner_id}
          />
        ),
      )}
    </LobbyLayout>
  );
}
