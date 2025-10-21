import { toast } from "sonner";

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
import { useHttpService } from "./HttpServiceContext";
import { useWebSocketService } from "./WebSocketServiceContext";
import { usePlayer } from "./PlayerContext";

import { isUUID } from "@/utils";
import { BACKEND_SOCKETS_EVENTS } from "@/constants/backend";

import type { Match, MatchResult } from "@/types/match";
import type { GameCard } from "@/types/card";
import type { GameSecret, MatchSecret } from "@/types/secret";
import type { GamePlayer } from "@/types/player";
import type { MatchSet } from "@/types/set";
import type { EventMatchCompletedPayload } from "@/types/ws";
import type { UUID } from "@/types/common";

export interface GameContextType {
  match: Match | null;
  result: MatchResult | null;
  cards: GameCard[];
  secrets: GameSecret[];
  players: GamePlayer[];
  sets: MatchSet[];

  isLoading: boolean;
  hasError: boolean;
  error: Error | null;

  lastUpdatedSecretId: UUID | null;
  isPlayerFinishAction: boolean;
  playerFinishActionTurn: () => void;
  playerSelectsOneOfHisSecrets: { isCurrPlayer: boolean; isSelecting: boolean };
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
  result: null,
  cards: [],
  secrets: [],
  players: [],
  sets: [],

  isLoading: false,
  hasError: false,
  error: null,

  lastUpdatedSecretId: null,
  isPlayerFinishAction: false,
  playerFinishActionTurn: () => undefined,
  playerSelectsOneOfHisSecrets: { isCurrPlayer: false, isSelecting: false },
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
  const { player } = usePlayer();

  const [error, setError] = useState<Error | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [lastUpdatedSecretId, setLastUpdatedSecretId] = useState<UUID | null>(
    null,
  );
  const [playerSelectsOneOfHisSecrets, setPlayerSelectsOneOfHisSecrets] =
    useState<{ isCurrPlayer: boolean; isSelecting: boolean }>({
      isCurrPlayer: false,
      isSelecting: false,
    });
  const [isPlayerFinishAction, setPlayerFinishAction] =
    useState<boolean>(false);

  const [match, setMatch] = useState<Match | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);

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

  const playerFinishActionTurn = () => setPlayerFinishAction(true);

  useEffect(() => {
    fetchMatchData();
  }, [fetchMatchData]);

  useEffect(() => {
    if (!wsService || !isConnected || !matchId || !isUUID(matchId)) return;

    const handleEventCards = (cards: GameCard[]) => {
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

    const handleEventTurn = (match: Match) => {
      setMatch((current) => {
        if (!current) return match;

        setPlayerFinishAction(false);

        return {
          ...current,
          current_player_order: match.current_player_order,
        };
      });
    };

    const handleCardEvent = (payload: CardEventPayload) => {
      if (
        (payload.updated_match_cards &&
          payload.updated_match_cards.length > 0) ||
        payload.discarded_card_event
      ) {
        setCards((current) => {
          const updatedCards = [...current];

          // Caso especial: DELAY THE MURDERER ESCAPE
          if (payload.type === "DELAY THE MURDERER ESCAPE") {
            // 1. Marcar la carta del evento como descartada
            handleEventCards([payload.discarded_card_event]);

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
            handleEventCards(payload.updated_match_cards);
          }

          // 8. AÑADIR: Actualizar también la carta de evento que se descartó
          if (payload.discarded_card_event) {
            handleEventCards([payload.discarded_card_event]);
          }

          return updatedCards;
        });
      }

      if (payload.updated_secret) {
        handleUpdateSecrets(payload.updated_secret);
      }

      if (payload.updated_set) {
        setSets((current) => {
          const updatedSets = [...current];
          const newSet = payload.updated_set;
          if (newSet) {
            const index = updatedSets.findIndex((s) => s.id === newSet.id);
            if (index !== -1) {
              updatedSets[index] = newSet;
            }
          }
          return updatedSets;
        });
      }
    };

    const handleUpdateSets = (set: MatchSet & { deleted_cards: UUID[] }) => {
      setSets((prevSets) => {
        const exists = prevSets.find((prevSet) => prevSet.id === set.id);
        let updateSet = prevSets;

        //* Solo manejo la creación de un set.
        if (!exists) {
          const playerOwnerSet = players.find((p) => p.id === set.player_id);
          if (!playerOwnerSet) return prevSets;

          const newSet = {
            ...set,
            cards_to_delete: undefined,
          } as MatchSet;

          toast(`Player "${playerOwnerSet.name}" played a set.`);
          updateSet = [...prevSets, newSet];

          setCards((prevCards) => {
            // Se eliminan las cartas cuyos ids estén en el arreglo de set.deleted_cards
            return prevCards.filter(
              (card) => !set.deleted_cards.includes(card.id),
            );
          });
        }

        // TODO: Se debe manejar los otros eventos.

        return updateSet;
      });
    };

    const handleUpdateSecrets = (secret: MatchSecret) => {
      setSecrets((prevSecrets) => {
        const updatedCards = [...prevSecrets];
        const indexSecret = updatedCards.findIndex(
          (prevSet) => prevSet.id === secret.id,
        );

        const currSecret = updatedCards[indexSecret];
        if (indexSecret === -1) return prevSecrets;

        const playerTarget = players.find((p) => p.id === currSecret.player_id);
        if (!playerTarget) return prevSecrets;

        const isSecretReveled = !currSecret.is_revealed && secret.is_revealed;
        const isDetectivesWin =
          currSecret.type === "MURDERER" && isSecretReveled;
        const isSecretHidden = currSecret.is_revealed && !secret.is_revealed;
        const isSecretStolen =
          currSecret.player_id !== secret.player_id && isSecretHidden;

        let msg = "";
        if (isDetectivesWin) {
          // Los detectives ganaron.
          msg = "The murderer has been discovered.";
        } else if (isSecretStolen) {
          // Notificar que se robo y oculto un secreto
          msg = `A secret was stolen from player "${playerTarget.name}" and hidden.`;
        } else if (isSecretReveled) {
          // Notificar que se revelo un secreto
          msg = `A secret from player "${playerTarget.name}" was selected to be revealed.`;
        } else if (isSecretHidden) {
          // Notificar que se oculto un secreto
          msg = `A secret of player "${playerTarget.name}" has been hidden.`;
        } else {
          msg = "Something strange has happened with a secret.";
        }
        toast(msg);

        setLastUpdatedSecretId(secret.id);

        updatedCards[indexSecret] = {
          ...updatedCards[indexSecret],
          is_revealed: secret.is_revealed,
          player_id: secret.player_id,
        };

        setPlayerSelectsOneOfHisSecrets({
          isCurrPlayer: false,
          isSelecting: false,
        });

        return updatedCards;
      });
    };

    const handleCurrPlayerSelectItsSecret = (targetPlayerId: {
      target_player_id: UUID;
    }) => {
      const isCurrPlayer = player?.id === targetPlayerId.target_player_id;

      setPlayerSelectsOneOfHisSecrets({ isCurrPlayer, isSelecting: true });

      if (isCurrPlayer)
        toast(
          "You've been selected to reveal one of your secrets. Choose one.",
        );
      else toast("A player was selected to reveal one of his secrets.");
    };

    const handleEventMatchCompleted = (payload: EventMatchCompletedPayload) => {
      setMatch((current) => {
        if (!current) return current;

        return {
          ...current,
          status: "COMPLETED",
        };
      });

      setResult(payload);
    };

    wsService.on(BACKEND_SOCKETS_EVENTS.CARDS, handleEventCards);
    wsService.on(BACKEND_SOCKETS_EVENTS.TURN, handleEventTurn);
    wsService.on(
      BACKEND_SOCKETS_EVENTS.MATCH_COMPLETED,
      handleEventMatchCompleted,
    );
    wsService.on(BACKEND_SOCKETS_EVENTS.SET, handleUpdateSets);
    wsService.on(BACKEND_SOCKETS_EVENTS.SECRET, handleUpdateSecrets);
    wsService.on(
      BACKEND_SOCKETS_EVENTS.PLAYER_SECRET_REVEAL,
      handleCurrPlayerSelectItsSecret,
    );
    wsService.on(BACKEND_SOCKETS_EVENTS.CARD_EVENT, handleCardEvent);

    return () => {
      wsService.off(BACKEND_SOCKETS_EVENTS.CARDS, handleEventCards);
      wsService.off(BACKEND_SOCKETS_EVENTS.TURN, handleEventTurn);
      wsService.off(
        BACKEND_SOCKETS_EVENTS.MATCH_COMPLETED,
        handleEventMatchCompleted,
      );
      wsService.off(BACKEND_SOCKETS_EVENTS.SET, handleUpdateSets);
      wsService.off(BACKEND_SOCKETS_EVENTS.SECRET, handleUpdateSecrets);
      wsService.off(
        BACKEND_SOCKETS_EVENTS.PLAYER_SECRET_REVEAL,
        handleCurrPlayerSelectItsSecret,
      );
      wsService.off(BACKEND_SOCKETS_EVENTS.CARD_EVENT, handleCardEvent);
    };
  }, [
    matchId,
    wsService,
    isConnected,
    players,
    player,
    playerSelectsOneOfHisSecrets,
  ]);

  // Memoizamos el valor del contexto para evitar renders innecesarios.
  // @see https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions
  const contextValue: GameContextType = useMemo(
    () => ({
      match,
      result,
      cards,
      secrets,
      players,
      sets,

      isLoading,
      hasError,
      error,

      lastUpdatedSecretId,
      playerSelectsOneOfHisSecrets,
      isPlayerFinishAction,
      playerFinishActionTurn,
    }),
    [
      match,
      result,
      cards,
      secrets,
      players,
      sets,
      isLoading,
      hasError,
      error,
      isPlayerFinishAction,
      playerSelectsOneOfHisSecrets,
      lastUpdatedSecretId,
    ],
  );

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
