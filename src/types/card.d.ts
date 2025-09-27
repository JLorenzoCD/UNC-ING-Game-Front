import type { UUID } from './common'

export type CardName = "NOT SO FAST"
	| "PARKER PYNE"
	| "LADY EILEEN"
	| "TOMMY BERESFORD"
	| "TUPPENCE BERESFORD"
	| "HARLEY QUIN WILDCARD"
	| "ARIADNE OLIVER"
	| "HERCULE POIROT"
	| "MISS MARPLE"
	| "MR SATTERTHWAITE"
	| "CARDS OFF THE TABLE"
	| "ANOTHER VICTIM"
	| "DEAD CARD FOLLY"
	| "LOOK INTO THE ASHES"
	| "CARD TRADE"
	| "AND THEN THERE WAS ONE MORE"
	| "DELAY THE MURDERER ESCAPE"
	| "EARLY TRAIN TO PADDINGTON"
	| "POINT YOUR SUSPICIONS"
	| "BLACKMAILED"
	| "SOCIAL FAUX PAS"

export type CardType = "DETECTIVE" | "DEVIOUS" | "EVENT" | "INSTANT"

export interface Card {
	/**
	 * El identificador único de la carta, en formato UUID v4
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: UUID

	/**
	 * El nombre de la carta
	 * @example "HERCULE POIROT"
	 */
	name: CardName

	/**
	 * El tipo de carta
	 * @example "DETECTIVE"
	 */
	type: CardType
	
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

/**
 * Tipo extendido de MatchCard para poder utilizar
 * los campos de `name` y `description`, útiles en
 * distintos componentes. 
 */
export type GameCard = MatchCard & Card