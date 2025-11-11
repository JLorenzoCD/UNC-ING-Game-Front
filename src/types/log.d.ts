/**
 * @see /backend/src/app/matches/models.py
 */
export type MatchLogEventType =
  | "Player Join"
  | "Player Quit"
  | "Turn"
  | "Hercule Poirot"
  | "Miss Marple"
  | "Mr Satterthwaite"
  | "Mr Satterthwaite & Quin"
  | "Parker Pyne"
  | "Lady Eileen"
  | "Tommy Beresford"
  | "Tuppence Beresford"
  | "Two Beresford"
  | "Ariadne Oliver"
  | "Cards Off The Table"
  | "Another Victim"
  | "Dead Card Folly"
  | "Look Into The Ashes"
  | "Card Trade"
  | "And Then There Was One More"
  | "Delay The Murderer Escape"
  | "Early Train To Paddington"
  | "Point Your Suspicions"
  | "Blackmailed"
  | "Social Faux Pas"
  | "Discard Cards"
  | "Take Cards";

export interface MatchLog {
  /**
   * La ID del log.
   */
  id: UUID;

  /**
   * La ID de la partida.
   */
  match_id: UUID;

  /**
   * El mensaje del log.
   */
  message: string;

  /**
   * La fecha de creación del log.
   */
  created_at: Date;

  /**
   * La ID del jugador asociado al log (si aplica).
   */
  player_id: UUID | null;

  /**
   * El tipo de evento del log.
   */
  event_type: MatchLogEventType;
}
