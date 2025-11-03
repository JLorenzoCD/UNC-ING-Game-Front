import type { CardName } from "@/types/card";

/**
 * Cartas de evento - Subconjunto de las cartas del juego
 * Se utiliza en toda la lógica del juego para evitar cadenas mágicas
 */
export const GAME_EVENTS: Record<string, CardName> = {
  CARDS_OFF_THE_TABLE: "CARDS OFF THE TABLE",
  ANOTHER_VICTIM: "ANOTHER VICTIM",
  LOOK_INTO_THE_ASHES: "LOOK INTO THE ASHES",
  AND_THEN_THERE_WAS_ONE_MORE: "AND THEN THERE WAS ONE MORE",
  DELAY_THE_MURDERER_ESCAPE: "DELAY THE MURDERER ESCAPE",
  EARLY_TRAIN_TO_PADDINGTON: "EARLY TRAIN TO PADDINGTON",
} as const;

/**
 * Tipos de pasos de evento utilizados en flujos de múltiples pasos de cartas de evento
 */
export const EVENT_STEPS = {
  SELECT_SECRET: "select_secret",
  SELECT_PLAYER: "select_player",
  SELECT_SET: "select_set",
} as const;

export type EventStep = (typeof EVENT_STEPS)[keyof typeof EVENT_STEPS] | null;

/**
 * Reglas y configuración del juego
 */
export const GAME_RULES = {
  /**
   * Máximo número de cartas que un jugador puede tener en su mano
   */
  HAND_SIZE: 6,

  /**
   * Número de cartas visibles en el área de draft
   */
  DRAFT_SIZE: 3,
} as const;
