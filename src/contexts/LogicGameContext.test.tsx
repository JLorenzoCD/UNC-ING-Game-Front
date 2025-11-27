import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";

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
  mockPlayerOne,
  mockPlayerTwo,
  mockSet,
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
    current_player_order: 0, // PlayerOne's turn
    owner_id: mockPlayerOne.player_id,
  } as Match;

  const MOCKED_CURRENT_PLAYER = {
    id: mockPlayerOne.id as UUID,
    name: mockPlayerOne.name,
  };

  const mockPlayers: GamePlayer[] = [mockPlayerOne, mockPlayerTwo];

  const mockCards = [
    // Cards for Player One (Hand)
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: mockMatchId,
      player_id: mockPlayerOne.player_id,
      name: "HERCULE POIROT",
      type: "DETECTIVE",
      description: "",
      is_discarded: false,
      discarded_at: null,
    },
    // Cards for Player Two (Hand)
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: mockMatchId,
      player_id: mockPlayerTwo.player_id,
      name: "MISS MARPLE",
      type: "DETECTIVE",
      description: "",
      is_discarded: false,
      discarded_at: null,
    },
    // Cards in Discard Pile
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: mockMatchId,
      player_id: null,
      name: "DISCARD_1",
      type: "DETECTIVE",
      description: "",
      is_discarded: true,
      discarded_at: new Date("2023-11-26T10:00:00Z"),
    },
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: mockMatchId,
      player_id: null,
      name: "DISCARD_2_LATEST",
      type: "DETECTIVE",
      description: "",
      is_discarded: true,
      discarded_at: new Date("2023-11-26T10:01:00Z"),
    },
    // Cards in Draw Pile (Drawable) - Enough to test DRAFT_SIZE=3
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: mockMatchId,
      player_id: null,
      name: "DRAW_1",
      type: "DETECTIVE",
      description: "",
      is_discarded: false,
      discarded_at: null,
    },
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: mockMatchId,
      player_id: null,
      name: "DRAW_2",
      type: "DETECTIVE",
      description: "",
      is_discarded: false,
      discarded_at: null,
    },
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: mockMatchId,
      player_id: null,
      name: "DRAW_3",
      type: "DETECTIVE",
      description: "",
      is_discarded: false,
      discarded_at: null,
    },
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: mockMatchId,
      player_id: null,
      name: "DRAW_4",
      type: "DETECTIVE",
      description: "",
      is_discarded: false,
      discarded_at: null,
    },
  ] as GameCard[];

  const mockSecrets = [
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
      type: "ALIBI",
      content: "You have an alibi",
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
  ] as GameSecret[];

  const mockSet = {
    id: crypto.randomUUID(),
    match_id: mockMatchId,
    player_id: mockPlayerTwo.player_id,
    type: "DETECTIVE",
    cards: [],
  };

  return {
    MOCKED_CURRENT_PLAYER,
    mockMatch,
    mockPlayers,
    mockCards,
    mockSecrets,
    mockPlayerOne,
    mockPlayerTwo,
    mockSet,
  };
});

vi.mock("./BasicGameContext");
vi.mock("./PlayerContext");
vi.mock("@/containers/game/hooks/useSetEvent");
vi.mock("@/containers/game/hooks/useCardEvent");

vi.mock("@/constants/game", () => ({
  GAME_EVENTS: {
    CARDS_OFF_THE_TABLE: "CARDS_OFF_THE_TABLE",
    CARD_TRADE: "CARD_TRADE",
    AND_THEN_THERE_WAS_ONE_MORE: "AND THEN THERE WAS ONE MORE",
    POINT_YOUR_SUSPICIONS: "POINT_YOUR_SUSPICIONS",
    ANOTHER_VICTIM: "ANOTHER_VICTIM",
  },
  EVENT_STEPS: {
    SELECT_PLAYER: "select_player",
    SELECT_SECRET: "select_secret",
    SELECT_SET: "select_set",
  },
  GAME_RULES: {
    DRAFT_SIZE: 3,
  },
}));

// Mock del hook useSetEvent
const mockHookSetEvent = (overrides = {}) => ({
  setEvent: {
    isInEvent: false,
    isSelectingSet: false,
    isTargetPlayer: false,
    isTargetSecret: false,
    isValidSet: false,
    canDownTheCardToASet: false,
    currentSetCards: [],
    eventId: null,
    set: null,
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
  getTargetSetEvent: vi.fn().mockReturnValue(null),
  isPlayerSelectableForSetEvent: vi.fn().mockReturnValue(false),
  isOtherPlayerSecretSelectableForSetEvent: vi.fn().mockReturnValue(false),
  isCurrPlayerSecretSelectableForSetEvent: vi.fn().mockReturnValue(false),
  isSetSelectableForSetEvent: vi.fn().mockReturnValue(false),
  ...overrides,
});

// Mock del hook useCardEvent
const mockHookCardEvent = (overrides = {}) => ({
  currentEventCard: null,
  selectedTargetPlayer: null, // Nuevo para pruebas
  selectedTargetSecret: null, // Nuevo para pruebas
  selectedTargetSet: null, // Nuevo para pruebas
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
  match: { ...mockMatch, current_player_order: 0 },
  players: mockPlayers,
  secrets: mockSecrets
    .filter((s) => s.player_id === mockPlayerOne.player_id)
    .concat(mockSecrets.filter((s) => s.player_id !== mockPlayerOne.player_id)),
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

  describe("useLogicGame hook", () => {
    it("returns context value when used within provider", () => {
      const { result } = renderHook(() => useLogicGame(), {
        wrapper: ({ children }) => (
          <LogicGameContextProvider>{children}</LogicGameContextProvider>
        ),
      });

      expect(result.current).toEqual({
        isPlayerTurn: true,
        isInSocialDisgrace: false,
        isEvent: false,

        setsGroupByPlayerId: expect.any(Object),
        cardsGroupByPlayerId: expect.any(Object),
        secretsGroupByPlayerId: expect.any(Object),

        cardsInDiscardPile: expect.any(Array),
        cardsInDraft: expect.any(Array),
        drawableCards: expect.any(Array),

        playerSecrets: expect.any(Array),
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

    describe("Computed Properties", () => {
      it("isPlayerTurn is true when current_player_order matches player's order", () => {
        const { result } = renderHook(() => useLogicGame(), {
          wrapper: LogicGameContextProvider,
        });

        expect(result.current.isPlayerTurn).toBe(true);
      });

      it("isPlayerTurn is false when current_player_order does not match player's order", () => {
        vi.mocked(useBasicGame).mockReturnValue(
          mockUseBasicGame({
            match: { ...mockMatch, current_player_order: 1 },
          }) as any, // PlayerTwo's turn
        );

        const { result } = renderHook(() => useLogicGame(), {
          wrapper: LogicGameContextProvider,
        });

        expect(result.current.isPlayerTurn).toBe(false);
      });

      it("cardsInDiscardPile returns sorted discarded cards (latest first)", () => {
        const { result } = renderHook(() => useLogicGame(), {
          wrapper: LogicGameContextProvider,
        });

        const cards = result.current.cardsInDiscardPile;
        expect(cards.length).toBe(2);
        // 'DISCARD_2_LATEST' tiene un discarded_at más reciente y debe ser el primero
        expect(cards[0].name).toBe("DISCARD_2_LATEST");
        expect(cards[1].name).toBe("DISCARD_1");
      });

      it("cardsInDraft returns only DRAFT_SIZE (3) cards from DRAWABLE pile", () => {
        const { result } = renderHook(() => useLogicGame(), {
          wrapper: LogicGameContextProvider,
        });

        const draft = result.current.cardsInDraft;
        expect(draft.length).toBe(3);
        expect(draft.map((c) => c.name)).toEqual([
          "DRAW_1",
          "DRAW_2",
          "DRAW_3",
        ]);
      });

      it("drawableCards returns all cards in the DRAWABLE pile", () => {
        const { result } = renderHook(() => useLogicGame(), {
          wrapper: LogicGameContextProvider,
        });

        const drawable = result.current.drawableCards;
        expect(drawable.length).toBe(4);
      });

      it("playerSecrets returns only current player's secrets", () => {
        const { result } = renderHook(() => useLogicGame(), {
          wrapper: LogicGameContextProvider,
        });

        expect(result.current.playerSecrets.length).toBe(2);
        expect(
          result.current.playerSecrets.every(
            (s) => s.player_id === MOCKED_CURRENT_PLAYER.id,
          ),
        ).toBe(true);
      });

      it("isInSocialDisgrace is false when not all secrets are revealed", () => {
        // Default secrets are not revealed
        const { result } = renderHook(() => useLogicGame(), {
          wrapper: LogicGameContextProvider,
        });

        expect(result.current.isInSocialDisgrace).toBe(false);
      });

      it("isInSocialDisgrace is true when all secrets are revealed", () => {
        const revealedSecrets = mockSecrets.map((s) => ({
          ...s,
          is_revealed: true,
        }));

        vi.mocked(useBasicGame).mockReturnValue(
          mockUseBasicGame({ secrets: revealedSecrets }) as any,
        );

        const { result } = renderHook(() => useLogicGame(), {
          wrapper: LogicGameContextProvider,
        });

        expect(result.current.isInSocialDisgrace).toBe(true);
      });

      describe("isEvent flag", () => {
        it("isEvent is true when hookSetEvent.setEvent.isInEvent is true", () => {
          vi.mocked(useSetEvent).mockReturnValue(
            mockHookSetEvent({ setEvent: { isInEvent: true } }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isEvent).toBe(true);
        });

        it("isEvent is true when hookCardEvent.isInEvent is true", () => {
          vi.mocked(useCardEvent).mockReturnValue(
            mockHookCardEvent({ isInEvent: true }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isEvent).toBe(true);
        });

        it("isEvent is true when pendingResponse is true for POINT_YOUR_SUSPICIONS", () => {
          vi.mocked(useBasicGame).mockReturnValue(
            mockUseBasicGame({
              pendingResponse: {
                isPending: true,
                eventType: "POINT_YOUR_SUSPICIONS",
              },
            }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isEvent).toBe(true);
        });

        it("isEvent is false when no event flag is active", () => {
          // Default mocks
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isEvent).toBe(false);
        });
      });
    });

    describe("Selector and Target Functions", () => {
      it("getTarget returns selectedTargetPlayer from CardEvent when SetEvent target is null", () => {
        const mockTarget = mockPlayerTwo;
        vi.mocked(useCardEvent).mockReturnValue(
          mockHookCardEvent({ selectedTargetPlayer: mockTarget }) as any,
        );

        const { result } = renderHook(() => useLogicGame(), {
          wrapper: LogicGameContextProvider,
        });

        expect(result.current.getTarget()).toBe(mockTarget);
      });

      describe("isTargetPlayerEvent", () => {
        it("returns true when hookSetEvent.setEvent.isTargetPlayer is true", () => {
          vi.mocked(useSetEvent).mockReturnValue(
            mockHookSetEvent({ setEvent: { isTargetPlayer: true } }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isTargetPlayerEvent()).toBe(true);
        });

        it("returns true when CardEvent CARDS_OFF_THE_TABLE is active", () => {
          vi.mocked(useCardEvent).mockReturnValue(
            mockHookCardEvent({
              currentEventCard: { name: "CARDS_OFF_THE_TABLE" },
            }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isTargetPlayerEvent()).toBe(true);
        });

        it("returns true when pendingResponse is POINT_YOUR_SUSPICIONS", () => {
          vi.mocked(useBasicGame).mockReturnValue(
            mockUseBasicGame({
              pendingResponse: {
                isPending: true,
                eventType: "POINT_YOUR_SUSPICIONS",
              },
            }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isTargetPlayerEvent()).toBe(true);
        });

        it("returns false when notSoFastEvent.isActivate is true, even with other targets", () => {
          vi.mocked(useSetEvent).mockReturnValue(
            mockHookSetEvent({ setEvent: { isTargetPlayer: true } }) as any,
          );
          vi.mocked(useBasicGame).mockReturnValue(
            mockUseBasicGame({ notSoFastEvent: { isActivate: true } }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isTargetPlayerEvent()).toBe(false);
        });
      });

      describe("isSelectablePlayer", () => {
        it("returns true for other players during CARDS_OFF_THE_TABLE event", () => {
          vi.mocked(useCardEvent).mockReturnValue(
            mockHookCardEvent({
              currentEventCard: { name: "CARDS_OFF_THE_TABLE" },
            }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });

          // Check current player (PlayerOne) - should be false
          expect(result.current.isSelectablePlayer(mockPlayerOne)).toBe(false);
          // Check other player (PlayerTwo) - should be true
          expect(result.current.isSelectablePlayer(mockPlayerTwo)).toBe(true);
        });

        it("returns true for all players during AND THEN THERE WAS ONE MORE (SELECT_PLAYER step)", () => {
          vi.mocked(useCardEvent).mockReturnValue(
            mockHookCardEvent({
              currentEventCard: { name: "AND THEN THERE WAS ONE MORE" },
              currentEventStep: "select_player",
            }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });

          // Check current player (PlayerOne)
          expect(result.current.isSelectablePlayer(mockPlayerOne)).toBe(true);
          // Check other player (PlayerTwo)
          expect(result.current.isSelectablePlayer(mockPlayerTwo)).toBe(true);
        });

        it("returns true for other players during POINT_YOUR_SUSPICIONS pending response", () => {
          vi.mocked(useBasicGame).mockReturnValue(
            mockUseBasicGame({
              pendingResponse: {
                isPending: true,
                eventType: "POINT_YOUR_SUSPICIONS",
              },
            }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });

          // Check current player (PlayerOne) - should be false
          expect(result.current.isSelectablePlayer(mockPlayerOne)).toBe(false);
          // Check other player (PlayerTwo) - should be true
          expect(result.current.isSelectablePlayer(mockPlayerTwo)).toBe(true);
        });

        it("returns true when hookSetEvent.isPlayerSelectableForSetEvent is true", () => {
          vi.mocked(useSetEvent).mockReturnValue(
            mockHookSetEvent({
              setEvent: { isInEvent: true },
              isPlayerSelectableForSetEvent: vi.fn().mockReturnValue(true),
            }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isSelectablePlayer(mockPlayerTwo)).toBe(true);
        });

        it("returns false when no relevant event is active", () => {
          // Default mocks
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isSelectablePlayer(mockPlayerTwo)).toBe(false);
        });
      });

      describe("isTargetSecretEvent", () => {
        it("returns true when hookSetEvent.setEvent.isTargetSecret is true", () => {
          vi.mocked(useSetEvent).mockReturnValue(
            mockHookSetEvent({ setEvent: { isTargetSecret: true } }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isTargetSecretEvent()).toBe(true);
        });

        it("returns true when playerSelectsOneOfHisSecrets.isCurrPlayer is true", () => {
          vi.mocked(useBasicGame).mockReturnValue(
            mockUseBasicGame({
              playerSelectsOneOfHisSecrets: { isCurrPlayer: true },
            }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isTargetSecretEvent()).toBe(true);
        });

        it("returns true during AND THEN THERE WAS ONE MORE (SELECT_SECRET step)", () => {
          vi.mocked(useCardEvent).mockReturnValue(
            mockHookCardEvent({
              currentEventCard: { name: "AND THEN THERE WAS ONE MORE" },
              currentEventStep: "select_secret",
            }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isTargetSecretEvent()).toBe(true);
        });

        it("returns false when notSoFastEvent.isActivate is true", () => {
          vi.mocked(useBasicGame).mockReturnValue(
            mockUseBasicGame({ notSoFastEvent: { isActivate: true } }) as any,
          );
          vi.mocked(useSetEvent).mockReturnValue(
            mockHookSetEvent({ setEvent: { isTargetSecret: true } }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isTargetSecretEvent()).toBe(false);
        });
      });

      // isCurrPlayersSecretSelectable / isOtherPlayersSecretSelectable / isSelectableSecret
      describe("isSelectableSecret", () => {
        const mockSecretTwo = mockSecrets[2];

        it("uses isCurrPlayersSecretSelectable for current player's secrets", () => {
          const mockFn = vi.fn().mockReturnValue(true);
          vi.mocked(useSetEvent).mockReturnValue(
            mockHookSetEvent({
              isCurrPlayerSecretSelectableForSetEvent: mockFn,
              setEvent: { isInEvent: true },
            }) as any,
          );

          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });

          const mockSecretOne = result.current.playerSecrets[0];

          result.current.isSelectableSecret(mockSecretOne);
          expect(mockFn).toHaveBeenCalledWith(mockSecretOne);
        });

        it("uses isOtherPlayersSecretSelectable for other players' secrets (SetEvent)", () => {
          const mockFn = vi.fn().mockReturnValue(true);
          vi.mocked(useSetEvent).mockReturnValue(
            mockHookSetEvent({
              setEvent: { isInEvent: true },
              isOtherPlayerSecretSelectableForSetEvent: mockFn,
            }) as any,
          );

          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });

          result.current.isSelectableSecret(mockSecretTwo);

          // Se espera que la función de mockSetEvent haya sido llamada para la comprobación interna
          expect(mockFn).toHaveBeenCalledWith(mockSecretTwo);
        });

        it("other player's secret is selectable if revealed during AND THEN THERE WAS ONE MORE (SELECT_SECRET step)", () => {
          vi.mocked(useCardEvent).mockReturnValue(
            mockHookCardEvent({
              currentEventCard: { name: "AND THEN THERE WAS ONE MORE" },
              currentEventStep: "select_secret",
            }) as any,
          );

          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });

          const revealedSecret = { ...mockSecretTwo, is_revealed: true };
          const unrevealedSecret = { ...mockSecretTwo, is_revealed: false };

          expect(result.current.isSelectableSecret(revealedSecret)).toBe(true);
          expect(result.current.isSelectableSecret(unrevealedSecret)).toBe(
            false,
          );
        });
      });

      // isTargetSetEvent and isSelectableSet
      describe("Set selection logic", () => {
        const mockOtherPlayerSet = { ...mockSet, player_id: mockPlayerTwo.id };
        const mockCurrPlayerSet = { ...mockSet, player_id: mockPlayerOne.id };

        it("isTargetSetEvent returns true during ANOTHER_VICTIM (SELECT_SET step)", () => {
          vi.mocked(useCardEvent).mockReturnValue(
            mockHookCardEvent({
              currentEventCard: { name: "ANOTHER_VICTIM" },
              currentEventStep: "select_set",
            }) as any,
          );
          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });
          expect(result.current.isTargetSetEvent()).toBe(true);
        });

        it("isSelectableSet returns true for another player's set during ANOTHER_VICTIM", () => {
          vi.mocked(useCardEvent).mockReturnValue(
            mockHookCardEvent({
              currentEventCard: { name: "ANOTHER_VICTIM" },
              currentEventStep: "select_set",
            }) as any,
          );

          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });

          // Otro jugador (debe ser seleccionable)
          expect(
            result.current.isSelectableSet(mockOtherPlayerSet as any),
          ).toBe(true);
          // Jugador actual (no debe ser seleccionable)
          expect(result.current.isSelectableSet(mockCurrPlayerSet as any)).toBe(
            false,
          );
        });

        it("isSelectableSet delegates to hookSetEvent.isSetSelectableForSetEvent for downing a card", () => {
          const mockFn = vi.fn().mockReturnValue(true);
          vi.mocked(useSetEvent).mockReturnValue(
            mockHookSetEvent({
              setEvent: {
                isInEvent: false,
                isValidSet: false,
                canDownTheCardToASet: true,
                cards: [{ id: "card-id" } as any], // Solo 1 carta
                isSelectingSet: true, // Condición de target
              },
              isSetSelectableForSetEvent: mockFn,
            }) as any,
          );

          const { result } = renderHook(() => useLogicGame(), {
            wrapper: LogicGameContextProvider,
          });

          result.current.isSelectableSet(mockOtherPlayerSet as any);

          // Se espera que la función de mockSetEvent haya sido llamada para la comprobación interna
          expect(mockFn).toHaveBeenCalledWith(mockOtherPlayerSet);
          expect(
            result.current.isSelectableSet(mockOtherPlayerSet as any),
          ).toBe(true);
        });
      });
    });
  });
});
