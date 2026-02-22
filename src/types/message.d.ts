/**
 * @see /backend/src/app/matches/models.py
 */
export type MatchMsgEventType =
  | "Player Join"
  | "Player Quit"
  | "Player Send Message"
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

export interface MatchMessage {
  /**
   * La ID del msg.
   */
  id: UUID;

  /**
   * La ID de la partida.
   */
  match_id: UUID;

  /**
   * El mensaje del msg.
   */
  message: string;

  /**
   * La fecha de creación del msg.
   */
  created_at: Date;

  /**
   * La ID del jugador asociado al msg (si aplica).
   */
  player_id: UUID | null;

  /**
   * El tipo de evento del msg.
   */
  event_type: MatchMsgEventType;

  /**
   * Si es true, entonces es un mensaje del sistema, caso contrario, es de un jugador
   */
  is_system_msg: boolean;
}
