import type { UUID } from "@/types/common";

const BACKEND_ENDPOINTS = {
  CREATE_PLAYER: "/players",

  GET_MATCHES: "/matches",
  CREATE_MATCHES: "/matches",
  GET_MATCH: (matchId: UUID) => `/matches/${matchId}`,
  GET_MATCH_CARDS: (matchId: UUID) => `/matches/${matchId}/cards`,
  GET_MATCH_SECRETS: (matchId: UUID) => `/matches/${matchId}/secrets`,
  GET_MATCH_PLAYERS: (matchId: UUID) => `/matches/${matchId}/players`,

  JOIN_MATCH: (matchId: UUID, playerId: UUID) =>
    `/matches/${matchId}/join?player_id=${playerId}`,
  START_MATCH: (matchId: UUID, playerId: UUID) =>
    `/matches/${matchId}/start?player_id=${playerId}`,
} as const;

const BACKEND_SOCKETS_EVENTS = {
  MATCHES: "match",
  LOBBY_JOIN: "player_join",
} as const;

export { BACKEND_ENDPOINTS, BACKEND_SOCKETS_EVENTS };
