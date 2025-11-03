import { useMatchesData } from "./useMatchesData";
import { useHttpService } from "@/contexts/HttpServiceContext";

import { Link } from "react-router";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import MatchList from "./components/MatchList";
import MatchListItem from "./components/MatchListItem";

import { FRONTEND_PATHS } from "@/constants/frontend";

export default function MatchesContainer() {
  const { httpService } = useHttpService();
  const { matches, loading } = useMatchesData();

  if (loading) {
    return <Loading />;
  }

  if (httpService === null) {
    return <p>No connection to the server.</p>;
  }

  return (
    <div data-testid="matches-container">
      <Link
        to={FRONTEND_PATHS.MATCH_CREATE}
        className="block mx-auto w-60 my-5"
      >
        <Button className="w-full">Create match</Button>
      </Link>

      <MatchList isLoading={loading}>
        {matches.map((match) => (
          <MatchListItem
            key={match.id}
            match={match}
            joinMatch={httpService.joinMatch}
          />
        ))}
      </MatchList>
    </div>
  );
}
