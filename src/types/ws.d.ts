import type { UUID } from "./common";

type MatchCompletedReason = "deck_finished" | "murderer_revealed";

export interface EventMatchCompletedPayload {
  /**
   * La ID de la partida que se completó.
   */
  match_id: UUID;

  /**
   * La ID del secreto del asesino.
   */
  secret_murderer_id: UUID;

  /**
   * La ID del secreto del cómplice.
   */
  secret_accomplice_id: UUID | null;

  /**
   * La razón de porqué terminó la partida.
   */
  reason: MatchCompletedReason;

  /**
   * Los detalles de como terminó la partida.
   */
  details: string;
}
