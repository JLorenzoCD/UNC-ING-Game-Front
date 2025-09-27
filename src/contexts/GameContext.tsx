import { createContext, useCallback, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

import type { Match } from "@/types/match";
import type { GameCard } from "@/types/card";
import type { GameSecret } from "@/types/secret";
import type { GamePlayer } from "@/types/player";

import { useParams } from "react-router";
import { useHttpService } from "./HttpServiceContext";

export interface GameContextType {
  match: Match | null;
  setMatch: Dispatch<SetStateAction<Match | null>>;

  cards: GameCard[];
  setCards: Dispatch<SetStateAction<GameCard[]>>;

  secrets: GameSecret[];
  setSecrets: Dispatch<SetStateAction<GameSecret[]>>;

  players: GamePlayer[];
  setPlayers: Dispatch<SetStateAction<GamePlayer[]>>;
}

const GameContext = createContext<GameContextType>({
  match: null,
  setMatch: () => {},

  cards: [],
  setCards: () => {},

  secrets: [],
  setSecrets: () => {},

  players: [],
  setPlayers: () => {},
})

export interface GameContextProviderProps {
  children: ReactNode;
}

export default function GameContextProvider({ children }: GameContextProviderProps) {
  const { httpService } = useHttpService();

  const params = useParams();
  const matchId = params.matchId;

  const [match, setMatch] = useState<Match | null>(null);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [secrets, setSecrets] = useState<GameSecret[]>([]);
  const [players, setPlayers] = useState<GamePlayer[]>([]);

  const fetchMatchData = useCallback(async () => {
    // Si no tenemos el id de la partida o el servicio HTTP, no hacemos nada.
    if (!matchId || !httpService) return;

    const [match, cards, secrets, players] = await Promise.all([
      httpService.getMatch(matchId),
      httpService.getMatchCards(matchId),
      httpService.getMatchSecrets(matchId),
      httpService.getMatchPlayers(matchId),
    ])

    setMatch(match);
    setCards(cards);
    setSecrets(secrets);
    setPlayers(players);
  }, [httpService, matchId]);

  useEffect(() => {
    fetchMatchData();
  }, [fetchMatchData])

  const contextValue: GameContextType = {
    match,
    setMatch,

    cards,
    setCards,

    secrets,
    setSecrets,

    players,
    setPlayers,
  }

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used within a GameContextProvider");
  }

  return context;
}