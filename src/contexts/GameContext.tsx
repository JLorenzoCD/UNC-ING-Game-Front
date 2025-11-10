import { toast } from "sonner";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import type {
  EventMatchCompletedPayload,
  EventCardEventPayload,
  EventNotSoFastPayload,
  EventCanceledPayload,
  EventPendingResponsePayload,
} from "@/types/ws";
import type { UUID } from "@/types/common";
import { GAME_EVENTS } from "@/constants/game";
import type { MatchLog } from "@/types/log";

export interface GameContextType {
  match: Match | null;
  result: MatchResult | null;
  cards: GameCard[];
  secrets: GameSecret[];
  players: GamePlayer[];
  sets: MatchSet[];
  logs: MatchLog[];

  isLoading: boolean;
  hasError: boolean;
  error: Error | null;

  lastUpdatedSecretId: UUID | null;
  hasFinishedAction: boolean;
  playerFinishActionTurn: () => void;
  playerSelectsOneOfHisSecrets: { isCurrPlayer: boolean; isSelecting: boolean };
  notSoFastEvent: {
    isActivate: boolean;
    eventId: UUID | null;
    nsfCount: number;
    resolvedAtUtc: string | null;
    toastId: string | number | null;
    discardedCard: GameCard | null;
  };
  clearNotSoFastEvent: () => void;
  pendingResponse: {
    isPending: boolean;
    eventId: UUID | null;
    eventType: string | null;
  };
  clearPendingResponse: () => void;
}

const GameContext = createContext<GameContextType>({
  match: null,
  result: null,
  cards: [],
  secrets: [],
  players: [],
  sets: [],
  logs: [],

  isLoading: false,
  hasError: false,
  error: null,

  lastUpdatedSecretId: null,
  hasFinishedAction: false,
  playerFinishActionTurn: () => undefined,
  playerSelectsOneOfHisSecrets: { isCurrPlayer: false, isSelecting: false },
  notSoFastEvent: {
    isActivate: false,
    eventId: null,
    nsfCount: 0,
    resolvedAtUtc: null,
    toastId: null,
    discardedCard: null,
  },
  clearNotSoFastEvent: () => undefined,
  pendingResponse: {
    isPending: false,
    eventId: null,
    eventType: null,
  },
  clearPendingResponse: () => undefined,
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
  const [hasFinishedAction, setPlayerFinishAction] = useState<boolean>(false);

  const [notSoFastEvent, setNotSoFastEvent] = useState<{
    isActivate: boolean;
    eventId: UUID | null;
    nsfCount: number;
    resolvedAtUtc: string | null;
    toastId: string | number | null;
    discardedCard: GameCard | null;
  }>({
    isActivate: false,
    eventId: null,
    nsfCount: 0,
    resolvedAtUtc: null,
    toastId: null,
    discardedCard: null,
  });

  const [pendingResponse, setPendingResponse] = useState<{
    isPending: boolean;
    eventId: UUID | null;
    eventType: string | null;
  }>({
    isPending: false,
    eventId: null,
    eventType: null,
  });

  const [match, setMatch] = useState<Match | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);

  const [cards, setCards] = useState<GameCard[]>([]);
  const [secrets, setSecrets] = useState<GameSecret[]>([]);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [sets, setSets] = useState<MatchSet[]>([]);
  const [logs, setLogs] = useState<MatchLog[]>([]);

  const nsfTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      const [match, cards, secrets, players, sets, logs] = await Promise.all([
        httpService.getMatch(matchId),
        httpService.getMatchCards(matchId),
        httpService.getMatchSecrets(matchId),
        httpService.getMatchPlayers(matchId),
        httpService.getMatchSets(matchId),
        httpService.getMatchLogs(matchId),
      ]);

      setMatch(match);
      setCards(cards);
      setSecrets(secrets);
      setPlayers(players);
      setSets(sets);
      setLogs(logs);
    } catch (error) {
      console.error("Error fetching match data:", error);

      setError(error as Error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [httpService, matchId]);

  const playerFinishActionTurn = useCallback(
    () => setPlayerFinishAction(true),
    [],
  );

  const clearNotSoFastEvent = useCallback(() => {
    if (notSoFastEvent.toastId) {
      toast.dismiss(notSoFastEvent.toastId);
    }
    if (nsfTimerRef.current) {
      clearTimeout(nsfTimerRef.current);
      nsfTimerRef.current = null;
    }

    setNotSoFastEvent({
      isActivate: false,
      eventId: null,
      nsfCount: 0,
      resolvedAtUtc: null,
      toastId: null,
      discardedCard: null,
    });
  }, [notSoFastEvent.toastId]);

  const clearPendingResponse = useCallback(() => {
    setPendingResponse({
      isPending: false,
      eventId: null,
      eventType: null,
    });
  }, []);

  useEffect(() => {
    // Si el desafío NO está activo o no hay fecha límite, no hacemos nada.
    // Solo nos aseguramos de que el timer esté limpio.
    if (!notSoFastEvent.isActivate || !notSoFastEvent.resolvedAtUtc) {
      if (nsfTimerRef.current) {
        clearTimeout(nsfTimerRef.current);
        nsfTimerRef.current = null;
      }
      return;
    }

    // Calculamos el tiempo restante
    const now = new Date();
    const utcTimeString = notSoFastEvent.resolvedAtUtc;

    const sanitizedTimeString = utcTimeString.replace(/(\.\d{3})\d+/, "$1");
    const deadline = new Date(sanitizedTimeString);

    const durationMs = deadline.getTime() - now.getTime();

    // Si el tiempo ya pasó o es inválido, limpiamos
    if (durationMs <= 0) {
      clearNotSoFastEvent();
      return;
    }

    // Creamos el temporizador
    nsfTimerRef.current = setTimeout(() => {
      toast.warning("Se acabó el tiempo para jugar NOT SO FAST.");
      clearNotSoFastEvent(); // Limpiamos el estado
      nsfTimerRef.current = null;
    }, durationMs);

    // Esta es la función de limpieza:
    // Se ejecutará si el componente se desmonta o si clearNotSoFastEvent()
    // es llamada desde otro lugar (ej. al jugar la carta).
    return () => {
      if (nsfTimerRef.current) {
        clearTimeout(nsfTimerRef.current);
        nsfTimerRef.current = null;
      }
    };
  }, [
    notSoFastEvent.isActivate,
    notSoFastEvent.resolvedAtUtc,
    clearNotSoFastEvent,
  ]);

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

    const handleRemoveCards = (cardsToRemove: GameCard[]) => {
      if (!cardsToRemove || cardsToRemove.length === 0) return;

      const idsToRemove = cardsToRemove.map((card) => card.id);

      setCards((current) =>
        current.filter((card) => !idsToRemove.includes(card.id)),
      );
    };

    const handleEventTurn = (match: Match) => {
      setMatch((current) => {
        if (!current) return match;

        setPlayerFinishAction(false);

        return {
          ...current,
          current_player_order: match.current_player_order,
          timer_turn: match.timer_turn,
        };
      });
    };

    const handleCanceledEvent = (payload: EventCanceledPayload) => {
      const event = payload.event_type;
      const message = payload.message;
      toast.info(`${event} ${message}`);
      if (payload.discarded_card) {
        if (payload.event_type === GAME_EVENTS.EARLY_TRAIN_TO_PADDINGTON) {
          handleRemoveCards([payload.discarded_card]);
        } else {
          handleEventCards([payload.discarded_card]);
        }
      }
    };

    const handleNotSoFastEvent = (payload: EventNotSoFastPayload) => {
      const hasNotSoFast = cards.some(
        (card) => card.player_id === player?.id && card.name === "NOT SO FAST",
      );
      if (payload.discarded_card) {
        if (payload.event_type === GAME_EVENTS.EARLY_TRAIN_TO_PADDINGTON) {
          handleRemoveCards([payload.discarded_card]);
        } else {
          handleEventCards([payload.discarded_card]);
        }
      }

      if (hasNotSoFast) {
        const eventType = payload.event_type;
        const targetPlayerId = payload.player_id;

        const targetPlayer = players.find((p) => p.id === targetPlayerId);
        const playerName = targetPlayer?.name;

        const now = new Date();
        const utcTimeString = payload.resolve_at_utc;
        const sanitizedTimeString = utcTimeString.replace(/(\.\d{3})\d+/, "$1");
        const deadline = new Date(sanitizedTimeString);

        const secondsLeft = Math.floor(
          (deadline.getTime() - now.getTime()) / 1000,
        );

        const message = `Do you want to cancel the event ${eventType} played by ${playerName}? Double-click on a not so fast (${secondsLeft} s.)`;

        const newToastId = toast.info(message);

        setNotSoFastEvent({
          isActivate: true,
          eventId: payload.event_id,
          nsfCount: payload.nsf_count,
          resolvedAtUtc: payload.resolve_at_utc,
          toastId: newToastId,
          discardedCard: payload.discarded_card,
        });
      }
    };

    const handleCardEvent = (payload: EventCardEventPayload) => {
      if (payload.type === GAME_EVENTS.DELAY_THE_MURDERER_ESCAPE) {
        setCards((current) => {
          const updatedCards = [...current];

          // Caso especial: DELAY THE MURDERER ESCAPE
          // 2. Obtener las cartas del mazo regular (sin dueño, no descartadas)
          const regularDeckCards = updatedCards.filter(
            (card) => card.player_id === null && !card.is_discarded,
          );

          // 3. Obtener las primeras 3 cartas que NO se tocarán
          const firstThreeCards = regularDeckCards.slice(0, 3);

          // 4. Las cartas actualizadas van después de las primeras 3
          // Primero quitamos las cartas que vamos a actualizar de su posición actual
          const cardsToUpdateIds = payload.updated_match_cards.map((c) => c.id);
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

          const fullUpdatedCards = payload.updated_match_cards.map(
            (newCard) => {
              const existingCard = current.find((c) => c.id === newCard.id);
              return { ...existingCard, ...newCard };
            },
          );

          const finalCards = [
            ...cardsWithoutUpdated.slice(0, insertPosition),
            ...fullUpdatedCards,
            ...cardsWithoutUpdated.slice(insertPosition),
          ];

          return finalCards;
        });
      }

      if (
        payload.updated_match_cards &&
        payload.updated_match_cards.length > 0
      ) {
        handleEventCards(payload.updated_match_cards);
      }

      if (
        payload.discarded_card_event &&
        "card_id" in payload.discarded_card_event
      ) {
        if (payload.type === GAME_EVENTS.EARLY_TRAIN_TO_PADDINGTON) {
          handleRemoveCards([payload.discarded_card_event]);
        } else {
          handleEventCards([payload.discarded_card_event]);
        }
      }

      if (payload.updated_secret && "secret_id" in payload.updated_secret) {
        handleUpdateSecrets(payload.updated_secret);
      }

      if (payload.updated_set) {
        handleUpdateSets(payload.updated_set);
      }

      if (payload.message) {
        toast.success(payload.message);
      }
    };

    const handleUpdateSets = (set: MatchSet & { deleted_cards?: UUID[] }) => {
      setSets((prevSets) => {
        const index = prevSets.findIndex((prevSet) => prevSet.id === set.id);
        let updateSet = [...prevSets];

        const playerOwnerSet = players.find((p) => p.id === set.player_id);
        if (!playerOwnerSet) return prevSets;

        // Creación de un set.
        if (index === -1) {
          const newSet = {
            ...set,
            cards_to_delete: undefined,
          };

          delete newSet.cards_to_delete;

          toast(`Player "${playerOwnerSet.name}" played a set.`);
          updateSet = [...prevSets, newSet];
        } else if (
          // Robar un set
          index !== -1 &&
          set.deleted_cards === undefined &&
          prevSets[index].player_id !== set.player_id
        ) {
          updateSet[index] = set;
          toast(`Player "${playerOwnerSet.name}" stolen a set.`);
        } else if (
          // Modificación de un set
          index !== -1
        ) {
          updateSet[index] = set;
        }

        if (set.deleted_cards !== undefined) {
          setCards((prevCards) => {
            // Se eliminan las cartas cuyos ids estén en el arreglo de set.deleted_cards
            return prevCards.filter(
              (card) => !(set.deleted_cards as UUID[]).includes(card.id),
            );
          });
        }

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

        let msg = "Something strange has happened with a secret.";
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

    const handlePendingResponse = (payload: EventPendingResponsePayload) => {
      if (!player || !payload.players_ids.includes(player.id)) {
        return;
      }
      if (payload.event_type === GAME_EVENTS.CARD_TRADE) {
        toast.info("CARD TRADE: You must select a card to exchange.");
        setPendingResponse({
          isPending: true,
          eventId: payload.event_id,
          eventType: payload.event_type,
        });
      }
    };

    const handleEventLog = (log: MatchLog) => {
      setLogs((currentLogs) => [...currentLogs, log]);
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

    wsService.on(
      BACKEND_SOCKETS_EVENTS.CANCELLATION_WINDOW_OPEN,
      handleNotSoFastEvent,
    );

    wsService.on(BACKEND_SOCKETS_EVENTS.CANCELED, handleCanceledEvent);

    wsService.on(
      BACKEND_SOCKETS_EVENTS.PENDING_RESPONSE,
      handlePendingResponse,
    );

    wsService.on(BACKEND_SOCKETS_EVENTS.LOG, handleEventLog);

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

      wsService.off(
        BACKEND_SOCKETS_EVENTS.CANCELLATION_WINDOW_OPEN,
        handleNotSoFastEvent,
      );

      wsService.off(BACKEND_SOCKETS_EVENTS.CANCELED, handleCanceledEvent);

      wsService.off(BACKEND_SOCKETS_EVENTS.LOG, handleEventLog);

      wsService.off(
        BACKEND_SOCKETS_EVENTS.PENDING_RESPONSE,
        handlePendingResponse,
      );
    };
  }, [matchId, wsService, isConnected, players, player, cards]);

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
      logs,

      isLoading,
      hasError,
      error,

      lastUpdatedSecretId,
      playerSelectsOneOfHisSecrets,
      hasFinishedAction,
      playerFinishActionTurn,
      notSoFastEvent,
      clearNotSoFastEvent,
      pendingResponse,
      clearPendingResponse,
    }),
    [
      match,
      result,
      cards,
      secrets,
      players,
      sets,
      logs,
      isLoading,
      hasError,
      error,
      hasFinishedAction,
      playerSelectsOneOfHisSecrets,
      lastUpdatedSecretId,
      playerFinishActionTurn,
      notSoFastEvent,
      clearNotSoFastEvent,
      pendingResponse,
      clearPendingResponse,
    ],
  );

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
