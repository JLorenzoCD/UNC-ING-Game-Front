import type { UUID } from "@/types/common";

const BACKEND_ENDPOINTS = {
  CREATE_PLAYER: "/players",
  GET_PLAYER: (playerId: UUID) => `/players/${playerId}`,

  GET_MATCHES: "/matches",
  CREATE_MATCHES: "/matches",
  GET_MATCH: (matchId: UUID) => `/matches/${matchId}`,
  GET_MATCH_CARDS: (matchId: UUID) => `/matches/${matchId}/cards`,
  GET_MATCH_SECRETS: (matchId: UUID) => `/matches/${matchId}/secrets`,
  GET_MATCH_PLAYERS: (matchId: UUID) => `/matches/${matchId}/players`,
  GET_MATCH_SETS: (matchId: UUID) => `/matches/${matchId}/sets`,
  GET_MATCH_LOGS: (matchId: UUID) => `/matches/${matchId}/logs`,

  JOIN_MATCH: (matchId: UUID, playerId: UUID) =>
    `/matches/${matchId}/join?player_id=${playerId}`,

  CANCEL_MATCH: (matchId: UUID, ownerId: UUID) =>
    `/matches/${matchId}/cancel?owner_id=${ownerId}`,

  QUIT_MATCH: (matchId: UUID, playerId: UUID) =>
    `/matches/${matchId}/quit?player_id=${playerId}`,

  START_MATCH: (matchId: UUID) => `/matches/${matchId}/start`,

  TAKE_CARDS: (matchId: UUID) => `/matches/${matchId}/cards/take`,

  DISCARD_CARDS: (matchId: UUID) => `/matches/${matchId}/cards/discard`,

  PASS_TURN: (matchId: UUID) => `/matches/${matchId}/pass_turn`,

  PLAY_EVENT: (matchId: UUID) => `/matches/${matchId}/events`,

  CREATE_AND_PLAY_SET: (matchId: UUID) => `/matches/${matchId}/sets`,
  DOWN_CARD_AND_PLAY_SET: (matchId: UUID, setId: UUID) =>
    `/matches/${matchId}/sets/${setId}`,
  PLAY_STOLEN_SET: (matchId: UUID, setId: UUID) =>
    `/matches/${matchId}/sets/${setId}/stolen`,

  PUT_SECRET: (matchId: UUID, secretId: UUID) =>
    `/matches/${matchId}/secrets/${secretId}`,

  PLAY_NOT_SO_FAST: (matchId: UUID) => `/matches/${matchId}/not_so_fast`,

  CARD_TRADE: (matchId: UUID) => `/matches/${matchId}/card_trade`,

  TIMEOUT: (matchId: UUID, playerId: UUID) =>
    `/matches/${matchId}/timeout/${playerId}`,

  POINT_YOUR_SUSPICIONS: (matchId: UUID) =>
    `/matches/${matchId}/point_your_suspicions`,

  DEAD_CARD_FOLLY: (matchId: UUID) => `/matches/${matchId}/dead_card_folly`,
} as const;

const BACKEND_SOCKETS_EVENTS = {
  TURN: "turn",
  CARDS: "cards",
  MATCH: "match",
  LOBBY_JOIN: "player_join",
  LOBBY_QUIT: "player_quit",
  CARD_EVENT: "card_event",
  SET: "set",
  PLAYER_SECRET_REVEAL: "player_secret_reveal",
  SECRET: "secret",
  MATCH_COMPLETED: "match_completed",
  CANCELLATION_WINDOW_OPEN: "cancellation_window_open",
  CANCELED: "event_cancelled",
  PENDING_RESPONSE: "pending_target_response",
  LOG: "new_log",

  SUBSCRIBE_TO_MATCH_EVENTS: "subscribe_match",
  UNSUBSCRIBE_TO_MATCH_EVENTS: "unsubscribe_match",
} as const;

export { BACKEND_ENDPOINTS, BACKEND_SOCKETS_EVENTS };
