import { createContext, useContext, useMemo, type ReactNode } from "react";

import { usePlayer } from "./PlayerContext";
import { useBasicGame } from "./BasicGameContext";
import { useSetEvent } from "@/containers/game/hooks/useSetEvent";

import { GAME_RULES } from "@/constants/game";

import type { GameSecret } from "@/types/secret";
import type { UUID } from "@/types/common";
import type { MatchSet } from "@/types/set";
import type { GameCard } from "@/types/card";
import { useCardEvent } from "@/containers/game/hooks/useCardEvent";

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
}

const LogicGameContext = createContext<LogicGameContextType>({
  isPlayerTurn: false,
  isInSocialDisgrace: false,

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
});

export interface LogicGameContextProviderProps {
  children: ReactNode;
}

export default function GameContextProvider({
  children,
}: LogicGameContextProviderProps) {
  const { player } = usePlayer();
  const { match, players, secrets, cards, sets } = useBasicGame();
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

  // Memoizamos el valor del contexto para evitar renders innecesarios.
  // @see https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions
  const contextValue: LogicGameContextType = useMemo(
    () => ({
      isPlayerTurn,

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
    }),
    [
      isPlayerTurn,

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
