import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

import { useBasicGame } from "@/contexts/BasicGameContext";
import { useLogicGame } from "@/contexts/LogicGameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import type { GameCard } from "@/types/card";
import type { GamePlayer, Player } from "@/types/player";
import type { Match } from "@/types/match";

import { EVENT_STEPS, GAME_EVENTS } from "@/constants/game";

const MOCK_CARD_ID_1 = crypto.randomUUID();
const MOCK_CARD_ID_2 = crypto.randomUUID();
const MOCK_CARD_ID_3 = crypto.randomUUID();
const MOCK_CARD_ID_4 = crypto.randomUUID();
const MOCK_CARD_ID_5 = crypto.randomUUID();
const MOCK_CARD_ID_6 = crypto.randomUUID();
const MOCK_CARD_ID_7 = crypto.randomUUID(); // Carta disponible para robar
const MOCK_CARD_ID_8 = crypto.randomUUID(); // Carta disponible para robar
const MOCK_CARD_ID_9 = crypto.randomUUID(); // Carta disponible para robar
const MOCK_CARD_ID_10 = crypto.randomUUID(); // Carta disponible para robar
const MOCK_PLAYER_ID = crypto.randomUUID();
const MOCK_MATCH_ID = crypto.randomUUID();

const MOCK_TIMER_TURN = new Date().toISOString as any;

const mockPlayer: Player = {
  id: MOCK_PLAYER_ID,
  name: "Test Player",
  avatar: "avatar.png",
  birthday: new Date("2000-01-01"),
};

const mockMatchPlayer: GamePlayer = {
  ...mockPlayer,
  match_id: MOCK_MATCH_ID,
  player_id: MOCK_PLAYER_ID,
  role: "INNOCENT",
  order: 1,
};

const mockMatch: Match = {
  id: MOCK_MATCH_ID,
  min_players: 2,
  max_players: 4,
  name: "Test Match",
  status: "IN_PROGRESS",
  owner_id: crypto.randomUUID(),
  current_player_order: 1,
  timer_turn: MOCK_TIMER_TURN,
};

const mockCards: GameCard[] = [
  {
    id: MOCK_CARD_ID_1,
    match_id: MOCK_MATCH_ID,
    player_id: MOCK_PLAYER_ID,
    card_id: crypto.randomUUID(),
    name: "HERCULE POIROT",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: MOCK_CARD_ID_2,
    match_id: MOCK_MATCH_ID,
    player_id: MOCK_PLAYER_ID,
    card_id: crypto.randomUUID(),
    name: "MISS MARPLE",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: MOCK_CARD_ID_3,
    match_id: MOCK_MATCH_ID,
    player_id: MOCK_PLAYER_ID,
    card_id: crypto.randomUUID(),
    name: "PARKER PYNE",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: MOCK_CARD_ID_4,
    match_id: MOCK_MATCH_ID,
    player_id: MOCK_PLAYER_ID,
    card_id: crypto.randomUUID(),
    name: "LADY EILEEN",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: MOCK_CARD_ID_5,
    match_id: MOCK_MATCH_ID,
    player_id: MOCK_PLAYER_ID,
    card_id: crypto.randomUUID(),
    name: "ARIADNE OLIVER",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: MOCK_CARD_ID_6,
    match_id: MOCK_MATCH_ID,
    player_id: MOCK_PLAYER_ID,
    card_id: crypto.randomUUID(),
    name: "MISS MARPLE",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: MOCK_CARD_ID_7,
    match_id: MOCK_MATCH_ID,
    player_id: null,
    card_id: crypto.randomUUID(),
    name: "PARKER PYNE",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: MOCK_CARD_ID_8,
    match_id: MOCK_MATCH_ID,
    player_id: null,
    card_id: crypto.randomUUID(),
    name: "PARKER PYNE",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: MOCK_CARD_ID_9,
    match_id: MOCK_MATCH_ID,
    player_id: null,
    card_id: crypto.randomUUID(),
    name: "PARKER PYNE",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: MOCK_CARD_ID_10,
    match_id: MOCK_MATCH_ID,
    player_id: null,
    card_id: crypto.randomUUID(),
    name: "PARKER PYNE",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: false,
    discarded_at: null,
  },
];

const mockSecrets: GameSecret[] = [
  {
    type: "INNOCENT",
    content: "You are innocent",
    id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    secret_id: crypto.randomUUID(),
    player_id: MOCK_PLAYER_ID,
    is_revealed: false,
  },
  {
    type: "INNOCENT",
    id: crypto.randomUUID(),
    content: "You are the innocent",
    match_id: MOCK_MATCH_ID,
    secret_id: crypto.randomUUID(),
    player_id: MOCK_PLAYER_ID,
    is_revealed: false,
  },
  {
    type: "MURDERER",
    id: crypto.randomUUID(),
    content: "You are the murderer",
    match_id: MOCK_MATCH_ID,
    secret_id: crypto.randomUUID(),
    player_id: MOCK_PLAYER_ID,
    is_revealed: true,
  },
];

/* Métodos mockeados por Vitest */

const {
  mockPutTakeCards,
  mockPutDiscardCards,
  mockPutPassTurn,
  mockPostEvent,
  mockUseNavigate,
  mockToastSuccess,
  mockToastError,
  mockToastInfo,
  mockPostCardTrade,
  mockPostPointYourSuspicions,
  mockPostDeadCardFolly,
} = vi.hoisted(() => {
  const mockPutTakeCards = vi.fn();
  const mockPutDiscardCards = vi.fn();
  const mockPutPassTurn = vi.fn();
  const mockUseNavigate = vi.fn();
  const mockPostEvent = vi.fn();
  const mockToastSuccess = vi.fn();
  const mockToastError = vi.fn();
  const mockToastInfo = vi.fn();
  const mockPostCardTrade = vi.fn();
  const mockPostPointYourSuspicions = vi.fn();
  const mockPostDeadCardFolly = vi.fn();

  return {
    mockPutTakeCards,
    mockPutDiscardCards,
    mockPutPassTurn,
    mockPostEvent,
    mockUseNavigate,
    mockToastSuccess,
    mockToastError,
    mockToastInfo,
    mockPostCardTrade,
    mockPostPointYourSuspicions,
    mockPostDeadCardFolly,
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
    info: mockToastInfo,
  },
}));

/* Componentes mockeados por Vitest */

vi.mock("react-router", async (importOriginal) => {
  const mod = await importOriginal<typeof import("react-router")>();
  return {
    ...mod,
    useNavigate: () => mockUseNavigate,
  };
});

vi.mock("@/contexts/BasicGameContext");
vi.mock("@/contexts/LogicGameContext");

vi.mock("@/contexts/PlayerContext");

vi.mock("@/contexts/HttpServiceContext");

vi.mock("./components/Table", () => ({
  __esModule: true,
  default: vi.fn(({ draft, drawPile, discardPile, onSelectTargetEvent }) => (
    <div data-testid="mock-table">
      Table Component
      {draft}
      {drawPile}
      {discardPile}
      <button
        data-testid="mock-select-player"
        onClick={() =>
          onSelectTargetEvent({ id: "player-target-id", avatar: "p.png" })
        }
      />
      <button
        data-testid="mock-select-secret"
        onClick={() =>
          onSelectTargetEvent({ id: "secret-target-id", secret_id: "s.png" })
        }
      />
      <button
        data-testid="mock-select-set"
        onClick={() =>
          onSelectTargetEvent({ id: "set-target-id", quin_play: false })
        }
      />
    </div>
  )),
}));

vi.mock("./components/Hand", () => ({
  __esModule: true,
  default: ({
    cards,
    onSelect,
    isSelected,
    isDisabled,
    isActivateNSF,
    isPendingResponse,
    onDoubleClickCard,
  }: {
    cards: (GameCard | null)[];
    onSelect: (card: GameCard) => void;
    isSelected: (card: GameCard) => boolean;
    isDisabled?: boolean;
    isActivateNSF?: boolean;
    isPendingResponse?: boolean;
    onDoubleClickCard?: (card: GameCard) => void;
  }) => (
    <div data-testid="mock-hand">
      {cards.map((card, index) =>
        card ? (
          <button
            key={card.id}
            data-testid={`hand-card-${card.id}`}
            aria-selected={isSelected(card)}
            onClick={() => onSelect(card)}
            onDoubleClick={() => {
              if (!onDoubleClickCard) return;
              if (isActivateNSF && card.name === "NOT SO FAST") {
                onDoubleClickCard(card);
              } else if (isPendingResponse) {
                onDoubleClickCard(card);
              }
            }}
            disabled={isDisabled}
          >
            {card.name}
          </button>
        ) : (
          <div key={`empty-${index}`} data-testid={`empty-card-${index}`}>
            Empty
          </div>
        ),
      )}
    </div>
  ),
}));

vi.mock("./components/Secrets", () => ({
  __esModule: true,
  default: vi.fn(({ secrets }) => (
    <div data-testid="mock-secrets">
      Secrets Component - Secrets: {secrets.length}
    </div>
  )),
}));

vi.mock("./components/Draft", () => ({
  __esModule: true,
  default: vi.fn(
    ({
      cards,
      onTake,
      canTake,
    }: {
      cards: GameCard[];
      onTake: (card: GameCard) => void;
      canTake: boolean;
    }) => (
      <div data-testid="mock-draft">
        Draft Component - Can Take: {canTake ? "Yes" : "No"}
        {cards.map((card) => (
          <button
            key={card.id}
            data-testid={`draft-card-${card.id}`}
            onClick={() => onTake(card)}
          >
            {card.name}
          </button>
        ))}
      </div>
    ),
  ),
}));

vi.mock("./components/DrawPile", () => ({
  __esModule: true,
  default: vi.fn(({ cardCount }) => (
    <div data-testid="mock-draw-pile">
      Draw Pile Component - Card Count: {cardCount}
    </div>
  )),
}));

vi.mock("./components/DiscardPile", () => ({
  __esModule: true,
  default: vi.fn(({ topCard, onClick }) => (
    <div data-testid="mock-discard-pile" onClick={onClick}>
      Discard Pile Component - Top Card: {topCard ? topCard.name : "None"}
    </div>
  )),
}));

vi.mock("./components/DiscardModal", () => ({
  __esModule: true,
  default: vi.fn(
    ({
      isOpen,
      onClose,
      discardedCards,
      onSelect,
      isSelected,
      isEventDiscard,
      onEndEvent,
    }) =>
      isOpen ? (
        <div data-testid="mock-discard-modal">
          <button onClick={onClose}>Close</button>
          <button onClick={onEndEvent}>End event</button>
          {isEventDiscard && <p data-testid="mock-in-event">In event</p>}
          {discardedCards?.map((card: GameCard) => (
            <button
              key={card.id}
              data-testid={`discard-card-${card.id}`}
              aria-selected={isSelected(card)}
              onClick={() => onSelect(card)}
            >
              {card.name}
            </button>
          ))}
        </div>
      ) : null,
  ),
}));

vi.mock("./components/HandActions", () => ({
  __esModule: true,
  default: vi.fn(
    ({
      onFinish,
      onDiscard,
      onPlaySet,
      onSelectSet,
      onSelectPlayer,
      onSelectSecret,
      onPlayEvent,
      onSelectDirection,
      isDisabledEvent,
      isDisabled,
      isSetButtonDisabled,
      canSelectMeAsPlayer,
      isSelectDirectionEvent,
      isSelectionSetEvent,
    }) => {
      const {
        hasFinishedAction,
        playerSelectsOneOfHisSecrets,
        notSoFastEvent,
        pendingResponse,
      } = useBasicGame(); //

      const shouldDisableOption = isDisabled || isSelectionSetEvent;

      return (
        <div data-testid="mock-hand-actions">
          {isSelectDirectionEvent ? (
            <button
              onClick={() => onSelectDirection && onSelectDirection("LEFT")}
            >
              Left
            </button>
          ) : (
            <button
              onClick={onDiscard}
              disabled={
                shouldDisableOption ||
                hasFinishedAction ||
                notSoFastEvent.isActivate ||
                pendingResponse.isPending
              }
            >
              Discard cards
            </button>
          )}

          <button
            onClick={onPlaySet}
            disabled={isDisabled || isSetButtonDisabled || hasFinishedAction}
            data-testid="play-set-btn"
          >
            Play set
          </button>
          <button
            onClick={onPlayEvent}
            disabled={isDisabledEvent}
            data-testid="play-event-btn"
          >
            Play event
          </button>

          {isSelectDirectionEvent ? (
            <button
              onClick={() => onSelectDirection && onSelectDirection("RIGHT")}
            >
              Right
            </button>
          ) : (
            <button
              onClick={onSelectSet}
              disabled={isDisabled || !isSelectionSetEvent}
              data-testid="select-set-btn"
            >
              Select set
            </button>
          )}

          <button
            onClick={onSelectSecret}
            disabled={
              (isDisabled || hasFinishedAction) &&
              !playerSelectsOneOfHisSecrets.isCurrPlayer
            }
          >
            Select secret
          </button>
          <button
            onClick={onSelectPlayer}
            data-testid="select-player-btn"
            disabled={
              ((isDisabled || hasFinishedAction) &&
                !pendingResponse.isPending) ||
              (pendingResponse.isPending &&
                (pendingResponse.eventType === GAME_EVENTS.CARD_TRADE ||
                  pendingResponse.eventType === GAME_EVENTS.DEAD_CARD_FOLLY))
            }
          >
            {canSelectMeAsPlayer ? "Select me" : "Select player"}
          </button>

          <button
            onClick={onFinish}
            disabled={
              shouldDisableOption ||
              playerSelectsOneOfHisSecrets.isSelecting ||
              notSoFastEvent.isActivate ||
              pendingResponse.isPending
            }
          >
            Finish turn
          </button>
        </div>
      );
    },
  ),
}));

vi.mock("./components/Sets", () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="mock-sets">Sets Component</div>),
}));

vi.mock("./components/Result", () => ({
  __esModule: true,
  default: vi.fn(() => null),
}));

// mocks del useSetEvent
const mockPlaySet = vi.fn();
const mockClearSetEvent = vi.fn();

// mocks del useCardEvent
const mookPlayEvent = vi.fn();
const mookExecuteCardEventActionToTarget = vi.fn().mockResolvedValue(true);

// Mock del hook useSetEvent (funcionalidad interna a LogicGameContext)
const mockHookSetEvent = (overrides = {}) => ({
  setEvent: {
    isInEvent: false,
    isSelectingSet: false,
    currentSetCards: [],
    eventId: null,
  },
  clearSetEvent: mockClearSetEvent,
  playSet: mockPlaySet,
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

// Mock del hook useCardEvent (funcionalidad interna a LogicGameContext)
const mockHookCardEvent = (overrides = {}) => ({
  currentEventCard: null,
  selectedTargetSet: null,
  currentEventStep: null,
  canSelectMeAsPlayer: false,
  playEvent: mookPlayEvent,
  setTargetCardEvent: vi.fn(),
  executeCardEventActionToTarget: mookExecuteCardEventActionToTarget,
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

// Helper para crear un mock de useLogicGame
const mockLogicGameContext = (overrides = {}) => ({
  isPlayerTurn: true,
  cardsInDiscardPile: mockCards.filter((c) => c.is_discarded),
  cardsInDraft: mockCards.filter(
    (c) => c.player_id === null && !c.is_discarded,
  ),
  drawableCards: mockCards.filter(
    (c) => c.player_id === null && !c.is_discarded,
  ),
  playerSets: [],
  playerSecrets: mockSecrets,
  isInSocialDisgrace: false,
  getTarget: vi.fn(() => null),
  isSelectablePlayer: vi.fn(() => true),
  isSelectableSecret: vi.fn(() => true),
  isSelectableSet: vi.fn(() => true),
  isTargetPlayerEvent: vi.fn(() => false),
  isTargetSecretEvent: vi.fn(() => false),
  isTargetSetEvent: vi.fn(() => false),

  hookSetEvent: mockHookSetEvent(),
  hookCardEvent: mockHookCardEvent(),
  ...overrides,
});

import GameContainer from "./GameContainer";
import type { GameSecret } from "@/types/secret";

describe("GameContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPutPassTurn.mockReset();
    mockPutTakeCards.mockReset();
    mockPutDiscardCards.mockReset();

    vi.mocked(usePlayer).mockReturnValue({
      player: mockPlayer,
      setPlayer: vi.fn(),
    });

    vi.mocked(useBasicGame).mockReturnValue({
      sets: [],
      logs: [],
      secrets: mockSecrets,
      cards: mockCards,
      match: mockMatch,
      players: [mockMatchPlayer],
      result: null,
      isLoading: false,
      hasError: false,
      error: null,
      hasFinishedAction: false,
      lastUpdatedSecretId: null,
      playerFinishActionTurn: () => undefined,
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
      clearNotSoFastEvent: vi.fn(),
      pendingResponse: {
        isPending: false,
        eventId: null,
        eventType: null,
      },
      clearPendingResponse: vi.fn(),
    });

    vi.mocked(useHttpService).mockReturnValue({
      httpService: {
        putPassTurn: mockPutPassTurn,
        putTakeCards: mockPutTakeCards,
        putDiscardCards: mockPutDiscardCards,
        postEvent: mockPostEvent,
        postCardTrade: mockPostCardTrade,
        postPointYourSuspicions: mockPostPointYourSuspicions,
        postDeadCardFolly: mockPostDeadCardFolly,
      } as any,
    });

    vi.mocked(useLogicGame).mockReturnValue(mockLogicGameContext() as any);
  });

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<GameContainer />);
      expect(screen.getByTestId("game-container")).toBeInTheDocument();
    });

    it("should render child components", () => {
      render(<GameContainer />);
      expect(screen.getByTestId("mock-table")).toBeInTheDocument();
      expect(screen.getByTestId("mock-hand")).toBeInTheDocument();
      expect(screen.getByTestId("mock-secrets")).toBeInTheDocument();
      expect(screen.getByTestId("mock-draw-pile")).toBeInTheDocument();
      expect(screen.getByTestId("mock-discard-pile")).toBeInTheDocument();
      expect(
        screen.queryByTestId("mock-discard-modal"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Selection & Discarding", () => {
    it("should handle card selection and deselection", () => {
      render(<GameContainer />);

      const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
      const secondCardButton = screen.getByTestId(
        `hand-card-${MOCK_CARD_ID_2}`,
      );

      /* Testeamos que se puede seleccionar y deseleccionar cada carta sin afectar a las demás. */

      // Ambas cartas inicialmente no están seleccionadas
      expect(firstCardButton).toHaveAttribute("aria-selected", "false");
      expect(secondCardButton).toHaveAttribute("aria-selected", "false");

      fireEvent.click(firstCardButton);

      // Solo la primera carta está seleccionada
      expect(firstCardButton).toHaveAttribute("aria-selected", "true");
      expect(secondCardButton).toHaveAttribute("aria-selected", "false");

      fireEvent.click(secondCardButton);

      // Ambas cartas están seleccionadas
      expect(firstCardButton).toHaveAttribute("aria-selected", "true");
      expect(secondCardButton).toHaveAttribute("aria-selected", "true");

      fireEvent.click(firstCardButton);

      // Solo la segunda carta está seleccionada
      expect(firstCardButton).toHaveAttribute("aria-selected", "false");
      expect(secondCardButton).toHaveAttribute("aria-selected", "true");

      fireEvent.click(secondCardButton);

      // Ninguna carta está seleccionada
      expect(firstCardButton).toHaveAttribute("aria-selected", "false");
      expect(secondCardButton).toHaveAttribute("aria-selected", "false");
    });

    it("should actually discard cards after clicking discard button", async () => {
      mockPutDiscardCards.mockResolvedValue(undefined);

      render(<GameContainer />);

      const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
      const discardButton = screen.getByText("Discard cards");

      // Seleccionamos la carta.
      fireEvent.click(firstCardButton);
      expect(firstCardButton).toHaveAttribute("aria-selected", "true");

      await act(async () => {
        fireEvent.click(discardButton);
      });

      expect(mockPutDiscardCards).toHaveBeenCalledTimes(1);
      expect(mockPutDiscardCards).toHaveBeenCalledWith(
        MOCK_MATCH_ID,
        MOCK_PLAYER_ID,
        [MOCK_CARD_ID_1], // Carta a descartar
      );
    });
  });

  describe("Discard Modal", () => {
    it("should not open discard modal after click with an empty discard pile", async () => {
      render(<GameContainer />);

      const discardPile = screen.getByTestId("mock-discard-pile");

      await act(async () => {
        await userEvent.click(discardPile);
      });

      const discardModal = screen.queryByTestId("mock-discard-modal");

      expect(discardModal).not.toBeInTheDocument();
    });

    it("should open discard modal when clicking on discard pile with discarded cards", async () => {
      vi.mocked(useBasicGame).mockReturnValue({
        sets: [],
        logs: [],
        secrets: [],
        players: [],
        match: mockMatch,
        result: null,
        cards: [
          ...mockCards,
          {
            id: crypto.randomUUID(),
            card_id: crypto.randomUUID(),
            match_id: MOCK_MATCH_ID,
            player_id: null,
            type: "DETECTIVE",
            name: "HERCULE POIROT",
            description: "A discarded card",
            discarded_at: new Date(),
            is_discarded: true,
          },
        ],
        isLoading: false,
        hasError: false,
        error: null,
        hasFinishedAction: false,
        lastUpdatedSecretId: null,
        playerFinishActionTurn: () => undefined,
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
        clearNotSoFastEvent: vi.fn(),
        pendingResponse: {
          isPending: false,
          eventId: null,
          eventType: null,
        },
        clearPendingResponse: vi.fn(),
      });
      vi.mocked(useLogicGame).mockReturnValue(
        mockLogicGameContext({
          cardsInDiscardPile: [
            ...mockCards,
            {
              id: crypto.randomUUID(),
              card_id: crypto.randomUUID(),
              match_id: MOCK_MATCH_ID,
              player_id: null,
              type: "DETECTIVE",
              name: "HERCULE POIROT",
              description: "A discarded card",
              discarded_at: new Date(),
              is_discarded: true,
            },
          ].filter((c) => c.is_discarded),
        }) as any,
      );

      render(<GameContainer />);

      const discardPile = screen.getByTestId("mock-discard-pile");

      await act(async () => {
        await userEvent.click(discardPile);
      });

      expect(screen.getByTestId("mock-discard-modal")).toBeInTheDocument();
    });
  });

  describe("Turn", () => {
    it("should prevent hand actions when it's not the player's turn", () => {
      vi.mocked(useBasicGame).mockReturnValue({
        sets: [],
        logs: [],
        secrets: [],
        cards: mockCards,
        players: [mockMatchPlayer],
        match: { ...mockMatch, current_player_order: 2 }, // Turno de otro jugador
        result: null,
        isLoading: false,
        hasError: false,
        error: null,
        hasFinishedAction: false,
        lastUpdatedSecretId: null,
        playerFinishActionTurn: () => undefined,
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
        clearNotSoFastEvent: vi.fn(),
        pendingResponse: {
          isPending: false,
          eventId: null,
          eventType: null,
        },
        clearPendingResponse: vi.fn(),
      });

      mockPutDiscardCards.mockResolvedValue(undefined);
      mockPutTakeCards.mockResolvedValue(undefined);
      mockPutPassTurn.mockResolvedValue(undefined);

      render(<GameContainer />);

      const discardButton = screen.getByText("Discard cards");

      act(() => {
        userEvent.click(discardButton);
      });

      expect(mockPutDiscardCards).not.toHaveBeenCalled();

      const finishButton = screen.getByText("Finish turn");

      act(() => {
        userEvent.click(finishButton);
      });

      expect(mockPutPassTurn).not.toHaveBeenCalled();
    });

    it("should not prevent hand actions it's the player's turn", async () => {
      mockPutDiscardCards.mockResolvedValue(undefined);
      mockPutTakeCards.mockResolvedValue(undefined);
      mockPutPassTurn.mockResolvedValue(undefined);

      render(<GameContainer />);

      // Test discarding - select a card first
      const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
      fireEvent.click(firstCardButton);

      const discardButton = screen.getByText("Discard cards");

      await act(async () => {
        fireEvent.click(discardButton);
      });

      expect(mockPutDiscardCards).toHaveBeenCalled();

      // Test finish turn - this should trigger mandatory discard since we manually discarded already
      // The hand is now not full (has 5 cards after discard), so we can't test finish turn here
      // Instead, let's verify that the discard action worked correctly
      expect(mockPutDiscardCards).toHaveBeenCalledWith(
        MOCK_MATCH_ID,
        MOCK_PLAYER_ID,
        [MOCK_CARD_ID_1],
      );
    });
  });

  describe("Finish turn control flow", () => {
    it("should handle API error gracefully when finishing turn", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockPutDiscardCards.mockRejectedValue(new Error("API Error"));
      mockPutTakeCards.mockResolvedValue(undefined);
      mockPutPassTurn.mockResolvedValue(undefined);

      render(<GameContainer />);

      const finishButton = screen.getByText("Finish turn");

      await act(async () => {
        fireEvent.click(finishButton);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[API Error]",
        "Failed to perform mandatory discard",
        expect.objectContaining({
          error: expect.any(Error),
          timestamp: expect.any(String),
        }),
      );

      expect(mockPutDiscardCards).toHaveBeenCalledTimes(1);

      // No se deberían llamar a los otros métodos
      // si el descarte falla.
      expect(mockPutTakeCards).not.toHaveBeenCalled();
      expect(mockPutPassTurn).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should not call API when finishing turn without httpService", async () => {
      vi.mocked(useHttpService).mockReturnValue({
        httpService: null,
      });

      render(<GameContainer />);

      const finishButton = screen.getByText("Finish turn");

      await act(async () => {
        fireEvent.click(finishButton);
      });

      expect(mockPutDiscardCards).not.toHaveBeenCalled();
      expect(mockPutTakeCards).not.toHaveBeenCalled();
    });

    it("should not call API when finishing turn without player", async () => {
      vi.mocked(usePlayer).mockReturnValue({
        player: null,
        setPlayer: vi.fn(),
      });

      render(<GameContainer />);

      const finishButton = screen.getByText("Finish turn");

      await act(async () => {
        fireEvent.click(finishButton);
      });

      expect(mockPutDiscardCards).not.toHaveBeenCalled();
      expect(mockPutTakeCards).not.toHaveBeenCalled();
    });

    it("should not call API when finishing turn without match", async () => {
      vi.mocked(useBasicGame).mockReturnValue({
        secrets: [],
        logs: [],
        cards: mockCards,
        match: null,
        players: [],
        sets: [],
        result: null,
        isLoading: false,
        hasError: false,
        error: null,
        hasFinishedAction: false,
        lastUpdatedSecretId: null,
        playerFinishActionTurn: () => undefined,
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
        clearNotSoFastEvent: vi.fn(),
        pendingResponse: {
          isPending: false,
          eventId: null,
          eventType: null,
        },
        clearPendingResponse: vi.fn(),
      });

      render(<GameContainer />);

      const finishButton = screen.getByText("Finish turn");

      await act(async () => {
        fireEvent.click(finishButton);
      });

      expect(mockPutDiscardCards).not.toHaveBeenCalled();
      expect(mockPutTakeCards).not.toHaveBeenCalled();
    });

    it("should call mandatory discard when finishing turn with no manually discarded cards", async () => {
      mockPutDiscardCards.mockResolvedValue(undefined);
      mockPutTakeCards.mockResolvedValue(undefined);
      mockPutPassTurn.mockResolvedValue(undefined);

      render(<GameContainer />);

      const finishButton = screen.getByText("Finish turn");

      await act(async () => {
        fireEvent.click(finishButton);
      });

      // Ejecutamos el descarte obligatorio
      expect(mockPutDiscardCards).toHaveBeenCalledTimes(1);
      expect(mockPutDiscardCards).toHaveBeenCalledWith(
        MOCK_MATCH_ID,
        MOCK_PLAYER_ID,
        expect.arrayContaining([expect.any(String)]),
      );

      expect(mockPutTakeCards).toHaveBeenCalledTimes(1);
      expect(mockPutTakeCards).toHaveBeenCalledWith(
        MOCK_MATCH_ID,
        MOCK_PLAYER_ID,
        [MOCK_CARD_ID_10],
      );

      // Pasamos el turno
      expect(mockPutPassTurn).toHaveBeenCalledTimes(1);
      expect(mockPutPassTurn).toHaveBeenCalledWith(MOCK_MATCH_ID);
    });
  });

  describe("Set Events integration", () => {
    it("uses useLogicGame inside GameContainer", () => {
      render(<GameContainer />);
      expect(vi.mocked(useLogicGame)).toHaveBeenCalled();
    });

    it("calls playSet when 'Play set' is clicked", async () => {
      render(<GameContainer />);

      const playSetButton = screen.getByTestId("play-set-btn");
      await act(async () => {
        fireEvent.click(playSetButton);
      });

      expect(mockPlaySet).toHaveBeenCalledTimes(1);
    });

    it("executes clearSetEvent after finishing the turn", async () => {
      render(<GameContainer />);
      const finishButton = screen.getByText("Finish turn");

      await act(async () => {
        fireEvent.click(finishButton);
      });

      expect(mockClearSetEvent).toHaveBeenCalledTimes(1);
    });

    it("calls playSet if the button is enabled", async () => {
      render(<GameContainer />);
      const playSetButton = screen.getByText("Play set");

      await act(async () => {
        fireEvent.click(playSetButton);
      });

      expect(mockPlaySet).toHaveBeenCalled();
    });
  });

  describe("Card Events (handlePlayEvent & handleEndEvent)", () => {
    // Definimos cartas de evento
    const cardLITA: GameCard = {
      id: crypto.randomUUID(),
      match_id: MOCK_MATCH_ID,
      player_id: MOCK_PLAYER_ID,
      card_id: crypto.randomUUID(),
      name: "LOOK INTO THE ASHES",
      type: "EVENT",
      description: "...",
      is_discarded: false,
      discarded_at: null,
    };
    const cardCOFT: GameCard = {
      id: crypto.randomUUID(),
      match_id: MOCK_MATCH_ID,
      player_id: MOCK_PLAYER_ID,
      card_id: crypto.randomUUID(),
      name: "CARDS OFF THE TABLE",
      type: "EVENT",
      description: "...",
      is_discarded: false,
      discarded_at: null,
    };
    const cardATWOME: GameCard = {
      id: crypto.randomUUID(),
      match_id: MOCK_MATCH_ID,
      player_id: MOCK_PLAYER_ID,
      card_id: crypto.randomUUID(),
      name: "AND THEN THERE WAS ONE MORE",
      type: "EVENT",
      description: "...",
      is_discarded: false,
      discarded_at: null,
    };
    const cardAV: GameCard = {
      id: crypto.randomUUID(),
      match_id: MOCK_MATCH_ID,
      player_id: MOCK_PLAYER_ID,
      card_id: crypto.randomUUID(),
      name: "ANOTHER VICTIM",
      type: "EVENT",
      description: "...",
      is_discarded: false,
      discarded_at: null,
    };
    const cardDELAY: GameCard = {
      id: crypto.randomUUID(),
      match_id: MOCK_MATCH_ID,
      player_id: MOCK_PLAYER_ID,
      card_id: crypto.randomUUID(),
      name: "DELAY THE MURDERER ESCAPE",
      type: "EVENT",
      description: "...",
      is_discarded: false,
      discarded_at: null,
    };

    const discardedCard: GameCard = {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id: MOCK_MATCH_ID,
      player_id: null,
      type: "DETECTIVE",
      name: "HERCULE POIROT",
      description: "A discarded card",
      discarded_at: new Date(),
      is_discarded: true,
    };

    it("handles 'LOOK INTO THE ASHES' flow", async () => {
      vi.mocked(useBasicGame).mockReturnValue({
        ...vi.mocked(useBasicGame)(),
        cards: [cardLITA], // Carta en mano
      });
      vi.mocked(useLogicGame).mockReturnValue(
        mockLogicGameContext({
          cardsInDiscardPile: [discardedCard], // carta en descarte
        }) as any,
      );
      mookPlayEvent.mockImplementation((_, handleEventDiscard) =>
        handleEventDiscard(),
      );

      render(<GameContainer />);

      // 1. Seleccionar la carta de evento
      fireEvent.click(screen.getByTestId(`hand-card-${cardLITA.id}`));
      // 2. Jugar el evento
      fireEvent.click(screen.getByTestId("play-event-btn"));

      // 3. Verificar que el modal se abrió
      expect(screen.getByTestId("mock-discard-modal")).toBeInTheDocument();
      expect(screen.getByTestId("mock-in-event")).toBeInTheDocument();

      // 4. Seleccionar la carta del descarte (el modal la trackea)
      fireEvent.click(screen.getByTestId(`discard-card-${discardedCard.id}`));

      // 5. Aplicar efecto desde el modal
      await act(async () => {
        fireEvent.click(screen.getByText("End event"));
      });

      // 6. Verificar la llamada a la fun playEvent
      expect(mookPlayEvent).toHaveBeenCalled();
    });

    it("handles 'CARDS OFF THE TABLE' flow", async () => {
      vi.mocked(useBasicGame).mockReturnValue({
        ...vi.mocked(useBasicGame)(),
        cards: [cardCOFT],
      });
      vi.mocked(useLogicGame).mockReturnValue(mockLogicGameContext() as any);

      const { rerender } = render(<GameContainer />);

      // 1. Seleccionar y jugar evento
      fireEvent.click(screen.getByTestId(`hand-card-${cardCOFT.id}`));
      fireEvent.click(screen.getByTestId("play-event-btn"));

      // 2. Seleccionar jugador
      fireEvent.click(screen.getByTestId("mock-select-player"));

      vi.mocked(useLogicGame).mockReturnValue(
        mockLogicGameContext({
          hookCardEvent: mockHookCardEvent({
            isInEvent: true,
          }) as any,
        }) as any,
      );
      rerender(<GameContainer />);

      // 3. Botón "Select Player" debe estar habilitado
      const selectPlayerButton = screen.getByTestId("select-player-btn");
      expect(selectPlayerButton).not.toBeDisabled();

      // 4. Aplicar efecto
      await act(async () => {
        fireEvent.click(selectPlayerButton);
      });

      // 5. Verificar la llamada a la fun playEvent
      expect(mookPlayEvent).toHaveBeenCalled();
    });

    it("handles 'AND THEN THERE WAS ONE MORE' flow", async () => {
      vi.mocked(useBasicGame).mockReturnValue({
        ...vi.mocked(useBasicGame)(),
        cards: [cardATWOME],
      });
      render(<GameContainer />);

      // 1. Seleccionar y jugar evento
      fireEvent.click(screen.getByTestId(`hand-card-${cardATWOME.id}`));
      fireEvent.click(screen.getByTestId("play-event-btn"));

      // 2. Seleccionar secreto
      fireEvent.click(screen.getByTestId("mock-select-secret"));

      // 3. Seleccionar jugador
      fireEvent.click(screen.getByTestId("mock-select-player"));

      // 4. Botón "Select Player" esta habilitado
      const selectPlayerButton = screen.getByTestId("select-player-btn");
      expect(selectPlayerButton).not.toBeDisabled();

      // 5. Aplicar efecto
      await act(async () => {
        fireEvent.click(selectPlayerButton);
      });

      // 6. Verificar la llamada a la fun playEvent
      expect(mookPlayEvent).toHaveBeenCalled();
    });

    it("handles 'ANOTHER VICTIM' flow", async () => {
      vi.mocked(useBasicGame).mockReturnValue({
        ...vi.mocked(useBasicGame)(),
        cards: [cardAV],
        sets: [{ id: "set-target-id", player_id: "other" } as any], // Set de otro jugador
      });
      const { rerender } = render(<GameContainer />);

      // 1. Seleccionar y jugar evento
      fireEvent.click(screen.getByTestId(`hand-card-${cardAV.id}`));
      fireEvent.click(screen.getByTestId("play-event-btn"));

      // 2. Seleccionar set
      fireEvent.click(screen.getByTestId("mock-select-set"));

      vi.mocked(useLogicGame).mockReturnValue(
        mockLogicGameContext({
          hookCardEvent: mockHookCardEvent({
            currentEventCard: { name: GAME_EVENTS.ANOTHER_VICTIM },
            currentEventStep: EVENT_STEPS.SELECT_SET,
            selectedTargetSet: "selected_set",
          }) as any,
        }) as any,
      );
      rerender(<GameContainer />);

      // 3. Aplicar efecto "Select set"
      const selectSetButton = screen.getByTestId("select-set-btn");
      await act(async () => {
        fireEvent.click(selectSetButton);
      });

      // 4. Verificar la llamada a la fun executeCardEventActionToTarget
      expect(mookExecuteCardEventActionToTarget).toHaveBeenCalled();
    });

    it("handles simple events like 'DELAY THE MURDERER ESCAPE'", async () => {
      vi.mocked(useBasicGame).mockReturnValue({
        ...vi.mocked(useBasicGame)(),
        cards: [cardDELAY],
      });
      vi.mocked(useLogicGame).mockReturnValue(
        mockLogicGameContext({
          cardsInDiscardPile: [discardedCard], // carta en descarte
        }) as any,
      );

      render(<GameContainer />);

      // 1. Seleccionar y jugar evento
      fireEvent.click(screen.getByTestId(`hand-card-${cardDELAY.id}`));

      await act(async () => {
        fireEvent.click(screen.getByTestId("play-event-btn"));
      });

      // 2. Verificar la llamada a la fun playEvent
      expect(mookPlayEvent).toHaveBeenCalled();
    });
  });

  describe("NOT SO FAST flow", () => {
    let notSoFastCard: GameCard;
    const mockClearNotSoFastEvent = vi.fn();
    const mockPostPlayNotSoFast = vi.fn();

    beforeEach(() => {
      notSoFastCard = {
        id: crypto.randomUUID(),
        match_id: MOCK_MATCH_ID,
        player_id: MOCK_PLAYER_ID,
        card_id: crypto.randomUUID(),
        name: "NOT SO FAST",
        description: "Stop!",
        type: "INSTANT",
        is_discarded: false,
        discarded_at: null,
      };

      // Configurar httpService para este test
      vi.mocked(useHttpService).mockReturnValue({
        httpService: {
          putPassTurn: mockPutPassTurn,
          putTakeCards: mockPutTakeCards,
          putDiscardCards: mockPutDiscardCards,
          postEvent: mockPostEvent,
          postPlayNotSoFast: mockPostPlayNotSoFast,
          postCardTrade: mockPostCardTrade,
          postPointYourSuspicions: mockPostPointYourSuspicions,
          postDeadCardFolly: mockPostDeadCardFolly,
        } as any,
      });

      mockPostPlayNotSoFast.mockResolvedValue({ success: true });
      mockClearNotSoFastEvent.mockClear();
    });

    it("handlePlayNotSoFast: should call httpService and clear event on success", async () => {
      const eventId = crypto.randomUUID();
      // Mockear el contexto con el evento NSF activo
      vi.mocked(useBasicGame).mockReturnValue({
        ...vi.mocked(useBasicGame)(), // Obtener el mock base
        cards: [notSoFastCard, ...mockCards.slice(1)], // Asegurarse de que el jugador tiene la carta
        notSoFastEvent: {
          isActivate: true,
          eventId: eventId,
          nsfCount: 1,
          resolvedAtUtc: "2025-01-01T00:00:00Z",
          toastId: "toast-123",
          discardedCard: null,
        },
        clearNotSoFastEvent: mockClearNotSoFastEvent, // Usar el mock local
      });

      render(<GameContainer />);

      // Encontrar la carta NSF en la mano y simular doble clic
      const nsfCardButton = screen.getByTestId(`hand-card-${notSoFastCard.id}`);

      await act(async () => {
        fireEvent.doubleClick(nsfCardButton);
      });

      // Verificar que se llamó a la API
      expect(mockPostPlayNotSoFast).toHaveBeenCalledTimes(1);
      expect(mockPostPlayNotSoFast).toHaveBeenCalledWith(
        MOCK_MATCH_ID,
        MOCK_PLAYER_ID,
        notSoFastCard.id,
        eventId,
        1,
      );

      // Verificar que el evento se limpió
      expect(mockClearNotSoFastEvent).toHaveBeenCalledTimes(1);
      expect(mockToastSuccess).toHaveBeenCalledWith("¡NOT SO FAST played!");
    });

    it("HandActions: should disable all buttons when notSoFastEvent is active", () => {
      // Mockear el contexto con el evento NSF activo
      vi.mocked(useBasicGame).mockReturnValue({
        ...vi.mocked(useBasicGame)(),
        notSoFastEvent: {
          isActivate: true,
          eventId: null,
          nsfCount: 0,
          resolvedAtUtc: null,
          toastId: null,
          discardedCard: null,
        },
        clearNotSoFastEvent: mockClearNotSoFastEvent,
      });

      render(<GameContainer />);

      // Verificar que los botones de acción están deshabilitados
      // El mock de HandActions ahora recibe `isDisabled={true}`
      expect(screen.getByText("Discard cards")).toBeDisabled();
      expect(screen.getByText("Play set")).toBeDisabled();
      expect(screen.getByText("Finish turn")).toBeDisabled();
      expect(screen.getByTestId("play-event-btn")).toBeDisabled();
    });
  });
});
