import { RANGE_PLAYERS } from "./constants";

import type { MatchStatus, MatchWithPlayerCount } from "@/types/match";

export function isValidMatch(
  match: MatchWithPlayerCount,
  matchStatusValid: MatchStatus[],
): boolean {
  const isValidName = !!match.name.trim();

  const isValidPlayerCount = match.min_players <= match.max_players;

  const isValidMinPlayersInRange =
    match.min_players >= RANGE_PLAYERS.MIN &&
    match.min_players <= RANGE_PLAYERS.MAX;

  const isValidMaxPlayersInRange =
    match.max_players >= RANGE_PLAYERS.MIN &&
    match.max_players <= RANGE_PLAYERS.MAX;

  const isValidCurrentPlayerCount =
    match.current_player_count <= match.max_players;

  const isValidPlayerOrder = match.current_player_order < match.max_players;

  const isValidStatus = matchStatusValid.includes(
    match.status.toUpperCase() as MatchStatus,
  );

  return (
    isValidName &&
    isValidPlayerCount &&
    isValidMinPlayersInRange &&
    isValidMaxPlayersInRange &&
    isValidCurrentPlayerCount &&
    isValidPlayerOrder &&
    isValidStatus
  );
}
