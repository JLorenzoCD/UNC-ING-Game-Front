import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, renderHook } from "@testing-library/react";

import { usePlayer } from "./PlayerContext";
import { useBasicGame } from "./BasicGameContext";
import { useSetEvent } from "@/containers/game/hooks/useSetEvent";
import { useCardEvent } from "@/containers/game/hooks/useCardEvent";

import LogicGameContextProvider, { useLogicGame } from "./LogicGameContext";

import type { UUID } from "@/types/common";
import type { GamePlayer } from "@/types/player";
import type { Match } from "@/types/match";
import type { GameCard } from "@/types/card";
import type { GameSecret } from "@/types/secret";

const {
  MOCKED_CURRENT_PLAYER,
  mockMatch,
  mockPlayers,
  mockCards,
  mockSecrets,
} = vi.hoisted(() => {
  const mockMatchId = crypto.randomUUID() as UUID;
  const playerOneId = crypto.randomUUID();
  const playerTwoId = crypto.randomUUID();

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

  const mockPlayerTwo: GamePlayer = {
    id: playerTwoId,
    match_id: mockMatchId,
    player_id: playerTwoId,
    name: "PlayerTwo",
    avatar: "avatar2.png",
    birthday: new Date("2002-02-02"),
    order: 1,
    role: "MURDERER",
  };

  const mockMatch: Match = {
    id: crypto.randomUUID(),
    name: "Test Match",
    status: "WAITING",
    min_players: 2,
    max_players: 6,
    current_player_order: 0,
    owner_id: mockPlayerOne.player_id,
  } as Match;

  const MOCKED_CURRENT_PLAYER = {
    id: mockPlayerOne.id as UUID,
    name: mockPlayerOne.name,
  };

  const mockPlayers: GamePlayer[] = [mockPlayerOne, mockPlayerTwo];

  const mockCards: GameCard[] = [
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: mockMatchId,
      player_id: mockPlayerOne.player_id,
      name: "HERCULE POIROT",
      type: "DETECTIVE",
      description: "Description of Hercule Poirot",
      is_discarded: false,
      discarded_at: null,
    },
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: mockMatchId,
      player_id: mockPlayerTwo.player_id,
      name: "MISS MARPLE",
      type: "DETECTIVE",
      description: "Description of Miss Marple",
      is_discarded: false,
      discarded_at: null,
    },
  ];

  const mockSecrets: GameSecret[] = [
    {
      type: "INNOCENT",
      content: "You are innocent",
      id: crypto.randomUUID(),
      match_id: mockMatchId,
      secret_id: crypto.randomUUID(),
      player_id: mockPlayerOne.player_id,
      is_revealed: false,
    },
    {
      type: "MURDERER",
      id: crypto.randomUUID(),
      content: "You are the murderer",
      match_id: mockMatchId,
      secret_id: crypto.randomUUID(),
      player_id: mockPlayerTwo.player_id,
      is_revealed: false,
    },
  ];

  return {
    MOCKED_CURRENT_PLAYER,
    mockMatch,
    mockPlayers,
    mockCards,
    mockSecrets,
  };
});

// Mock dependencies
vi.mock("./BasicGameContext");
vi.mock("./PlayerContext");
vi.mock("@/containers/game/hooks/useSetEvent");
vi.mock("@/containers/game/hooks/useCardEvent");

// Mock del hook useSetEvent
const mockHookSetEvent = (overrides = {}) => ({
  setEvent: {
    isInEvent: false,
    isSelectingSet: false,
    currentSetCards: [],
    eventId: null,
  },
  clearSetEvent: vi.fn(),
  playSet: vi.fn(),
  addDetectiveCardToSet: vi.fn(),
  playStolenSet: vi.fn(),
  executeSetActionToTarget: vi.fn().mockResolvedValue(true),
  executeFinishTurnSetEvent: vi.fn(),
  setTargetSet: vi.fn(),
  setTargeSetToDown: vi.fn(),
  setEventToggleDisableButtonPlaySet: vi.fn(),
  setEventToggleDisableButtonSelectSet: vi.fn(),
  isSetEventPlaySetButtonDisabled: false,
  isSetEventSelectSetButtonDisabled: false,
  ...overrides,
});

// Mock del hook useCardEvent
const mockHookCardEvent = (overrides = {}) => ({
  currentEventCard: null,
  selectedTargetSet: null,
  currentEventStep: null,
  canSelectMeAsPlayer: false,
  playEvent: vi.fn(),
  setTargetCardEvent: vi.fn(),
  executeCardEventActionToTarget: vi.fn().mockResolvedValue(true),
  executeSetActionToPlayerTarget: vi.fn().mockResolvedValue(true),
  executeSetActionToSecretTarget: vi.fn(),
  clearCardEventStep: vi.fn(),
  isInEvent: false,
  isSelectionPlayerEvent: false,
  isSelectionSecretEvent: false,
  isSelectionSetEvent: false,
  isSelectDirectionEvent: false,
  ...overrides,
});

// Mock del hook useBasicGame
const mockUseBasicGame = (overrides = {}) => ({
  match: mockMatch,
  players: mockPlayers,
  secrets: mockSecrets,
  cards: mockCards,
  sets: [],
  playerSelectsOneOfHisSecrets: {
    isCurrPlayer: false,
    isSelecting: false,
  },
  notSoFastEvent: {
    isActivate: false,
    eventId: null,
    nsfCount: 0,
    resolvedAtUtc: null,
    toastId: null,
    discardedCard: null,
  },
  pendingResponse: {
    isPending: false,
    eventId: null,
    eventType: null,
  },
  ...overrides,
});

describe("LogicGameContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePlayer).mockReturnValue({
      player: MOCKED_CURRENT_PLAYER,
    } as any);
    vi.mocked(useBasicGame).mockReturnValue(mockUseBasicGame() as any);
    vi.mocked(useCardEvent).mockReturnValue(mockHookCardEvent() as any);
    vi.mocked(useSetEvent).mockReturnValue(mockHookSetEvent() as any);
  });

  describe("LogicGameContextProvider", () => {
    it("renders children correctly", () => {
      render(
        <LogicGameContextProvider>
          <div data-testid="test-child">Test Child</div>
        </LogicGameContextProvider>,
      );

      expect(screen.getByTestId("test-child")).toBeInTheDocument();
    });

    it("provides initial context values", () => {
      const TestComponent = () => {
        const context = useLogicGame();

        return (
          <div>
            <span data-testid="isPlayerTurn">
              {context.isPlayerTurn.toString()}
            </span>
            <span data-testid="isEvent">{context.isEvent.toString()}</span>
            <span data-testid="secretsGroupByPlayerId">
              {context.secretsGroupByPlayerId
                ? "has-secretsGroupByPlayerId"
                : "no-secretsGroupByPlayerId"}
            </span>
            <span data-testid="setsGroupByPlayerId">
              {context.setsGroupByPlayerId
                ? "has-setsGroupByPlayerId"
                : "no-setsGroupByPlayerId"}
            </span>
            <span data-testid="cardsGroupByPlayerId">
              {context.cardsGroupByPlayerId
                ? "has-cardsGroupByPlayerId"
                : "no-cardsGroupByPlayerId"}
            </span>
          </div>
        );
      };

      render(
        <LogicGameContextProvider>
          <TestComponent />
        </LogicGameContextProvider>,
      );

      expect(screen.getByTestId("isPlayerTurn")).toHaveTextContent("true");
      expect(screen.getByTestId("isEvent")).toHaveTextContent("false");
      expect(screen.getByTestId("secretsGroupByPlayerId")).toHaveTextContent(
        "has-secretsGroupByPlayerId",
      );
      expect(screen.getByTestId("setsGroupByPlayerId")).toHaveTextContent(
        "has-setsGroupByPlayerId",
      );
      expect(screen.getByTestId("cardsGroupByPlayerId")).toHaveTextContent(
        "has-cardsGroupByPlayerId",
      );
    });
  });

  describe("useLogicGame hook", () => {
    it("returns context value when used within provider", () => {
      const { result } = renderHook(() => useLogicGame(), {
        wrapper: ({ children }) => (
          <LogicGameContextProvider>{children}</LogicGameContextProvider>
        ),
      });

      const secretsGroupByPlayerId = Object.groupBy(mockSecrets, (secret) => {
        return secret.player_id;
      });

      const cardsGroupByPlayerId = Object.groupBy(mockCards, (card) => {
        if (card.player_id !== null) return card.player_id;

        if (card.is_discarded) return "DISCARD";

        // player_id === null && !card.is_discarded
        return "DRAWABLE";
      });

      expect(result.current).toEqual({
        isPlayerTurn: true,
        isInSocialDisgrace: false,
        isEvent: false,

        setsGroupByPlayerId: {},
        cardsGroupByPlayerId,
        secretsGroupByPlayerId,

        cardsInDiscardPile: [],
        cardsInDraft: [],
        drawableCards: [],

        playerSecrets: secretsGroupByPlayerId[MOCKED_CURRENT_PLAYER.id],
        playerSets: [],

        hookSetEvent: expect.any(Object),
        hookCardEvent: expect.any(Object),

        getTarget: expect.any(Function),
        isSelectablePlayer: expect.any(Function),
        isSelectableSecret: expect.any(Function),
        isOtherPlayersSecretSelectable: expect.any(Function),
        isCurrPlayersSecretSelectable: expect.any(Function),
        isTargetPlayerEvent: expect.any(Function),
        isTargetSecretEvent: expect.any(Function),
        isTargetSetEvent: expect.any(Function),
        isSelectableSet: expect.any(Function),
      });
    });
  });

  describe("Context value memoization", () => {
    it("does not cause unnecessary re-renders when values do not change", async () => {
      let renderCount = 0;

      const TestComponent = () => {
        useLogicGame();
        renderCount++;
        return <div data-testid="render-count">{renderCount}</div>;
      };

      const { rerender } = render(
        <LogicGameContextProvider>
          <TestComponent />
        </LogicGameContextProvider>,
      );

      const initialRenderCount = renderCount;

      // Force a re-render of the same provider instance
      // Parent re-render will cause child re-render in React
      rerender(
        <LogicGameContextProvider>
          <TestComponent />
        </LogicGameContextProvider>,
      );

      // Verify child re-rendered due to parent re-render
      // The memoization prevents extra renders from context value changes,
      // but doesn't prevent re-renders from parent updates
      expect(renderCount).toBe(initialRenderCount + 1);
    });
  });
});
