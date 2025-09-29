import { useNavigate } from "react-router";
import { usePlayer } from "@/contexts/PlayerContext";

import Button from "@/components/Button";

import { FRONTEND_PATHS } from "@/constants/frontendPaths";

import { isValidMatch } from "./utils";

import type { UUID } from "@/types/common";
import type { MatchListItem } from "@/types/match";

interface Props {
  match: MatchListItem;
  joinMatch: (
    playerId: UUID,
    matchId: UUID,
  ) => Promise<{
    match_id: UUID;
  }>;
}

function ListItemMatch({ match, joinMatch }: Props) {
  const navigate = useNavigate();

  const { player } = usePlayer();
  if (player === null) throw new Error("No Player.");
  const playerId = player.id;

  if (!isValidMatch(match)) return null;

  const name =
    match.name.length < 35 ? match.name : match.name.substring(0, 32) + "...";

  async function handleClick() {
    try {
      const res = await joinMatch(playerId, match.id);
      if (res) {
        alert("You successfully joined the match.");
        navigate(FRONTEND_PATHS.MATCH_LOBBY(res.match_id));
      } else {
        alert("Couldn't join the match, try another one.");
      }
    } catch (err) {
      console.error(err);
      alert(
        `There was a problem joining game "${match.name}", please try again later.`,
      );
    }
  }

  return (
    <li className="flex justify-between items-center p-3 bg-white mb-2 rounded-xl border">
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

export default ListItemMatch;
