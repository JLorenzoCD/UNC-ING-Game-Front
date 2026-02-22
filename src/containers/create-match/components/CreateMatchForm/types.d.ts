export type MatchForm = Record<
  keyof Pick<Match, "name" | "min_players" | "max_players"> | "password",
  string
>;

export type MatchFormError = MatchForm;
