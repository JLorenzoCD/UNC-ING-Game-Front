const FRONTEND_PATHS = {
  HOME: "/",
  PLAYER_CREATE: "/player/create",
  MATCH_LIST: "/matches/",
  MATCH_CREATE: "/match/create",

  MATCH_LOBBY: (id: string) => `/match/${id}/lobby`,
  MATCH_GAME: (id: string) => `/match/${id}/game`,
} as const;

export { FRONTEND_PATHS };
