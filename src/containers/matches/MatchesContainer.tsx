import { useMatchesData } from "./useMatchesData";
import { useHttpService } from "@/contexts/HttpServiceContext";

import { Link } from "react-router";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import MatchList from "./components/MatchList";
import MatchListItem from "./components/MatchListItem";

import { FRONTEND_PATHS } from "@/constants/frontend";

import type { UUID } from "@/types/common";

export default function MatchesContainer() {
  const { httpService } = useHttpService();
  const { matches, ongoingMatches, loading } = useMatchesData();

  if (loading) {
    return <Loading />;
  }

  if (httpService === null) {
    return <p>No connection to the server.</p>;
  }

  const joinMatchAgain = async (_: UUID, matchId: UUID) => {
    // TODO: Se podría hacer un método HTTP que verifique que el jugador esta
    // TODO: dentro del match.

    return {
      match_id: matchId,
    };
  };

  return (
    <div data-testid="matches-container">
      <Link
        to={FRONTEND_PATHS.MATCH_CREATE}
        className="block mx-auto w-60 mb-5"
      >
        <Button className="w-full">Create match</Button>
      </Link>

      <div className="overflow-y-auto h-screen max-h-[75vh]">
        {ongoingMatches.length ? (
          <MatchList
            title="List of matches you are involved in"
            emptyText="You have not entered any game"
            type="ONGOING_MATCH"
            isLoading={loading}
          >
            {ongoingMatches.map((match) => (
              <MatchListItem
                key={match.id}
                match={match}
                matchStatusValid={["IN_PROGRESS", "WAITING"]}
                joinMatch={joinMatchAgain}
              />
            ))}
          </MatchList>
        ) : null}

        <MatchList
          title="List of matches"
          emptyText="There are no games available, why don't you create one?"
          isLoading={loading}
        >
          {matches.map((match) => (
            <MatchListItem
              key={match.id}
              match={match}
              joinMatch={httpService.joinMatch}
            />
          ))}
        </MatchList>
      </div>
    </div>
  );
}
