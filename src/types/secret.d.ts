import type { UUID } from "./common";

export type SecretType = "ACCOMPLICE" | "INNOCENT" | "MURDERER";

export interface Secret {
  /**
   * El identificador único del secreto, en formato UUID v4
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  id: UUID;

  /**
   * El tipo de secreto
   * @example "murderer"
   */
  type: SecretType;

  /**
   * El contenido del secreto
   * @example "Por las noches me gusta pasear por el cementerio"
   */
  content: string;
}

export interface MatchSecret {
  /**
   * El identificador único del secreto en la partida, en formato UUID v4
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  id: UUID;

  /**
   * El identificador único del secreto, en formato UUID v4
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  secret_id: UUID;

  /**
   * El identificador único de la partida, en formato UUID v4
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  match_id: UUID;

  /**
   * El identificador único del jugador que tiene el secreto, en formato UUID v4
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  player_id: UUID | null;

  /**
   * Indica si el secreto ha sido revelado
   * @example true
   */
  is_revealed: boolean;
}

/**
 * Tipo extendido de MatchCard para poder utilizar
 * los campos de `type` y `content`, útiles en
 * distintos componentes.
 */
export type GameSecret = MatchSecret & Secret;

export type SecretUpdateAction =
  | "steal_secret"
  | "hide_secret"
  | "reveal_secret";
