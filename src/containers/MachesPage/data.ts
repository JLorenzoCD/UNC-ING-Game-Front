import type { MachListItem } from './types'

export const initialStateMachesMock = [
	{
		id: crypto.randomUUID(),
		name: 'Prueba 1',
		status: 'pending',
		min_players: 2,
		max_players: 6,
		owner_id: crypto.randomUUID(),
		current_palyer: 5,
	},
	{
		id: crypto.randomUUID(),
		name: 'Prueba con nombre largo, pero muy muy largo',
		status: 'pending',
		min_players: 4,
		max_players: 6,
		owner_id: crypto.randomUUID(),
		current_palyer: 3,
	},
	{
		id: crypto.randomUUID(),
		name: 'OPENTOWORK',
		status: 'pending',
		min_players: 5,
		max_players: 5,
		owner_id: crypto.randomUUID(),
		current_palyer: 4,
	},
	{
		id: crypto.randomUUID(),
		name: 'Al pedo',
		status: 'pending',
		min_players: 3,
		max_players: 6,
		owner_id: crypto.randomUUID(),
		current_palyer: 4,
	},
] as MachListItem[]
