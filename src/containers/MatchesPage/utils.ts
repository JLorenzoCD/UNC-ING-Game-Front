import type { MatchListItem } from './types'

export function isInvalidMatch(match: MatchListItem) {
	return (
		match.max_players < match.min_players ||
		!match.name.trim() ||
		match.current_palyer < match.min_players ||
		match.current_palyer > match.max_players ||
		match.current_player_order != null ||
		match.status != 'pending'
	)
}
