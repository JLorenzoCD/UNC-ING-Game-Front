import type { UUID } from './common'

export interface Card {
	/**
	 * El identificador único de la carta, en formato UUID v4
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: UUID

	/**
	 * El nombre de la carta
	 * @example "POIROT"
	 */
	name: string

	/**
	 * La descripción de la carta
	 * @example "Un detective belga famoso por su intelecto y sus métodos poco convencionales."
	 */
	description: string
}

export interface MatchCard {
	/**
	 * El identificador único de la carta en la partida, en formato UUID v4
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: UUID

	/**
	 * El identificador único de la carta, en formato UUID v4
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	card_id: UUID

	/**
	 * El identificador único de la partida, en formato UUID v4
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	match_id: UUID

	/**
	 * El identificador único del jugador que tiene la carta, en formato UUID v4
	 * Si es nulo, la carta está en el mazo regular o en el de descarte.
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	player_id: UUID | null

	/**
	 * Indica si la carta ha sido descartada
	 * @example false
	 */
	is_discarded: boolean
}
