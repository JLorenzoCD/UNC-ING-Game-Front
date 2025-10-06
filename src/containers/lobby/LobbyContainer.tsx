import { useNavigate, useParams } from "react-router";
import { useLobbyData } from "./useLobbyData";

import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import LobbyLayout from "./components/LobbyLayout";
import PlayerCard, { EmptyPlayerPosition } from "./components/PlayerCard";

import { FRONTEND_PATHS } from "@/constants/frontend";

import { isUUID } from "@/utils";
import { fillAndShufflePlayers } from "./utils";

import type { UUID } from "@/types/common";

export default function LobbyContainer() {
  const navigate = useNavigate();

  const { player } = usePlayer();
  const { matchId } = useParams();

  const { httpService } = useHttpService();

  const { match, players, loading, error } = useLobbyData(
    matchId as UUID | null,
  );

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

  async function startGame() {
    if (
      httpService === null ||
      player === null ||
      match === null ||
      match.current_player_count < match.min_players ||
      match.owner_id !== player.id
    )
      return;

    try {
      const result = await httpService.startMatch(matchId as UUID);

      if (result.status) {
        navigate(FRONTEND_PATHS.MATCH_GAME(matchId as UUID));
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
      startGame={startGame}
      isOwner={player.id == match.owner_id}
    >
      {playersToView.map((p, index) =>
        p === null ? (
          <EmptyPlayerPosition key={`empty-${index}`} />
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
