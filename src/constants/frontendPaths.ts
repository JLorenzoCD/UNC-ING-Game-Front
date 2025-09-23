const FRONTEND_PATHS = {
	HOME: '/',
	MATCH_LIST: '/match',
	MATCH_CREATE: '/match/create',

	MATCH_LOBBY: (id: string) => `/match/${id}/lobby`,
} as const

export { FRONTEND_PATHS }
