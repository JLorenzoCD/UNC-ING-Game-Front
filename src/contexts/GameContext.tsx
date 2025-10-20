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
import type { GameSecret } from "@/types/secret";
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

interface CardEventPayload {
  type: string;
  discarded_card_event: GameCard;
  updated_match_cards: GameCard[];
  updated_secret?: GameSecret;
  updated_set?: MatchSet;
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
  const [sets] = useState<MatchSet[]>([]);

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
      const [match, cards, secrets, players] = await Promise.all([
        httpService.getMatch(matchId),
        httpService.getMatchCards(matchId),
        httpService.getMatchSecrets(matchId),
        httpService.getMatchPlayers(matchId),
      ]);

      setMatch(match);
      setCards(cards);
      setSecrets(secrets);
      setPlayers(players);
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

    const handleCardEvent = (payload: CardEventPayload) => {
      if (
        payload.updated_match_cards &&
        payload.updated_match_cards.length > 0
      ) {
        setCards((current) => {
          const updatedCards = [...current];

          // Caso especial: DELAY THE MURDERER ESCAPE
          if (payload.type === "DELAY THE MURDERER ESCAPE") {
            // 1. Marcar la carta del evento como descartada
            const eventCardIndex = updatedCards.findIndex(
              (c) => c.id === payload.discarded_card_event.id,
            );
            if (eventCardIndex !== -1) {
              updatedCards[eventCardIndex] = payload.discarded_card_event;
            } // <-- Aquí se eliminó el ';'

            // 2. Obtener las cartas del mazo regular (sin dueño, no descartadas)
            const regularDeckCards = updatedCards.filter(
              (card) => card.player_id === null && !card.is_discarded,
            );

            // 3. Obtener las primeras 3 cartas que NO se tocarán
            const firstThreeCards = regularDeckCards.slice(0, 3);

            // 4. Las cartas actualizadas van después de las primeras 3
            // Primero quitamos las cartas que vamos a actualizar de su posición actual
            const cardsToUpdateIds = payload.updated_match_cards.map(
              (c) => c.id,
            );
            const cardsWithoutUpdated = updatedCards.filter(
              (card) => !cardsToUpdateIds.includes(card.id),
            );

            // 5. Insertar las cartas actualizadas después de las primeras 3
            // Encontrar los índices de las primeras 3 cartas en el array completo
            const firstThreeIndices = firstThreeCards.map((card) =>
              cardsWithoutUpdated.findIndex((c) => c.id === card.id),
            );

            // Insertar las cartas actualizadas después de la tercera carta
            const insertPosition = Math.max(...firstThreeIndices) + 1;

            const finalCards = [
              ...cardsWithoutUpdated.slice(0, insertPosition),
              ...payload.updated_match_cards,
              ...cardsWithoutUpdated.slice(insertPosition),
            ];

            return finalCards;
          }

          if (payload.updated_match_cards) {
            payload.updated_match_cards.forEach((newCard) => {
              const index = updatedCards.findIndex((c) => c.id === newCard.id);
              if (index !== -1) {
                updatedCards[index] = newCard;
              }
            });
          }

          // 8. AÑADIR: Actualizar también la carta de evento que se descartó
          // (Esto es lo que descarta "LOOK INTO THE ASHES" de la mano del jugador)
          if (payload.discarded_card_event) {
            const index = updatedCards.findIndex(
              (c) => c.id === payload.discarded_card_event.id,
            );
            if (index !== -1) {
              updatedCards[index] = payload.discarded_card_event;
            }
          }
          return updatedCards;
        });
      }

      if (payload.updated_secret) {
        setSecrets((current) => {
          const updatedSecrets = [...current];
          const newSecret = payload.updated_secret;
          if (newSecret) {
            const index = updatedSecrets.findIndex(
              (s) => s.id === newSecret.id,
            );
            if (index !== -1) {
              updatedSecrets[index] = newSecret;
            }
          }
          return updatedSecrets;
        });
      }
    };

    wsService.on(BACKEND_SOCKETS_EVENTS.CARDS, handleUpdateCards);
    wsService.on(BACKEND_SOCKETS_EVENTS.TURN, handleUpdateMatchTurn);
    wsService.on(BACKEND_SOCKETS_EVENTS.CARD_EVENT, handleCardEvent);

    return () => {
      wsService.off(BACKEND_SOCKETS_EVENTS.CARDS, handleUpdateCards);
      wsService.off(BACKEND_SOCKETS_EVENTS.TURN, handleUpdateMatchTurn);
      wsService.off(BACKEND_SOCKETS_EVENTS.CARD_EVENT, handleCardEvent);
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
