import { useNavigate, useParams } from "react-router";
import { useLobbyData } from "./useLobbyData";

import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import Loading from "@/components/Loading";
import LobbyLayout from "./components/LobbyLayout";
import PlayerCard, { EmptyPlayerPosition } from "./components/PlayerCard";

import { FRONTEND_PATHS } from "@/constants/frontend";

import { isUUID } from "@/utils";
import { fillAndShufflePlayers } from "./utils";
import { handleApiError } from "@/utils/errorHandler";

import type { UUID } from "@/types/common";
import { toast } from "sonner";

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
    return <Loading />;
  }

  if (error || match == null) {
    return <p>Fatal error!!</p>;
  }

  const playersToView = fillAndShufflePlayers(players, match.max_players);

  async function startGame() {
    if (httpService === null || player === null || match === null) return;

    if (
      match.current_player_count < match.min_players ||
      match.owner_id !== player.id ||
      match.status.toLocaleUpperCase() !== "WAITING"
    ) {
      toast.error(
        "The game cannot be started if the minimum number of players desired is not reached.",
      );

      return;
    }

    try {
      const result = await httpService.startMatch(matchId as UUID);

      if (result.status) {
        navigate(FRONTEND_PATHS.MATCH_GAME(matchId as UUID));
      } else {
        throw new Error("Unexpected response at the start of the game.");
      }
    } catch (err) {
      handleApiError(err, "The game could not be started");
    }
  }

  async function cancelGame() {
    if (
      httpService === null ||
      player === null ||
      match === null ||
      match.owner_id !== player.id
    )
      return;

    try {
      await httpService.cancelMatch(match.id, player.id);

      navigate(FRONTEND_PATHS.MATCH_LIST);
    } catch (error) {
      handleApiError(error, "The game could not be canceled");
    }
  }

  async function quitGame() {
    if (httpService === null || player === null || match === null) return;

    try {
      const result = await httpService.quitMatch(player.id, match.id);

      if (result.status) {
        navigate(FRONTEND_PATHS.MATCH_LIST);
      } else {
        throw new Error("Unexpected response at quitting the match.");
      }
    } catch (err) {
      handleApiError(err, "Could not quit the match");
    }
  }

  return (
    <LobbyLayout
      match={match}
      quitGame={quitGame}
      startGame={startGame}
      cancelGame={cancelGame}
      isOwner={player.id === match.owner_id}
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
