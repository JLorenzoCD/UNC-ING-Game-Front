import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useParams } from "react-router";

import { isUUID } from "@/utils";

import type { Match } from "@/types/match";
import type { GameCard } from "@/types/card";
import type { GameSecret, MatchSecret } from "@/types/secret";
import type { GamePlayer } from "@/types/player";
import type { MatchSet } from "@/types/set";

import { useHttpService } from "./HttpServiceContext";
import { useWebSocketService } from "./WebSocketServiceContext";
import { BACKEND_SOCKETS_EVENTS } from "@/constants/backend";

export interface GameContextType {
  match: Match | null;
  cards: GameCard[];
  secrets: GameSecret[];
  players: GamePlayer[];
  sets: MatchSet[];

  isLoading: boolean;
  hasError: boolean;
  error: Error | null;
}

const GameContext = createContext<GameContextType>({
  match: null,
  cards: [],
  secrets: [],
  players: [],
  sets: [],

  isLoading: false,
  hasError: false,
  error: null,
});

export interface GameContextProviderProps {
  children: ReactNode;
}

export default function GameContextProvider({
  children,
}: GameContextProviderProps) {
  const { httpService } = useHttpService();
  const { wsService, isConnected } = useWebSocketService();

  const params = useParams();
  const matchId = params.matchId;

  const [error, setError] = useState<Error | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [match, setMatch] = useState<Match | null>(null);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [secrets, setSecrets] = useState<GameSecret[]>([]);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [sets, setSets] = useState<MatchSet[]>([]);

  const fetchMatchData = useCallback(async () => {
    // Si no tenemos el id de la partida o el servicio HTTP, no hacemos nada.
    if (!matchId || !httpService) return;

    if (!isUUID(matchId)) {
      console.error("Match ID is not a valid UUID:", matchId);

      return;
    }

    setError(null);
    setHasError(false);
    setIsLoading(true);

    try {
      const [match, cards, secrets, players, sets] = await Promise.all([
        httpService.getMatch(matchId),
        httpService.getMatchCards(matchId),
        httpService.getMatchSecrets(matchId),
        httpService.getMatchPlayers(matchId),
        httpService.getMatchSets(matchId),
      ]);

      setMatch(match);
      setCards(cards);
      setSecrets(secrets);
      setPlayers(players);
      setSets(sets);
    } catch (error) {
      console.error("Error fetching match data:", error);

      setError(error as Error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [httpService, matchId]);

  useEffect(() => {
    fetchMatchData();
  }, [fetchMatchData]);

  useEffect(() => {
    if (!wsService || !isConnected || !matchId || !isUUID(matchId)) return;

    const handleUpdateCards = (cards: GameCard[]) => {
      setCards((current) => {
        const updatedCards = [...current];

        cards.forEach((newCard) => {
          const index = updatedCards.findIndex((c) => c.id === newCard.id);
          if (index !== -1) {
            updatedCards[index] = {
              ...updatedCards[index],
              player_id: newCard.player_id,
              is_discarded: newCard.is_discarded,
              discarded_at: newCard.discarded_at,
            };
          }
        });

        return updatedCards;
      });
    };

    const handleUpdateMatchTurn = (match: Match) => {
      setMatch((current) => {
        if (!current) return match;

        return {
          ...current,
          current_player_order: match.current_player_order,
        };
      });
    };

    const handleUpdateSets = (set: MatchSet) => {
      setSets((prevSets) => {
        const exists = prevSets.find((prevSet) => prevSet.id === set.id);

        //* Solo manejo la creación de un set.
        if (!exists) return [...prevSets, set];

        // TODO: Se debe manejar los otros eventos.

        return prevSets;
      });
    };

    const handleUpdateSecrets = (secret: MatchSecret) => {
      setSecrets((prevSecrets) => {
        const updatedCards = [...prevSecrets];
        const indexSecret = updatedCards.findIndex(
          (prevSet) => prevSet.id === secret.id,
        );

        if (indexSecret === -1) return prevSecrets;

        const currSecret = updatedCards[indexSecret];

        const isSecretReveled = !currSecret.is_revealed && secret.is_revealed;
        const isDetectivesWin =
          currSecret.type === "MURDERER" && isSecretReveled;
        const isSecretHidden = currSecret.is_revealed && !secret.is_revealed;
        const isSecretStolen =
          currSecret.player_id !== secret.player_id && isSecretHidden;

        // TODO: Añadir las notificaciones
        if (isDetectivesWin) {
          // Los detectives ganaron.
        } else if (isSecretStolen) {
          // Notificar que se robo y oculto un secreto
        } else if (isSecretReveled) {
          // Notificar que se revelo un secreto
        } else if (isSecretHidden) {
          // Notificar que se oculto un secreto
        }

        updatedCards[indexSecret] = {
          ...updatedCards[indexSecret],
          is_revealed: secret.is_revealed,
          player_id: secret.player_id,
        };

        return updatedCards;
      });
    };

    wsService.on(BACKEND_SOCKETS_EVENTS.CARDS, handleUpdateCards);
    wsService.on(BACKEND_SOCKETS_EVENTS.TURN, handleUpdateMatchTurn);
    wsService.on(BACKEND_SOCKETS_EVENTS.SET, handleUpdateSets);
    wsService.on(BACKEND_SOCKETS_EVENTS.SECRET, handleUpdateSecrets);

    return () => {
      wsService.off(BACKEND_SOCKETS_EVENTS.CARDS, handleUpdateCards);
      wsService.off(BACKEND_SOCKETS_EVENTS.TURN, handleUpdateMatchTurn);
      wsService.off(BACKEND_SOCKETS_EVENTS.SET, handleUpdateSets);
      wsService.off(BACKEND_SOCKETS_EVENTS.SECRET, handleUpdateSecrets);
    };
  }, [matchId, wsService, isConnected]);

  // Memoizamos el valor del contexto para evitar renders innecesarios.
  // @see https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions
  const contextValue: GameContextType = useMemo(
    () => ({
      match,
      cards,
      secrets,
      players,
      sets,

      isLoading,
      hasError,
      error,
    }),
    [match, cards, secrets, players, sets, isLoading, hasError, error],
  );

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
