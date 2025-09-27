import type { UUID } from './common'
import type { SecretType } from './secret'

export interface Player {
	/**
	 * El identificador único del usuario, en formato UUID v4
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: UUID

	/**
	 * El nombre del usuario
	 * @example "Hercule Poirot"
	 */
	name: string

	/**
	 * El nombre del archivo de avatar del usuario
	 * @example "poirot.png"
	 */
	avatar: string

	/**
	 * El cumpleaños del usuario, en formato ISO 8601
	 * @see https://es.wikipedia.org/wiki/ISO_8601
	 */
	birthday: Date
}

export interface MatchPlayer {
	/**
	 * El identificador único del jugador, en formato UUID v4
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	player_id: UUID

	/**
	 * El identificador único de la partida, en formato UUID v4
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	match_id: UUID

	/**
	 * El rol del jugador en la partida
	 * Si es nulo, el rol no ha sido asignado aún.
	 * @example "murderer"
	 * @see SecretType
	 */
	role: SecretType | null

	/**
	 * El orden del jugador en la partida
	 * Si es nulo, el orden no ha sido asignado aún.
	 * @example 1
	 */
	order: number | null
}

export type PlayerInput = Omit<Player, 'id'>;

export type GamePlayer = MatchPlayer & Player;