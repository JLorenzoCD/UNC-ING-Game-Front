const BACKEND_ENDPOINTS = {
  GET_MATCHES: "/matches",
} as const;

const BACKEND_SOCKETS_EVENTS = {
  MATCHES_ADD: "matchAdd",
  MATCHES_REMOVE: "matchRemove",
  MATCHES_UPDATE: "matchUpdate",
} as const;

export { BACKEND_ENDPOINTS, BACKEND_SOCKETS_EVENTS };
