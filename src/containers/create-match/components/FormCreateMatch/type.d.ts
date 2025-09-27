export type MatchForm = Record<keyof Pick<Match, 'name' | 'min_players' | 'max_players'>, string>
export type MatchFormError = MatchForm
export type MatchToCreate = Pick<Match, 'name' | 'min_players' | 'max_players' | 'owner_id'>
