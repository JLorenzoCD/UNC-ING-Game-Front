import "@testing-library/jest-dom";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { usePlayer } from "@/contexts/PlayerContext";
import { useBasicGame } from "@/contexts/BasicGameContext";

import { EVENT_STEPS } from "@/constants/game";

import type { UUID } from "@/types/common";
import type { GamePlayer } from "@/types/player";
import type { GameCard } from "@/types/card";
import type { GameSecret } from "@/types/secret";
import type { Match } from "@/types/match";

import { useCardEvent } from "./useCardEvent";
import type { MatchSet } from "@/types/set";

const {
  mockHttpService,
  MOCKED_CURRENT_PLAYER,
  mockMatch,
  mockPlayerTwo,
  cardLITA,
  cardCOFT,
  cardATWOME,
  cardAV,
  cardDELAY,
  mockToastFun,
  mockSecrets,
  setPoirot,
  mockPlayerFinishActionTurn,
} = vi.hoisted(() => {
  // Mocks de Servicios
  const mockPostPointYourSuspicions = vi.fn();
  const mockPostEvent = vi.fn();
  const mockHttpService = {
    postPointYourSuspicions: mockPostPointYourSuspicions,
    postEvent: mockPostEvent,
  };

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

  const cardLITA: GameCard = {
    id: crypto.randomUUID(),
    match_id: mockMatchId,
    player_id: playerOneId,
    card_id: crypto.randomUUID(),
    name: "LOOK INTO THE ASHES",
    type: "EVENT",
    description: "...",
    is_discarded: false,
    discarded_at: null,
  };
  const cardCOFT: GameCard = {
    id: crypto.randomUUID(),
    match_id: mockMatchId,
    player_id: playerOneId,
    card_id: crypto.randomUUID(),
    name: "CARDS OFF THE TABLE",
    type: "EVENT",
    description: "...",
    is_discarded: false,
    discarded_at: null,
  };
  const cardATWOME: GameCard = {
    id: crypto.randomUUID(),
    match_id: mockMatchId,
    player_id: playerOneId,
    card_id: crypto.randomUUID(),
    name: "AND THEN THERE WAS ONE MORE",
    type: "EVENT",
    description: "...",
    is_discarded: false,
    discarded_at: null,
  };
  const cardAV: GameCard = {
    id: crypto.randomUUID(),
    match_id: mockMatchId,
    player_id: playerOneId,
    card_id: crypto.randomUUID(),
    name: "ANOTHER VICTIM",
    type: "EVENT",
    description: "...",
    is_discarded: false,
    discarded_at: null,
  };
  const cardDELAY: GameCard = {
    id: crypto.randomUUID(),
    match_id: mockMatchId,
    player_id: playerOneId,
    card_id: crypto.randomUUID(),
    name: "DELAY THE MURDERER ESCAPE",
    type: "EVENT",
    description: "...",
    is_discarded: false,
    discarded_at: null,
  };

  const mockSecrets: GameSecret[] = [
    {
      type: "INNOCENT",
      content: "You are innocent",
      id: crypto.randomUUID(),
      match_id: mockMatchId,
      secret_id: crypto.randomUUID(),
      player_id: playerTwoId,
      is_revealed: false,
    },
    {
      type: "INNOCENT",
      id: crypto.randomUUID(),
      content: "You are the innocent",
      match_id: mockMatchId,
      secret_id: crypto.randomUUID(),
      player_id: crypto.randomUUID(),
      is_revealed: false,
    },
    {
      type: "MURDERER",
      id: crypto.randomUUID(),
      content: "You are the murderer",
      match_id: mockMatchId,
      secret_id: crypto.randomUUID(),
      player_id: playerTwoId,
      is_revealed: true,
    },
  ];

  const setPoirot: MatchSet = {
    id: "550e8400-e29b-41d4-a716-446655440001",
    type: "HERCULE POIROT",
    player_id: playerTwoId,
    match_id: mockMatchId,
    quin_play: false,
    quin_count: 0,
  };

  const mockToast = {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    custom: vi.fn(),
  };

  const mockToastFun = vi.fn();
  Object.assign(mockToastFun, mockToast);

  const mockPlayerFinishActionTurn = vi.fn();

  return {
    mockHttpService,
    MOCKED_CURRENT_PLAYER,
    mockMatch,
    mockPlayerTwo,
    mockSecrets,
    cardLITA,
    cardCOFT,
    cardATWOME,
    cardAV,
    cardDELAY,
    setPoirot,
    mockToastFun,
    mockPlayerFinishActionTurn,
  };
});

vi.mock("@/contexts/HttpServiceContext", () => ({
  useHttpService: vi.fn(() => ({ httpService: mockHttpService })),
}));

vi.mock("sonner", () => ({
  toast: mockToastFun,
}));
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
  playerFinishActionTurn: mockPlayerFinishActionTurn,
  ...overrides,
});

describe("useCardEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePlayer).mockReturnValue({
      player: MOCKED_CURRENT_PLAYER,
    } as any);
    vi.mocked(useBasicGame).mockReturnValue(mockUseBasicGameValue() as any);

    mockHttpService.postEvent.mockResolvedValue(null);
    mockHttpService.postPointYourSuspicions.mockResolvedValue(null);
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
      executeCardEventActionToPlayerTarget: expect.any(Function),
      cardEventSelectSecret: expect.any(Function),
      clearCardEventStep: expect.any(Function),
    });
  });

  it("should change 'canSelectMeAsPlayer' when play 'AND THEN THERE WAS ONE MORE'", () => {
    const { result } = renderHook(() => useCardEvent());

    act(() => {
      result.current.playEvent([cardATWOME], vi.fn(), vi.fn());
    });

    expect(result.current.canSelectMeAsPlayer).toBe(false);
    expect(result.current.currentEventStep).toBe(EVENT_STEPS.SELECT_SECRET);
    expect(result.current.currentEventCard).toEqual(cardATWOME);

    act(() => {
      result.current.setTargetCardEvent(mockSecrets[0]);
    });

    act(() => {
      result.current.cardEventSelectSecret();
    });

    expect(result.current.canSelectMeAsPlayer).toBe(true);
  });

  describe("AND THEN THERE WAS ONE MORE", () => {
    it("flow selecting other player", () => {
      const { result } = renderHook(() => useCardEvent());

      act(() => {
        result.current.playEvent([cardATWOME], vi.fn(), vi.fn());
      });

      expect(result.current.currentEventStep).toBe(EVENT_STEPS.SELECT_SECRET);
      expect(result.current.currentEventCard).toEqual(cardATWOME);

      act(() => {
        result.current.setTargetCardEvent(mockSecrets[0]);
      });

      expect(result.current.canSelectMeAsPlayer).toBe(true);

      act(() => {
        result.current.cardEventSelectSecret();
      });

      expect(result.current.currentEventStep).toBe(EVENT_STEPS.SELECT_PLAYER);

      act(() => {
        result.current.setTargetCardEvent(mockPlayerTwo);
      });
      expect(result.current.canSelectMeAsPlayer).toBe(false);

      const fn1 = vi.fn();
      const fn2 = vi.fn();
      act(() => {
        result.current.executeCardEventActionToPlayerTarget(fn1, fn2);
      });

      expect(fn1).toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();

      const clearSelectedCards = vi.fn();
      act(() => {
        result.current.executeCardEventActionToTarget(
          cardATWOME,
          [],
          [],
          [],
          vi.fn(),
          clearSelectedCards,
          vi.fn(),
        );
      });

      waitFor(() => {
        expect(result.current.selectedTargetPlayer).toBe(null);
        expect(result.current.selectedTargetSecret).toBe(null);
        expect(result.current.currentEventStep).toBe(null);
      });

      expect(mockHttpService.postEvent).toHaveBeenCalled();

      waitFor(() => {
        expect(clearSelectedCards).toHaveBeenCalled();
        expect(result.current.currentEventCard).toBe(null);
      });
    });

    it("flow selecting current player", () => {
      const { result } = renderHook(() => useCardEvent());

      // Juego carta de evento
      act(() => {
        result.current.playEvent([cardATWOME], vi.fn(), vi.fn());
      });

      expect(result.current.currentEventStep).toBe(EVENT_STEPS.SELECT_SECRET);
      expect(result.current.currentEventCard).toEqual(cardATWOME);

      // Selecciono secreto
      act(() => {
        result.current.setTargetCardEvent(mockSecrets[0]);
      });

      expect(result.current.canSelectMeAsPlayer).toBe(true);

      // Boton seleccionar secreto
      act(() => {
        result.current.cardEventSelectSecret();
      });

      // Boton seleccionar jugador actual
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      act(() => {
        result.current.executeCardEventActionToPlayerTarget(fn1, fn2);
      });

      expect(mockHttpService.postEvent).toHaveBeenCalled();

      waitFor(() => {
        expect(result.current.selectedTargetPlayer).toBe(null);
        expect(result.current.selectedTargetSecret).toBe(null);
        expect(result.current.currentEventStep).toBe(null);
        expect(result.current.currentEventCard).toBe(null);
        expect(fn1).not.toHaveBeenCalled();
        expect(fn2).toHaveBeenCalled();

        expect(mockPlayerFinishActionTurn).toHaveBeenCalled();
      });
    });
  });

  describe("CARDS OFF THE TABLE", () => {
    it("flow selection other player", () => {
      const { result } = renderHook(() => useCardEvent());

      // Se juega la carta de evento
      act(() => {
        result.current.playEvent([cardCOFT], vi.fn(), vi.fn());
      });

      expect(result.current.currentEventStep).toBe(EVENT_STEPS.SELECT_PLAYER);
      expect(result.current.currentEventCard).toEqual(cardCOFT);

      // Se selecciona jugador
      act(() => {
        result.current.setTargetCardEvent(mockPlayerTwo);
      });
      waitFor(() => {
        expect(result.current.selectedTargetPlayer).toEqual(mockPlayerTwo);
      });

      // Boton Select player
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      act(() => {
        result.current.executeCardEventActionToPlayerTarget(fn1, fn2);
      });

      expect(fn1).toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();

      // Efecto secundario de bton select player
      const clearSelectedCards = vi.fn();
      act(() => {
        result.current.executeCardEventActionToTarget(
          cardATWOME,
          [],
          [],
          [],
          vi.fn(),
          clearSelectedCards,
          vi.fn(),
        );
      });

      waitFor(() => {
        expect(mockHttpService.postEvent).toHaveBeenCalled();
        expect(result.current.selectedTargetPlayer).toBe(null);
        expect(result.current.currentEventStep).toBe(null);
        expect(clearSelectedCards).toHaveBeenCalled();
        expect(result.current.currentEventCard).toBe(null);
      });
    });
  });

  describe("DELAY THE MURDERER ESCAPE", () => {
    it("flow", () => {
      const { result } = renderHook(() => useCardEvent());

      // Se juega la carta de evento
      const handleEndEvent = vi.fn();
      act(() => {
        result.current.playEvent([cardDELAY], vi.fn(), handleEndEvent);
      });

      waitFor(() => {
        expect(handleEndEvent).toHaveBeenCalled();
      });

      // Efecto secundario de bton play event
      const clearSelectedCards = vi.fn();
      act(() => {
        result.current.executeCardEventActionToTarget(
          cardATWOME,
          [],
          [],
          [],
          vi.fn(),
          clearSelectedCards,
          vi.fn(),
        );
      });

      waitFor(() => {
        expect(mockHttpService.postEvent).toHaveBeenCalled();
        expect(result.current.selectedTargetPlayer).toBe(null);
        expect(result.current.currentEventStep).toBe(null);
        expect(clearSelectedCards).toHaveBeenCalled();
        expect(result.current.currentEventCard).toBe(null);
      });
    });
  });

  describe("LOOK INTO THE ASHES", () => {
    it("flow", () => {
      const { result } = renderHook(() => useCardEvent());

      // Se juega la carta de evento
      const handleEventDiscard = vi.fn();
      act(() => {
        result.current.playEvent([cardLITA], handleEventDiscard, vi.fn());
      });

      waitFor(() => {
        expect(handleEventDiscard).toHaveBeenCalled();
        expect(result.current.currentEventCard).toEqual(cardLITA);
      });

      // Efecto secundario de boton play event
      const clearDiscardModal = vi.fn();
      const clearSelectedCards = vi.fn();
      act(() => {
        result.current.executeCardEventActionToTarget(
          cardATWOME,
          [],
          [cardLITA, cardATWOME],
          [],
          clearDiscardModal,
          clearSelectedCards,
          vi.fn(),
        );
      });

      waitFor(() => {
        expect(mockHttpService.postEvent).toHaveBeenCalled();
        expect(result.current.selectedTargetPlayer).toBe(null);
        expect(result.current.currentEventStep).toBe(null);
        expect(clearDiscardModal).toHaveBeenCalled();
        expect(clearSelectedCards).toHaveBeenCalled();
        expect(result.current.currentEventCard).toBe(null);
      });
    });
  });

  describe("ANOTHER VICTIM", () => {
    it("flow selection other player", () => {
      const { result } = renderHook(() => useCardEvent());

      // Se juega la carta de evento
      act(() => {
        result.current.playEvent([cardAV], vi.fn(), vi.fn());
      });
      waitFor(() => {
        expect(result.current.currentEventCard).toEqual(cardAV);
        expect(result.current.currentEventStep).toEqual(EVENT_STEPS.SELECT_SET);
      });

      // Boton select set
      act(() => {
        result.current.setTargetCardEvent(setPoirot);
      });
      waitFor(() => {
        expect(result.current.selectedTargetSet).toEqual(setPoirot);
      });

      // Efecto secundario de boton select set
      const clearSelectedCards = vi.fn();
      act(() => {
        result.current.executeCardEventActionToTarget(
          cardATWOME,
          [],
          [],
          [],
          vi.fn(),
          clearSelectedCards,
          vi.fn(),
        );
      });

      waitFor(() => {
        expect(mockHttpService.postEvent).toHaveBeenCalled();
        expect(result.current.selectedTargetPlayer).toBe(null);
        expect(result.current.selectedTargetSet).toBe(null);
        expect(result.current.currentEventStep).toBe(null);
        expect(clearSelectedCards).toHaveBeenCalled();
        expect(mockPlayerFinishActionTurn).not.toHaveBeenCalled();
        expect(result.current.currentEventCard).toBe(null);
      });
    });
  });
});
