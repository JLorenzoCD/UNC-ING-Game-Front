import type { UUID } from "./common";

export type SetType =
  | "Parker_Pyner"
  | "Lady_Eileen"
  | "One_Beresford"
  | "Two_Beresford"
  | "Hercule_Poirot"
  | "Miss_Marple"
  | "Mr_Satterthwaite";

export interface MatchSet {
  /**
   * El identificador único del set en la partida, en formato UUID v4.
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  id: UUID;

  /**
   * El tipo del set.
   * @example "Lady_Eileen"
   */
  type: SetType;

  /**
   * El identificador único del jugador que tiene el set, en formato UUID v4.
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  player_id: UUID;

  /**
   * El identificador único de la partida, en formato UUID v4.
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  match_id: UUID;

  /**
   * Indica si el set a sido bajado con al menos 1 comodín.
   * @example false
   */
  quin_play: boolean;
}
