import type { UUID } from "@/types/common";

const BACKEND_ENDPOINTS = {
  GET_MATCHES: "/matches/",
  CREATE_MATCHES: "/matches/",

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
