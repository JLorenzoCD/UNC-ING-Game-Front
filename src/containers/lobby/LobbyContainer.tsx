import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router";
import { useHttpService } from "@/contexts/HttpServiceContext";
import { useWebSocketService } from "@/contexts/WebSocketServiceContext";
import { usePlayer } from "@/contexts/PlayerContext";

import LobbyLayout from "./LobbyLayout";
import PlayerCard, { EmptyPlayerPosition } from "./components/PlayerCard";

import { BACKEND_SOCKETS_EVENTS } from "@/constants/backend";
import { FRONTEND_PATHS } from "@/constants/frontendPaths";

import { isUUID } from "@/utils";

import type { UUID } from "@/types/common";
import type { Match } from "@/types/match";
import type { Player } from "@/types/player";

function fillAndShufflePlayers(
  players: Player[],
  max_players: number,
): (Player | null)[] {
  let playersToView: (Player | null)[];

  // Se rellena el arreglo haste tener la maxima cantidad de jugadores deseados
  if (players.length < max_players) {
    const emptySlotsCount = max_players - players.length;
    playersToView = [...players, ...new Array(emptySlotsCount).fill(null)];
  } else {
    playersToView = players;
  }

  // Se mezcla el arreglo para mostrarlo en el lobby de forma random
  playersToView.sort(() => 0.5 - Math.random());

  return playersToView;
}

interface WSError extends Error {
  showUser: boolean;
}

function LobbyContainer() {
  const { player } = usePlayer();
  const { matchId } = useParams();
  if (player === null || matchId === undefined || !isUUID(matchId)) {
    throw new Error("No player.");
  }

  const { httpService } = useHttpService();
  const { wsService, isConnected } = useWebSocketService();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (httpService == null || wsService == null) return;

    const handleLobbyJoin = (updatedPlayer: Partial<Player>) => {
      console.log(updatedPlayer);
    };

    const init = async () => {
      try {
        // Se obtienen los datos mediante httpService
        setLoading(true);
        const data = await Promise.all([
          httpService.getMatch(matchId),
          httpService.getMatchPlayers(matchId),
        ]);
        setMatch(data[0]);
        setPlayers(data[1]);

        if (isConnected) {
          wsService.on(BACKEND_SOCKETS_EVENTS.LOBBY_JOIN, handleLobbyJoin);
        } else {
          const err = new Error(
            "An error occurred while connecting to the server. Matches cannot be updated when adding players or adding new matches.",
          ) as WSError;
          err.showUser = true;
          console.log("error");

          throw err;
        }
      } catch (err) {
        console.error(err);
        const error = err as Error;

        setError(true);

        if ((error as WSError).showUser) {
          alert(error.message);
        } else {
          alert("Could not connect to the server.");
        }
      } finally {
        setLoading(false);
      }
    };

    init();
    return () => {
      wsService.off(BACKEND_SOCKETS_EVENTS.LOBBY_JOIN, handleLobbyJoin);
    };
  }, [httpService, wsService, isConnected, navigate, matchId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || match == null) {
    return <p>Fatal error!!</p>;
  }

  const playersToView = fillAndShufflePlayers(players, match.max_players);

  async function startGame(playerId: UUID, matchId: UUID) {
    try {
      const res = await httpService?.startMatch(playerId, matchId);

      if (res?.status) {
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
      startGame={() => startGame(player.id, match.id)}
      isOwner={player.id == match.owner_id}
      match={match}
    >
      {playersToView.map((p) =>
        p === null ? (
          <EmptyPlayerPosition key={Math.random()} />
        ) : (
          <PlayerCard
            key={p.id}
            player={p}
            isOwner={p.id === match.owner_id}
            isMe={p.id === player.id}
          />
        ),
      )}
    </LobbyLayout>
  );
}

export default LobbyContainer;
