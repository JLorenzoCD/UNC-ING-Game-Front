import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";

import type { MatchWithPlayerCount } from "@/types/match";
import type { UUID } from "@/types/common";

import {
  matchesReducer,
  initialMatchesState,
  type MatchesAction,
} from "./matchesReducer";

const existingMatches = [
  {
    id: "1" as UUID,
    name: "Match A",
    status: "WAITING",
    current_player_count: 2,
  },
  {
    id: "2" as UUID,
    name: "Match B",
    status: "WAITING",
    current_player_count: 4,
  },
] as MatchWithPlayerCount[];

const initialStateWithMatches = {
  ...initialMatchesState,
  loading: false,
  matches: existingMatches,
};

describe("matchesReducer", () => {
  it("handles FETCH_START: sets loading to true and error to false", () => {
    const state = { ...initialMatchesState, error: true, loading: false };
    const action: MatchesAction = { type: "FETCH_START" };
    const newState = matchesReducer(state, action);

    expect(newState.loading).toBe(true);
    expect(newState.error).toBe(false);
  });

  it("handles FETCH_SUCCESS: sets matches and loading to false", () => {
    const action: MatchesAction = {
      type: "FETCH_SUCCESS",
      payload: existingMatches,
    };
    const newState = matchesReducer(initialMatchesState, action);

    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(false);
    expect(newState.matches).toEqual(existingMatches);
  });

  it("handles FETCH_ERROR: sets error to true and loading to false", () => {
    const action: MatchesAction = { type: "FETCH_ERROR" };
    const newState = matchesReducer(initialMatchesState, action);

    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(true);
  });

  describe("AVAILABLE_MATCH_UPDATE (WebSocket Events)", () => {
    const newWaitingMatch = {
      id: "3" as UUID,
      name: "New Match",
      status: "WAITING",
      current_player_count: 1,
    } as MatchWithPlayerCount;
    const updatedMatch = {
      ...existingMatches[0],
      current_player_count: 6,
    } as MatchWithPlayerCount;
    const startedMatch = {
      ...existingMatches[0],
      status: "IN_PROGRESS",
    } as MatchWithPlayerCount;
    const newStartedMatch = {
      id: "4" as UUID,
      name: "Started Now",
      status: "IN_PROGRESS",
      current_player_count: 1,
    } as MatchWithPlayerCount;

    it('should add a match to the list if it does not exist and its status is "WAITING"', () => {
      const action: MatchesAction = {
        type: "AVAILABLE_MATCH_UPDATE",
        payload: newWaitingMatch,
      };
      const newState = matchesReducer(initialStateWithMatches, action);

      expect(newState.matches.length).toBe(3);
      expect(newState.matches).toContainEqual(newWaitingMatch);
    });

    it('should update a match if it exists and its status is "WAITING"', () => {
      const action: MatchesAction = {
        type: "AVAILABLE_MATCH_UPDATE",
        payload: updatedMatch,
      };
      const newState = matchesReducer(initialStateWithMatches, action);

      expect(newState.matches.length).toBe(2);
      expect(
        newState.matches.find((m) => m.id === ("1" as UUID))
          ?.current_player_count,
      ).toBe(6);
      expect(newState.matches.find((m) => m.id === ("2" as UUID))).toEqual(
        existingMatches[1],
      );
    });

    it('should remove a match if it exists and its status changes to NOT "WAITING" (e.g., "IN_PROGRESS")', () => {
      const action: MatchesAction = {
        type: "AVAILABLE_MATCH_UPDATE",
        payload: startedMatch,
      };
      const newState = matchesReducer(initialStateWithMatches, action);

      expect(newState.matches.length).toBe(1);
      expect(newState.matches).toEqual([existingMatches[1]]); // Only Match B remains
    });

    it('should ignore a match if it does not exist and its status is NOT "WAITING" (e.g., "IN_PROGRESS")', () => {
      const action: MatchesAction = {
        type: "AVAILABLE_MATCH_UPDATE",
        payload: newStartedMatch,
      };
      const newState = matchesReducer(initialStateWithMatches, action);

      expect(newState.matches.length).toBe(2);
      expect(newState.matches).toEqual(initialStateWithMatches.matches); // No changes
    });
  });
});
