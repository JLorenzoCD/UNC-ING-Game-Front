import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { usePlayer } from "./PlayerContext";
import { useBasicGame } from "./BasicGameContext";
import { useSetEvent } from "@/containers/game/hooks/useSetEvent";
import { useCardEvent } from "@/containers/game/hooks/useCardEvent";

import { EVENT_STEPS, GAME_EVENTS, GAME_RULES } from "@/constants/game";

import type { GameSecret } from "@/types/secret";
import type { UUID } from "@/types/common";
import type { MatchSet } from "@/types/set";
import type { GameCard } from "@/types/card";
import type { GamePlayer } from "@/types/player";

export type CardsGroupByType = UUID | "DISCARD" | "DRAWABLE";
export const CARDS_GROUP_TYPES: Record<
  Exclude<CardsGroupByType, UUID>,
  Exclude<CardsGroupByType, UUID>
> = {
  DISCARD: "DISCARD",
  DRAWABLE: "DRAWABLE",
};

export interface LogicGameContextType {
  isPlayerTurn: boolean;
  isEvent: boolean;

  secretsGroupByPlayerId: Record<UUID, GameSecret[]>;
  setsGroupByPlayerId: Record<UUID, MatchSet[]>;
  cardsGroupByPlayerId: Record<CardsGroupByType, GameCard[]>;

  cardsInDiscardPile: GameCard[];
  cardsInDraft: GameCard[];
  drawableCards: GameCard[];

  playerSets: MatchSet[];
  playerSecrets: GameSecret[];
  isInSocialDisgrace: boolean;

  hookSetEvent: ReturnType<typeof useSetEvent>;
  hookCardEvent: ReturnType<typeof useCardEvent>;

  getTarget: () => GameSecret | MatchSet | GamePlayer | null;

  isTargetSecretEvent: () => boolean;
  isTargetPlayerEvent: () => boolean;
  isTargetSetEvent: () => boolean;

  isSelectableSet: (set: MatchSet) => boolean;
  isSelectablePlayer: (checkPlayer: GamePlayer) => boolean;
  isSelectableSecret: (secret: GameSecret) => boolean;
  isOtherPlayersSecretSelectable: (secret: GameSecret) => boolean;
  isCurrPlayersSecretSelectable: (secret: GameSecret) => boolean;
}

const LogicGameContext = createContext<LogicGameContextType>({
  isPlayerTurn: false,
  isInSocialDisgrace: false,
  isEvent: false,

  secretsGroupByPlayerId: {},
  setsGroupByPlayerId: {},
  cardsGroupByPlayerId: { DISCARD: [], DRAWABLE: [] },

  cardsInDiscardPile: [],
  cardsInDraft: [],
  drawableCards: [],

  playerSecrets: [],
  playerSets: [],

  hookSetEvent: (() => {}) as any,
  hookCardEvent: (() => {}) as any,

  getTarget: (() => null) as any,
  isSelectablePlayer: (() => false) as any,
  isSelectableSecret: (() => false) as any,
  isOtherPlayersSecretSelectable: (() => false) as any,
  isCurrPlayersSecretSelectable: (() => false) as any,
  isTargetPlayerEvent: (() => false) as any,
  isTargetSecretEvent: (() => false) as any,
  isTargetSetEvent: (() => false) as any,
  isSelectableSet: (() => false) as any,
});

export interface LogicGameContextProviderProps {
  children: ReactNode;
}

export default function LogicGameContextProvider({
  children,
}: LogicGameContextProviderProps) {
  const { player } = usePlayer();
  const {
    match,
    players,
    secrets,
    cards,
    sets,
    playerSelectsOneOfHisSecrets,
    notSoFastEvent,
    pendingResponse,
  } = useBasicGame();
  const hookSetEvent = useSetEvent();
  const hookCardEvent = useCardEvent();

  const isPlayerTurn = useMemo(() => {
    if (!match || !player) return false;

    const matchPlayer = players.find((p) => p.id === player.id);

    if (!matchPlayer) return false;

    return match.current_player_order === matchPlayer.order;
  }, [match, player, players]);

  // ---------------------------------------------------------------------------
  // Entidades agrupadas según playerId
  const secretsGroupByPlayerId = useMemo(() => {
    return Object.groupBy(secrets, (secret) => secret.player_id);
  }, [secrets]) as Record<UUID, GameSecret[]>;

  const cardsGroupByPlayerId = useMemo(() => {
    return Object.groupBy(cards, (card) => {
      if (card.player_id !== null) return card.player_id;

      if (card.is_discarded) return "DISCARD";

      // player_id === null && !card.is_discarded
      return "DRAWABLE";
    });
  }, [cards]) as Record<CardsGroupByType, GameCard[]>;

  const setsGroupByPlayerId = useMemo(() => {
    return Object.groupBy(sets, (set) => set.player_id);
  }, [sets]) as Record<UUID, MatchSet[]>;

  // ---------------------------------------------------------------------------
  // Variables memorizadas del juego
  const cardsInDiscardPile = useMemo(() => {
    if (cardsGroupByPlayerId[CARDS_GROUP_TYPES.DISCARD] === undefined)
      return [];

    return cardsGroupByPlayerId[CARDS_GROUP_TYPES.DISCARD].sort((a, b) => {
      if (a.discarded_at && b.discarded_at) {
        return b.discarded_at < a.discarded_at ? -1 : 1;
      } else if (a.discarded_at) {
        return -1;
      } else return 1;
    });
  }, [cardsGroupByPlayerId]);

  const cardsInDraft = useMemo(() => {
    if (cardsGroupByPlayerId[CARDS_GROUP_TYPES.DRAWABLE] === undefined)
      return [];

    return cardsGroupByPlayerId[CARDS_GROUP_TYPES.DRAWABLE].slice(
      0,
      GAME_RULES.DRAFT_SIZE,
    );
  }, [cardsGroupByPlayerId]);

  const drawableCards = useMemo(() => {
    if (cardsGroupByPlayerId[CARDS_GROUP_TYPES.DRAWABLE] === undefined)
      return [];

    return cardsGroupByPlayerId[CARDS_GROUP_TYPES.DRAWABLE];
  }, [cardsGroupByPlayerId]);

  // ---------------------------------------------------------------------------
  // Variables relacionadas con el jugador actual
  const playerSets = useMemo(() => {
    if (!player) return [];

    if (setsGroupByPlayerId[player.id] === undefined) return [];

    return setsGroupByPlayerId[player.id];
  }, [setsGroupByPlayerId, player]);

  const playerSecrets = useMemo(() => {
    if (!player) return [];

    if (secretsGroupByPlayerId[player.id] === undefined) return [];

    return secretsGroupByPlayerId[player.id];
  }, [secretsGroupByPlayerId, player]);

  const isInSocialDisgrace = useMemo(() => {
    return playerSecrets.every((secret) => secret.is_revealed);
  }, [playerSecrets]);

  const getTarget = useCallback(() => {
    return (
      hookSetEvent.getTargetSetEvent() ||
      hookCardEvent.selectedTargetPlayer ||
      hookCardEvent.selectedTargetSecret ||
      hookCardEvent.selectedTargetSet ||
      hookSetEvent.setEvent.set
    );
  }, [
    hookSetEvent,
    hookCardEvent.selectedTargetPlayer,
    hookCardEvent.selectedTargetSecret,
    hookCardEvent.selectedTargetSet,
  ]);

  const isOtherPlayersSecretSelectable = useCallback(
    (secret: GameSecret) => {
      if (hookSetEvent.setEvent.isInEvent)
        return hookSetEvent.isOtherPlayerSecretSelectableForSetEvent(secret);

      return false;
    },
    [hookSetEvent],
  );

  const isSelectablePlayer = useCallback(
    (checkPlayer: GamePlayer) => {
      //* Validacion por eventos

      if (
        checkPlayer.id !== player?.id &&
        hookCardEvent.currentEventCard?.name === GAME_EVENTS.CARDS_OFF_THE_TABLE
      ) {
        return true;
      }

      if (
        checkPlayer.id !== player?.id &&
        hookCardEvent.currentEventCard?.name === GAME_EVENTS.CARD_TRADE &&
        hookCardEvent.currentEventStep === EVENT_STEPS.SELECT_PLAYER
      ) {
        return cardsGroupByPlayerId[checkPlayer.id].length !== 0;
      }

      if (
        hookCardEvent.currentEventCard?.name ===
          GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
        hookCardEvent.currentEventStep === EVENT_STEPS.SELECT_PLAYER
      ) {
        return true;
      }

      if (
        pendingResponse.isPending &&
        pendingResponse.eventType === GAME_EVENTS.POINT_YOUR_SUSPICIONS
      ) {
        return checkPlayer.id !== player?.id;
      }

      // Se deben de poner todos los posibles eventos validos
      if (hookSetEvent.setEvent.isInEvent)
        return hookSetEvent.isPlayerSelectableForSetEvent(checkPlayer);

      return false;
    },
    [
      cardsGroupByPlayerId,
      hookCardEvent.currentEventCard,
      hookCardEvent.currentEventStep,
      hookSetEvent,
      pendingResponse.eventType,
      pendingResponse.isPending,
      player?.id,
    ],
  );

  const isCurrPlayersSecretSelectable = useCallback(
    (secret: GameSecret) => {
      if (
        hookSetEvent.setEvent.isInEvent ||
        playerSelectsOneOfHisSecrets.isCurrPlayer
      )
        return hookSetEvent.isCurrPlayerSecretSelectableForSetEvent(secret);

      if (
        hookCardEvent.currentEventCard?.name ===
          "AND THEN THERE WAS ONE MORE" &&
        hookCardEvent.currentEventStep === "select_secret"
      ) {
        return secret.is_revealed;
      }

      return false;
    },
    [
      hookCardEvent.currentEventCard,
      hookCardEvent.currentEventStep,
      hookSetEvent,
      playerSelectsOneOfHisSecrets.isCurrPlayer,
    ],
  );

  const isSelectableSecret = useCallback(
    (secret: GameSecret) => {
      if (player?.id === secret.player_id)
        return isCurrPlayersSecretSelectable(secret);

      if (
        hookCardEvent.currentEventCard?.name ===
          GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
        hookCardEvent.currentEventStep === EVENT_STEPS.SELECT_SECRET
      ) {
        return secret.is_revealed;
      }

      if (hookSetEvent.setEvent.isInEvent) {
        return isOtherPlayersSecretSelectable(secret);
      }

      return false;
    },
    [
      player,
      hookCardEvent.currentEventCard,
      hookCardEvent.currentEventStep,
      hookSetEvent.setEvent.isInEvent,
      isOtherPlayersSecretSelectable,
      isCurrPlayersSecretSelectable,
    ],
  );

  const isTargetPlayerEvent = useCallback(() => {
    if (notSoFastEvent.isActivate) return false;

    if (hookSetEvent.setEvent.isTargetPlayer) return true;

    if (
      pendingResponse.isPending &&
      pendingResponse.eventType === GAME_EVENTS.POINT_YOUR_SUSPICIONS
    )
      return true;

    if (
      hookCardEvent.currentEventCard?.name ===
        GAME_EVENTS.CARDS_OFF_THE_TABLE ||
      (hookCardEvent.currentEventCard?.name ===
        GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
        hookCardEvent.currentEventStep === EVENT_STEPS.SELECT_PLAYER) ||
      (hookCardEvent.currentEventCard?.name === GAME_EVENTS.CARD_TRADE &&
        hookCardEvent.currentEventStep === EVENT_STEPS.SELECT_PLAYER)
    )
      return true;

    return false;
  }, [
    hookCardEvent.currentEventCard,
    hookCardEvent.currentEventStep,
    hookSetEvent.setEvent.isTargetPlayer,
    notSoFastEvent.isActivate,
    pendingResponse.eventType,
    pendingResponse.isPending,
  ]);

  const isTargetSecretEvent = useCallback(() => {
    if (notSoFastEvent.isActivate) return false;

    if (
      hookSetEvent.setEvent.isTargetSecret ||
      playerSelectsOneOfHisSecrets.isCurrPlayer
    )
      return true;

    if (
      hookCardEvent.currentEventCard?.name ===
        GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
      hookCardEvent.currentEventStep === EVENT_STEPS.SELECT_SECRET
    ) {
      return true;
    }

    return false;
  }, [
    hookCardEvent.currentEventCard,
    hookCardEvent.currentEventStep,
    hookSetEvent.setEvent.isTargetSecret,
    notSoFastEvent.isActivate,
    playerSelectsOneOfHisSecrets.isCurrPlayer,
  ]);

  const isSelectableSet = useCallback(
    (set: MatchSet) => {
      if (
        hookCardEvent.currentEventCard?.name === GAME_EVENTS.ANOTHER_VICTIM &&
        hookCardEvent.currentEventStep === EVENT_STEPS.SELECT_SET
      ) {
        // No puedes seleccionar tus propios sets
        if (set.player_id === player?.id) return false;

        // Aquí puedes añadir más lógica si es necesario (ej. no seleccionar sets de HARLEY QUIN)
        return true;
      } else if (
        !hookSetEvent.setEvent.isInEvent &&
        !hookSetEvent.setEvent.isValidSet &&
        hookSetEvent.setEvent.canDownTheCardToASet &&
        hookSetEvent.setEvent.cards.length === 1 &&
        hookSetEvent.setEvent.isSelectingSet
      ) {
        return hookSetEvent.isSetSelectableForSetEvent(set);
      }

      return false;
    },
    [
      hookCardEvent.currentEventCard,
      hookCardEvent.currentEventStep,
      hookSetEvent,
      player,
    ],
  );

  const isTargetSetEvent = useCallback(() => {
    return (
      (hookCardEvent.currentEventCard?.name === GAME_EVENTS.ANOTHER_VICTIM &&
        hookCardEvent.currentEventStep === EVENT_STEPS.SELECT_SET) ||
      hookSetEvent.setEvent.isSelectingSet
    );
  }, [
    hookCardEvent.currentEventCard,
    hookCardEvent.currentEventStep,
    hookSetEvent.setEvent.isSelectingSet,
  ]);

  const isEvent = useMemo(() => {
    return (
      hookSetEvent.setEvent.isInEvent ||
      hookSetEvent.setEvent.isSelectingSet ||
      hookCardEvent.isInEvent ||
      (pendingResponse.isPending &&
        pendingResponse.eventType === GAME_EVENTS.POINT_YOUR_SUSPICIONS)
    );
  }, [
    hookCardEvent.isInEvent,
    hookSetEvent.setEvent.isInEvent,
    hookSetEvent.setEvent.isSelectingSet,
    pendingResponse.eventType,
    pendingResponse.isPending,
  ]);

  // Memoizamos el valor del contexto para evitar renders innecesarios.
  // @see https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions
  const contextValue: LogicGameContextType = useMemo(
    () => ({
      isPlayerTurn,
      isEvent,

      secretsGroupByPlayerId,
      setsGroupByPlayerId,
      cardsGroupByPlayerId,

      cardsInDiscardPile,
      cardsInDraft,
      drawableCards,

      playerSets,
      playerSecrets,
      isInSocialDisgrace,

      hookSetEvent,
      hookCardEvent,

      getTarget,
      isSelectablePlayer,
      isSelectableSecret,
      isSelectableSet,

      isTargetPlayerEvent,
      isTargetSecretEvent,
      isTargetSetEvent,

      isOtherPlayersSecretSelectable,
      isCurrPlayersSecretSelectable,
    }),
    [
      isPlayerTurn,
      isEvent,

      secretsGroupByPlayerId,
      setsGroupByPlayerId,
      cardsGroupByPlayerId,

      cardsInDiscardPile,
      cardsInDraft,
      drawableCards,

      playerSets,
      playerSecrets,
      isInSocialDisgrace,

      hookSetEvent,
      hookCardEvent,

      getTarget,
      isSelectablePlayer,
      isSelectableSecret,
      isSelectableSet,

      isTargetPlayerEvent,
      isTargetSecretEvent,
      isTargetSetEvent,

      isOtherPlayersSecretSelectable,
      isCurrPlayersSecretSelectable,
    ],
  );

  return (
    <LogicGameContext.Provider value={contextValue}>
      {children}
    </LogicGameContext.Provider>
  );
}

export function useLogicGame() {
  return useContext(LogicGameContext);
}
