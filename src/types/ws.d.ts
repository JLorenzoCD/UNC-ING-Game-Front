import type { UUID } from "./common";
import type { GameCard } from "./card";
import type { Match, MatchWithPlayerCount } from "./match";
import type { MatchSecret } from "./secret";
import type { MatchSet } from "./set";
import type { Player } from "./player";
import { BACKEND_SOCKETS_EVENTS } from "@/constants/backend";

type MatchCompletedReason = "deck_finished" | "murderer_revealed";

/** Payload del evento de conexión */
export type EventConnectionPayload = boolean;

/** Payload del evento de cambio de turno */
export type EventTurnPayload = Match;

/** Payload del evento de actualización de cartas */
export type EventCardsPayload = GameCard[];

/** Payload del evento de actualización de partida */
export type EventMatchPayload = MatchWithPlayerCount | { status: Match };

/** Payload del evento de jugador uniéndose al lobby */
export type EventLobbyJoinPayload = Player;

/** Payload del evento de carta de evento jugada */
export interface EventCardEventPayload {
  /**
   * Tipo de evento de carta (ej. "DELAY THE MURDERER ESCAPE")
   */
  type: string;

  /**
   * Carta descartada en este evento
   */
  discarded_card_event: GameCard;

  /**
   * Cartas actualizadas en este evento.
   */
  updated_match_cards: GameCard[];

  /**
   * Secreto actualizado en este evento (opcional)
   */
  updated_secret?: MatchSecret;

  /**
   * Set actualizado en este evento (opcional)
   */
  updated_set?: MatchSet;
}

/** Payload del evento de creación/actualización de set */
export type EventSetPayload = MatchSet & { deleted_cards?: UUID[] };

/** Payload del evento de revelación de secreto de jugador */
export interface EventPlayerSecretRevealPayload {
  target_player_id: UUID;
}

/** Payload del evento de actualización de secreto */
export type EventSecretPayload = MatchSecret;

/** Payload del evento de partida completada */
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

/** Payload del evento de error */
export interface EventErrorPayload {
  type: string;
  message?: string;
}

/** Payload para la instantanea not so fast */
export interface EventNotSoFastPayload {
  /**
   * La ID del jugador que juega el evento o set.
   */
  player_id: UUID;

  /**
   * La ID del evento.
   */
  event_id: UUID;

  /**
   * El nombre del evento o set que se quiere jugar.
   */
  event_type: string;

  /**
   * El numero de nsf por el que va.
   */
  nsf_count: number;

  /**
   * El hora a la que termina el evento.
   */
  resolve_at_utc: string;

  /**
   * La carta que se descarta.
   */
  discarded_card: GameCard | null;
}

export interface EventCanceledPayload {
  /**
   * La id del evento.
   */
  event_id: UUID;

  /**
   * Nombre del evento cancelado.
   */
  event_type: string;

  /**
   * Mensaje de cancelación.
   */
  message: string;

  /**
   * La carta del evento cancelado.
   */
  discarded_card: GameCard | null;
}
/**
 * Mapa de tipos para eventos de WebSocket.
 * Asocia cada nombre de evento con el tipo de su payload correspondiente.
 * Esto garantiza type-safety al manejar eventos del WebSocket.
 */
export interface WebSocketEventMap {
  [BACKEND_SOCKETS_EVENTS.TURN]: EventTurnPayload;
  [BACKEND_SOCKETS_EVENTS.CARDS]: EventCardsPayload;
  [BACKEND_SOCKETS_EVENTS.MATCH]: EventMatchPayload;
  [BACKEND_SOCKETS_EVENTS.LOBBY_JOIN]: EventLobbyJoinPayload;
  [BACKEND_SOCKETS_EVENTS.CARD_EVENT]: EventCardEventPayload;
  [BACKEND_SOCKETS_EVENTS.SET]: EventSetPayload;
  [BACKEND_SOCKETS_EVENTS.PLAYER_SECRET_REVEAL]: EventPlayerSecretRevealPayload;
  [BACKEND_SOCKETS_EVENTS.SECRET]: EventSecretPayload;
  [BACKEND_SOCKETS_EVENTS.MATCH_COMPLETED]: EventMatchCompletedPayload;
  [BACKEND_SOCKETS_EVENTS.CANCELLATION_WINDOW_OPEN]: EventNotSoFastPayload;
  [BACKEND_SOCKETS_EVENTS.CANCELED]: EventCanceledPayload;
  connection: EventConnectionPayload;
  error: EventErrorPayload;
}

/**
 * Tipo para callbacks de eventos de WebSocket.
 * Infiere automáticamente el tipo correcto del payload según el nombre del evento.
 */
export type WebSocketEventCallback<K extends keyof WebSocketEventMap> = (
  data: WebSocketEventMap[K],
) => void;
