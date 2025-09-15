export type SecretType = "accomplice" | "innocent" | "murderer" 

export interface Secret {
  /**
   * El identificador único del secreto, en formato UUID v4
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  id: string

  /**
   * El tipo de secreto
   * @example "murderer"
   */
  type: SecretType

  /**
   * El contenido del secreto
   * @example "Por las noches me gusta pasear por el cementerio"
   */
  content: string
}

export interface MatchSecret {
  /**
   * El identificador único del secreto en la partida, en formato UUID v4
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  id: string

  /**
   * El identificador único del secreto, en formato UUID v4
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  secret_id: string

  /**
   * El identificador único de la partida, en formato UUID v4
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  match_id: string

  /**
   * El identificador único del jugador que tiene el secreto, en formato UUID v4
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  player_id: string | null
}