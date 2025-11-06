import { useNavigate } from "react-router";
import { usePlayer } from "@/contexts/PlayerContext";
import { toast } from "sonner";
import Button from "@/components/Button";

import { FRONTEND_PATHS } from "@/constants/frontend";

import { isValidMatch } from "../utils";

import type { UUID } from "@/types/common";
import type { MatchWithPlayerCount } from "@/types/match";
import { isUUID } from "@/utils";

interface MatchListItemProps {
  match: MatchWithPlayerCount;
  joinMatch: (
    playerId: UUID,
    matchId: UUID,
  ) => Promise<{
    match_id: UUID;
  }>;
}

export default function MatchListItem({
  match,
  joinMatch,
}: MatchListItemProps) {
  const navigate = useNavigate();

  const { player } = usePlayer();

  if (!isValidMatch(match)) return null;

  const name =
    match.name.length < 35 ? match.name : match.name.substring(0, 32) + "...";

  const handleClick = async () => {
    if (!player) {
      alert("You must create a player before joining a match.");

      return;
    }

    try {
      const result = await joinMatch(player.id, match.id);

      if (result && isUUID(result.match_id)) {
        toast.info("You successfully joined the match.");

        navigate(FRONTEND_PATHS.MATCH_LOBBY(result.match_id));
      } else {
        toast.error("Couldn't join the match, try another one.");
      }
    } catch (err) {
      console.error(err);

      alert(
        `There was a problem joining game "${match.name}", please try again later.`,
      );
    }
  };

  return (
    <li
      data-testid="match-list-item"
      className="flex justify-between items-center p-3 bg-white mb-2 rounded-xl border"
    >
      <p>{name}</p>

      <span className="flex gap-5 items-center">
        <p>
          {match.min_players}/{match.max_players}
        </p>
        <p>-</p>
        <p>
          {match.current_player_count >= match.min_players ? "🟢" : "🟡"}{" "}
          {match.current_player_count}
        </p>

        <Button className="ml-5" onClick={handleClick}>
          Join
        </Button>
      </span>
    </li>
  );
}
