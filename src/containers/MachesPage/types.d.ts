import type { Match } from '@/types/match'

export type MachListItem = Omit<Match, 'current_player_order'> & { current_palyer: number }
