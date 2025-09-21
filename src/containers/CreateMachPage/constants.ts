export const RANGE_PLAYERS = {
	MIN: 2,
	MAX: 6,
} as const
export const ERROR_MESSAGES = {
	NAME_EMPTY: 'The match "name" field cannot be empty.',
	MIN_PLAYERS_EMPTY: 'The match "minimum number of desired players" field cannot be empty.',
	MAX_PLAYERS_EMPTY: 'The match "maximum number of desired players" field cannot be empty.',
	MIN_PLAYERS_OUT_RANGE: `The "minimum number of desired players" must be between ${RANGE_PLAYERS.MIN} and ${RANGE_PLAYERS.MAX}.`,
	MAX_PLAYERS_OUT_RANGE: `The "maximum number of desired players" must be between ${RANGE_PLAYERS.MIN} and ${RANGE_PLAYERS.MAX}.`,
	MIN_PLAYERS_GREATER_MAX_PLAYERS:
		'The "minimum number of desired players" cannot be greater than the "maximum number of desired players".',
	MAX_PLAYERS_LESS_MIN_PLAYERS:
		'The "maximum number of desired players" cannot be less than the "minimum number of desired players".',
} as const
