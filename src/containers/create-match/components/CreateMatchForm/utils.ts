import { ERROR_MESSAGES, RANGE_PLAYERS } from "./constants";

import type { MatchForm, MatchFormError } from "./types";

const validateName = (name: string): string => {
  if (!name.trim()) {
    return ERROR_MESSAGES.NAME_EMPTY;
  }
  return "";
};

const validateMinPlayers = (min_players: number): string => {
  if (isNaN(min_players)) {
    return ERROR_MESSAGES.MIN_PLAYERS_EMPTY;
  }
  if (min_players < RANGE_PLAYERS.MIN || min_players > RANGE_PLAYERS.MAX) {
    return ERROR_MESSAGES.MIN_PLAYERS_OUT_RANGE;
  }
  return "";
};

const validateMaxPlayers = (max_players: number): string => {
  if (isNaN(max_players)) {
    return ERROR_MESSAGES.MAX_PLAYERS_EMPTY;
  }
  if (max_players < RANGE_PLAYERS.MIN || max_players > RANGE_PLAYERS.MAX) {
    return ERROR_MESSAGES.MAX_PLAYERS_OUT_RANGE;
  }
  return "";
};

const validateMinMaxRelation = (
  min: number,
  max: number,
): { min_players: string; max_players: string } => {
  if (max < min) {
    return {
      min_players: ERROR_MESSAGES.MIN_PLAYERS_GREATER_MAX_PLAYERS,
      max_players: ERROR_MESSAGES.MAX_PLAYERS_LESS_MIN_PLAYERS,
    };
  }
  return { min_players: "", max_players: "" };
};

export const validateForm = (data: MatchForm): MatchFormError => {
  const parsedMinPlayers = parseInt(data.min_players);
  const parsedMaxPlayers = parseInt(data.max_players);

  const nameError = validateName(data.name);
  const minPlayersError = validateMinPlayers(parsedMinPlayers);
  const maxPlayersError = validateMaxPlayers(parsedMaxPlayers);
  const minMaxRelationErrors = validateMinMaxRelation(
    parsedMinPlayers,
    parsedMaxPlayers,
  );

  return {
    name: nameError,
    min_players: minPlayersError || minMaxRelationErrors.min_players,
    max_players: maxPlayersError || minMaxRelationErrors.max_players,
  };
};
