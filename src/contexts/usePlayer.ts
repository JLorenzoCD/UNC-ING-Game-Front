import type { UUID } from '@/types/common'

export interface PlayerData {
	playerId: UUID
}

export function usePlayer() {
	const playerId = crypto.randomUUID() as UUID
	const playerData = { playerId } as PlayerData | null

	if (playerData == null) {
		throw new Error('It is not possible to use this hook if there is no player.')
	}

	return playerData
}
