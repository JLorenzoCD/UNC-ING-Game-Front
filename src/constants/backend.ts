import type { UUID } from "@/types/common";

const BACKEND_ENDPOINTS = {
  CREATE_PLAYER: "/players",

  GET_MATCHES: "/matches",
  CREATE_MATCHES: "/matches",
  GET_MATCH: (matchId: UUID) => `/matches/${matchId}`,
  GET_MATCH_CARDS: (matchId: UUID) => `/matches/${matchId}/cards`,
  GET_MATCH_SECRETS: (matchId: UUID) => `/matches/${matchId}/secrets`,
  GET_MATCH_PLAYERS: (matchId: UUID) => `/matches/${matchId}/players`,
  GET_MATCH_SETS: (matchId: UUID) => `/matches/${matchId}/sets`,

  JOIN_MATCH: (matchId: UUID, playerId: UUID) =>
    `/matches/${matchId}/join?player_id=${playerId}`,

  START_MATCH: (matchId: UUID) => `/matches/${matchId}/start`,

  TAKE_CARDS: (matchId: UUID) => `/matches/${matchId}/cards/take`,

  DISCARD_CARDS: (matchId: UUID) => `/matches/${matchId}/cards/discard`,

  PASS_TURN: (matchId: UUID) => `/matches/${matchId}/pass_turn`,

  PLAY_EVENT: (matchId: UUID) => `/matches/${matchId}/events`,
  CREATE_AND_PLAY_SET: (matchId: UUID) => `/matches/${matchId}/sets`,

  PUT_SECRET: (matchId: UUID, secretId: UUID) =>
    `/matches/${matchId}/secrets/${secretId}`,
} as const;

const BACKEND_SOCKETS_EVENTS = {
  TURN: "turn",
  CARDS: "cards",
  MATCH: "match",
  LOBBY_JOIN: "player_join",
  CARD_EVENT: "card_event",
  SET: "set",
  PLAYER_SECRET_REVEAL: "player_secret_reveal",
  SECRET: "secret",
  MATCH_COMPLETED: "match_completed",
} as const;

export { BACKEND_ENDPOINTS, BACKEND_SOCKETS_EVENTS };
