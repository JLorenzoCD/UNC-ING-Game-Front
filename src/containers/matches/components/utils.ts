import { RANGE_PLAYERS } from './constantes'

import type { MatchListItem } from '../types'

export function isValidMatch(match: MatchListItem) {
	const isValidName = !!match.name.trim()
	const isValidPlayerCount = match.min_players <= match.max_players
	const isValidMinPlayersInRange = match.min_players >= RANGE_PLAYERS.MIN && match.min_players <= RANGE_PLAYERS.MAX
	const isValidMaxPlayersInRange = match.max_players >= RANGE_PLAYERS.MIN && match.max_players <= RANGE_PLAYERS.MAX
	const isValidCurrentPlayerCount = match.current_player <= match.max_players
	const isValidPlayerOrder = match.current_player_order < match.max_players
	const isWaiting = match.status.toUpperCase() === 'WAITING'

	return (
		isValidName &&
		isValidPlayerCount &&
		isValidMinPlayersInRange &&
		isValidMaxPlayersInRange &&
		isValidCurrentPlayerCount &&
		isValidPlayerOrder &&
		isWaiting
	)
}
