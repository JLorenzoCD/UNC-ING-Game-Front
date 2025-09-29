const BACKEND_ENDPOINTS = {
  GET_MATCHES: "/matches",
} as const;

const BACKEND_SOCKETS_EVENTS = {
  MATCHES: "match",
} as const;

export { BACKEND_ENDPOINTS, BACKEND_SOCKETS_EVENTS };
