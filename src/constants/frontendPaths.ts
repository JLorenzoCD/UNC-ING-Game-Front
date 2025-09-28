const FRONTEND_PATHS = {
	HOME: '/',
	MATCH_LIST: '/matches',
	MATCH_CREATE: '/match/create',

	MATCH_LOBBY: (id: string) => `/match/${id}/lobby`,
	MATCH_GAME: (id: string) => `/match/${id}/game`,
} as const

export { FRONTEND_PATHS }
