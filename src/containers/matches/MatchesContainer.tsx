import { useEffect, useState } from "react";
import { Link } from "react-router";

import type { MatchWithPlayerCount } from "@/types/match";
import { useHttpService } from "@/contexts/HttpServiceContext";
import { useWebSocketService } from "@/contexts/WebSocketServiceContext";

import Button from "@/components/Button";

import { FRONTEND_PATHS } from "@/constants/frontend";
import { BACKEND_SOCKETS_EVENTS } from "@/constants/backend";

import MatchList from "./components/MatchList";
import MatchListItem from "./components/MatchListItem";

interface WSError extends Error {
  showUser: boolean;
}

export default function MatchesContainer() {
  const { httpService } = useHttpService();
  const { wsService, isConnected } = useWebSocketService();

  const [matches, setMatches] = useState<MatchWithPlayerCount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleMatchEvents = (eventMatch: MatchWithPlayerCount) => {
    setMatches((prev) => {
      let newMatchesState: MatchWithPlayerCount[] | null = null;

      const exists = prev.find((match) => match.id === eventMatch.id);
      const matchStatus = eventMatch.status.toLocaleUpperCase();

      if (!exists && matchStatus === "WAITING") {
        newMatchesState = [...prev, eventMatch]; // Add
      } else if (exists && matchStatus !== "WAITING") {
        newMatchesState = prev.filter((match) => match.id !== exists.id); // Remove
      } else {
        newMatchesState = prev.map((match) =>
          match.id === eventMatch.id ? { ...match, ...eventMatch } : match,
        ); // update
      }

      return newMatchesState;
    });
  };

  useEffect(() => {
    if (httpService === null || wsService === null || !isConnected) return;

    const init = async () => {
      try {
        // Se obtienen los datos mediante http
        setIsLoading(true);

        const matches = await httpService.getMatches();
        const filteredMatches = matches.filter(
          (match) => match.status.toLocaleUpperCase() === "WAITING",
        );

        setMatches(filteredMatches);

        wsService.on(BACKEND_SOCKETS_EVENTS.MATCHES, handleMatchEvents);
      } catch (err) {
        console.error(err);

        const error = err as Error;

        if ((error as WSError).showUser) {
          alert(error.message);
        } else {
          alert("Could not connect to the server.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      wsService.off(BACKEND_SOCKETS_EVENTS.MATCHES, handleMatchEvents);
    };
  }, [httpService, wsService, isConnected]);

  return (
    <div data-testid="matches-container">
      <Link
        to={FRONTEND_PATHS.MATCH_CREATE}
        className="block mx-auto w-60 my-5"
      >
        <Button className="w-full">Create match</Button>
      </Link>

      {httpService !== null && (
        <MatchList isLoading={isLoading}>
          {matches.map((match) => (
            <MatchListItem
              key={match.id}
              match={match}
              joinMatch={httpService.joinMatch}
            />
          ))}
        </MatchList>
      )}
    </div>
  );
}
