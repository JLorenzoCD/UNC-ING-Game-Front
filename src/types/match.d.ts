import type { UUID } from "./common";

export type MatchStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED";

export interface Match {
  /**
   * El identificador único de la partida, en formato UUID v4
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  id: UUID;

  /**
   * El nombre de la partida
   * @example "Partida de prueba"
   */
  name: string;

  /**
   * El estado actual de la partida
   * @example "pending"
   */
  status: MatchStatus;

  /**
   * El número mínimo de jugadores permitidos en la partida
   * @example 2 (el mínimo por reglas del juego)
   */
  min_players: number;

  /**
   * El número máximo de jugadores permitidos en la partida
   * @example 6 (el máximo por reglas del juego)
   */
  max_players: number;

  /**
   * El identificador único del usuario que creó la partida, en formato UUID v4
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  owner_id: UUID;

  /**
   * El orden del jugador que actualmente tiene el turno
   * @example 4
   */
  current_player_order: number;
}

export type MatchCreateInput = Pick<
  Match,
  "name" | "min_players" | "max_players" | "owner_id"
>;

export type MatchWithPlayerCount = Match & { current_player_count: number };
