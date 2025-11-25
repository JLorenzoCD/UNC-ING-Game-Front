import "@testing-library/jest-dom";
import { renderHook, type Match } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { usePlayer } from "@/contexts/PlayerContext";
import { useBasicGame } from "@/contexts/BasicGameContext";

import type { UUID } from "@/types/common";

import { useCardEvent } from "./useCardEvent";
import type { GamePlayer } from "@/types/player";

const { mockHttpService, MOCKED_CURRENT_PLAYER, mockMatch } = vi.hoisted(() => {
  // Mocks de Servicios
  const mockPostPointYourSuspicions = vi.fn();
  const mockPostEvent = vi.fn();
  const mockHttpService = {
    postPointYourSuspicions: mockPostPointYourSuspicions,
    postEvent: mockPostEvent,
  };

  const mockMatchId = crypto.randomUUID() as UUID;
  const playerOneId = crypto.randomUUID();

  const mockPlayerOne: GamePlayer = {
    id: playerOneId,
    match_id: mockMatchId,
    player_id: playerOneId,
    name: "PlayerOne",
    avatar: "avatar1.png",
    birthday: new Date("2001-01-01"),
    order: 0,
    role: "INNOCENT",
  };

  const MOCKED_CURRENT_PLAYER = {
    id: mockPlayerOne.id as UUID,
    name: mockPlayerOne.name,
  };

  const mockMatch = {
    id: mockMatchId,
    name: "Test Match",
    status: "WAITING",
    min_players: 2,
    max_players: 6,
    current_player_order: 0,
    owner_id: playerOneId as UUID,
  } as any as Match;

  return { mockHttpService, MOCKED_CURRENT_PLAYER, mockMatch };
});

vi.mock("@/contexts/HttpServiceContext", () => ({
  useHttpService: vi.fn(() => ({ httpService: mockHttpService })),
}));

vi.mock("sonner", () => {
  const mockToast = {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    custom: vi.fn(),
  };

  const mainToastFunction = vi.fn();
  Object.assign(mainToastFunction, mockToast);

  return {
    toast: mainToastFunction,
  };
});
vi.mock("@/contexts/BasicGameContext");
vi.mock("@/contexts/PlayerContext");

const mockUseBasicGameValue = (overrides = {}) => ({
  match: mockMatch,
  pendingResponse: {
    isPending: false,
    eventId: null,
    eventType: null,
  },
  clearPendingResponse: vi.fn(),
  playerFinishActionTurn: vi.fn(),
  ...overrides,
});

describe("useCardEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePlayer).mockReturnValue({
      player: MOCKED_CURRENT_PLAYER,
    } as any);
    vi.mocked(useBasicGame).mockReturnValue(mockUseBasicGameValue() as any);
  });

  it("should initialize to default state", () => {
    const { result } = renderHook(() => useCardEvent());

    expect(result.current).toEqual({
      currentEventCard: null,
      selectedTargetPlayer: null,
      selectedTargetSecret: null,
      selectedTargetSet: null,
      currentEventStep: null,
      canSelectMeAsPlayer: false,

      isInEvent: false,

      playEvent: expect.any(Function),
      setTargetCardEvent: expect.any(Function),
      executeCardEventActionToTarget: expect.any(Function),
      executeSetActionToPlayerTarget: expect.any(Function),
      executeSetActionToSecretTarget: expect.any(Function),
      clearCardEventStep: expect.any(Function),
    });
  });
});
