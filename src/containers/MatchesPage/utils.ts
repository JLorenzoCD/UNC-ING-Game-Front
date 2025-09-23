import { RANGE_PLAYERS } from './components/constantes'

import type { MatchListItem } from './types'

export function isValidMatch(match: MatchListItem) {
	return (
		match.name.trim() ||
		match.min_players <= match.max_players ||
		(match.min_players >= RANGE_PLAYERS.MIN && match.min_players <= RANGE_PLAYERS.MAX) ||
		(match.max_players >= RANGE_PLAYERS.MIN && match.max_players <= RANGE_PLAYERS.MAX) ||
		match.current_palyer <= match.max_players ||
		match.current_player_order < match.max_players ||
		match.status == 'pending'
	)
}
