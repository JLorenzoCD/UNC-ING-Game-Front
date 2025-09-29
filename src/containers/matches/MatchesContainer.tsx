import { useEffect, useState } from "react";

import { Link } from "react-router";
import Button from "@/components/Button";
import ListMatches from "./components/ListMatches";
import ListItemMatch from "./components/ListItemMatch";

import { useHttpService } from "@/contexts/HttpServiceContext";
import { useWebSocketService } from "@/contexts/WebSocketServiceContext";

import { FRONTEND_PATHS } from "@/constants/frontendPaths";
import { BACKEND_SOCKETS_EVENTS } from "@/constants/backend";

import type { MatchListItem } from "@/types/match";

interface WSError extends Error {
  showUser: boolean;
}

function MatchesContainer() {
  const { httpService } = useHttpService();
  const { wsService, isConnected } = useWebSocketService();

  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (httpService == null || wsService == null) return;

    const handleMatchEvents = (eventMatch: MatchListItem) => {
      setMatches((prev) => {
        let newMatchesState: MatchListItem[] | null = null;
        const exists = prev.find((match) => match.id === eventMatch.id);

        if (!exists && eventMatch.status === "WAITING") {
          newMatchesState = [...prev, eventMatch]; // Add
        } else if (exists && eventMatch.status != "WAITING") {
          newMatchesState = prev.filter((match) => match.id !== exists.id); // remove
        } else {
          newMatchesState = prev.map((match) =>
            match.id === eventMatch.id ? { ...match, ...eventMatch } : match,
          ); // update
        }

        return newMatchesState;
      });
    };

    const init = async () => {
      try {
        // Se obtienen los datos mediante http
        setLoading(true);
        const matches = await httpService.getMatches();
        setMatches(matches);

        if (isConnected) {
          wsService.on(BACKEND_SOCKETS_EVENTS.MATCHES, handleMatchEvents);
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
      wsService.off(BACKEND_SOCKETS_EVENTS.MATCHES, handleMatchEvents);
    };
  }, [httpService, wsService, isConnected]);

  return (
    <>
      <Link
        to={FRONTEND_PATHS.MATCH_CREATE}
        className="block mx-auto w-60 my-5"
      >
        <Button className="w-full">Create match</Button>
      </Link>
      {httpService != null && (
        <ListMatches isLoading={loading}>
          {matches.map((m) => (
            <ListItemMatch key={m.id} match={m} />
          ))}
        </ListMatches>
      )}
    </>
  );
}

export default MatchesContainer;
