const BACKEND_ENDPOINTS = {
  GET_MATCHES: "/matches/",
  CREATE_MATCHES: "/matches/",

  JOIN_MATCH: (matchId: string) => `/matches/${matchId}/join`,
} as const;

const BACKEND_SOCKETS_EVENTS = {
  MATCHES: "match",
} as const;

export { BACKEND_ENDPOINTS, BACKEND_SOCKETS_EVENTS };
