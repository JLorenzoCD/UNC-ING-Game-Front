import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import type { GameCard } from "@/types/card";

import GameContainer from "./GameContainer";

const MOCK_CARD_ID_1 = crypto.randomUUID();
const MOCK_CARD_ID_2 = crypto.randomUUID();
const MOCK_CARD_ID_3 = crypto.randomUUID(); // Carta disponible para robar
const MOCK_PLAYER_ID = crypto.randomUUID();
const MOCK_MATCH_ID = crypto.randomUUID();

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
    player_id: null,
    card_id: crypto.randomUUID(),
    name: "PARKER PYNE",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: false,
    discarded_at: null,
  },
];

vi.mock("@/contexts/GameContext");

vi.mock("@/contexts/PlayerContext");

vi.mock("@/contexts/HttpServiceContext");

vi.mock("./components/Table", () => ({
  __esModule: true,
  default: vi.fn(({ drawPile, discardPile }) => (
    <div data-testid="mock-table">
      Table Component
      {drawPile}
      {discardPile}
    </div>
  )),
}));

vi.mock("./components/Hand", () => ({
  __esModule: true,
  default: ({
    cards,
    onSelect,
    isSelected,
  }: {
    cards: GameCard[];
    onSelect: (card: GameCard) => void;
    isSelected: (card: GameCard) => boolean;
  }) => (
    <div data-testid="mock-hand">
      {cards.map((card) => (
        <button
          key={card.id}
          data-testid={`hand-card-${card.id}`}
          aria-selected={isSelected(card)}
          onClick={() => onSelect(card)}
        >
          {card.name}
        </button>
      ))}
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
  default: vi.fn(({ onFinish, onDiscard, isDiscarding }) => (
    <div data-testid="mock-hand-actions">
      <button onClick={onDiscard}>
        {isDiscarding ? "Cancel discard" : "Discard cards"}
      </button>
      <button onClick={onFinish}>Finish turn</button>
    </div>
  )),
}));

vi.mock("./components/Sets", () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="mock-sets">Sets Component</div>),
}));

describe("GameContainer", () => {
  const mockPutMatchCards = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPutMatchCards.mockReset();

    vi.mocked(usePlayer).mockReturnValue({
      player: {
        id: MOCK_PLAYER_ID,
        name: "Test Player",
        avatar: "avatar.png",
        birthday: new Date("2000-01-01"),
      },
      setPlayer: vi.fn(),
    });

    vi.mocked(useGame).mockReturnValue({
      secrets: [],
      cards: mockCards,
      match: {
        id: MOCK_MATCH_ID,
        name: "Test Match",
        status: "IN_PROGRESS",
        current_player_order: 1,
        max_players: 4,
        min_players: 2,
        owner_id: crypto.randomUUID(),
      },
      players: [],
      sets: [],
      isLoading: false,
      hasError: false,
      error: null,
    });

    vi.mocked(useHttpService).mockReturnValue({
      httpService: {
        putMatchCards: mockPutMatchCards,
      } as any,
    });
  });

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
    expect(screen.queryByTestId("mock-discard-modal")).not.toBeInTheDocument();
  });

  it("should handle card selection and deselection", () => {
    render(<GameContainer />);

    const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
    const secondCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_2}`);

    expect(firstCardButton).toHaveAttribute("aria-selected", "false");
    expect(secondCardButton).toHaveAttribute("aria-selected", "false");

    fireEvent.click(firstCardButton);
    expect(firstCardButton).toHaveAttribute("aria-selected", "true");
    expect(secondCardButton).toHaveAttribute("aria-selected", "false");

    fireEvent.click(secondCardButton);
    expect(firstCardButton).toHaveAttribute("aria-selected", "true");
    expect(secondCardButton).toHaveAttribute("aria-selected", "true");

    fireEvent.click(firstCardButton);
    expect(firstCardButton).toHaveAttribute("aria-selected", "false");
    expect(secondCardButton).toHaveAttribute("aria-selected", "true");

    fireEvent.click(secondCardButton);
    expect(firstCardButton).toHaveAttribute("aria-selected", "false");
    expect(secondCardButton).toHaveAttribute("aria-selected", "false");
  });

  it("should mark cards for discard when clicking 'Discard cards' button", () => {
    render(<GameContainer />);

    const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
    fireEvent.click(firstCardButton);

    expect(screen.getByText("Discard cards")).toBeInTheDocument();

    const discardButton = screen.getByText("Discard cards");
    fireEvent.click(discardButton);

    expect(screen.getByText("Cancel discard")).toBeInTheDocument();
    expect(firstCardButton).toHaveAttribute("aria-selected", "false");
  });

  it("should not show the DiscardModal when clicking on the DiscardPile, since there are no discarded cards", async () => {
    render(<GameContainer />);

    const discardPile = screen.getByTestId("mock-discard-pile");

    await act(async () => {
      await userEvent.click(discardPile);
    });

    expect(screen.queryByTestId("mock-discard-modal")).not.toBeInTheDocument();
  });

  it("should complete the full discard flow: select → discard → finish turn → card appears in discard pile", async () => {
    mockPutMatchCards.mockResolvedValue(undefined);

    render(<GameContainer />);

    const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
    fireEvent.click(firstCardButton);
    expect(firstCardButton).toHaveAttribute("aria-selected", "true");

    const discardButton = screen.getByText("Discard cards");
    fireEvent.click(discardButton);

    expect(screen.getByText("Cancel discard")).toBeInTheDocument();

    const finishButton = screen.getByText("Finish turn");

    await act(async () => {
      fireEvent.click(finishButton);
    });

    expect(mockPutMatchCards).toHaveBeenCalledTimes(1);
    expect(mockPutMatchCards).toHaveBeenCalledWith(
      MOCK_MATCH_ID,
      MOCK_PLAYER_ID,
      [MOCK_CARD_ID_3], // Carta a robar
      [MOCK_CARD_ID_1], // Carta a descartar
    );

    expect(screen.getByText("Discard cards")).toBeInTheDocument();
  });

  it("should cancel discard mode when clicking 'Cancel discard'", () => {
    render(<GameContainer />);

    const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
    fireEvent.click(firstCardButton);

    const discardButton = screen.getByText("Discard cards");
    fireEvent.click(discardButton);
    expect(screen.getByText("Cancel discard")).toBeInTheDocument();

    const cancelButton = screen.getByText("Cancel discard");
    fireEvent.click(cancelButton);

    expect(screen.getByText("Discard cards")).toBeInTheDocument();
  });

  it("should not allow selecting a card that is already marked for discard", () => {
    render(<GameContainer />);

    const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);

    fireEvent.click(firstCardButton);
    expect(firstCardButton).toHaveAttribute("aria-selected", "true");

    fireEvent.click(screen.getByText("Discard cards"));
    expect(firstCardButton).toHaveAttribute("aria-selected", "false");

    fireEvent.click(firstCardButton);
    expect(firstCardButton).toHaveAttribute("aria-selected", "false");
  });

  it("should open discard modal when clicking on discard pile with discarded cards", async () => {
    const discardedCard: GameCard = {
      id: crypto.randomUUID(),
      match_id: MOCK_MATCH_ID,
      player_id: null,
      card_id: crypto.randomUUID(),
      name: "HERCULE POIROT",
      description: "A discarded card",
      type: "DETECTIVE",
      is_discarded: true,
      discarded_at: new Date(),
    };

    vi.mocked(useGame).mockReturnValue({
      secrets: [],
      cards: [...mockCards, discardedCard],
      match: {
        id: MOCK_MATCH_ID,
        name: "Test Match",
        status: "IN_PROGRESS",
        current_player_order: 1,
        max_players: 4,
        min_players: 2,
        owner_id: crypto.randomUUID(),
      },
      players: [],
      sets: [],
      isLoading: false,
      hasError: false,
      error: null,
    });

    render(<GameContainer />);

    const discardPile = screen.getByTestId("mock-discard-pile");

    await act(async () => {
      await userEvent.click(discardPile);
    });

    expect(screen.getByTestId("mock-discard-modal")).toBeInTheDocument();
  });

  it("should not close modal when in event discard mode", async () => {
    const discardedCard: GameCard = {
      id: crypto.randomUUID(),
      match_id: MOCK_MATCH_ID,
      player_id: null,
      card_id: crypto.randomUUID(),
      name: "HERCULE POIROT",
      description: "A discarded card",
      type: "DETECTIVE",
      is_discarded: true,
      discarded_at: new Date(),
    };

    vi.mocked(useGame).mockReturnValue({
      secrets: [],
      cards: [...mockCards, discardedCard],
      match: {
        id: MOCK_MATCH_ID,
        name: "Test Match",
        status: "IN_PROGRESS",
        current_player_order: 1,
        max_players: 4,
        min_players: 2,
        owner_id: crypto.randomUUID(),
      },
      players: [],
      sets: [],
      isLoading: false,
      hasError: false,
      error: null,
    });

    render(<GameContainer />);

    const discardPile = screen.getByTestId("mock-discard-pile");
    await act(async () => {
      await userEvent.click(discardPile);
    });

    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    expect(screen.queryByTestId("mock-discard-modal")).not.toBeInTheDocument();
  });

  it("should handle API error gracefully when finishing turn", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockPutMatchCards.mockRejectedValue(new Error("API Error"));

    render(<GameContainer />);

    const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
    fireEvent.click(firstCardButton);
    fireEvent.click(screen.getByText("Discard cards"));

    const finishButton = screen.getByText("Finish turn");

    await act(async () => {
      fireEvent.click(finishButton);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to put cards:",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it("should not call API when finishing turn without httpService", async () => {
    vi.mocked(useHttpService).mockReturnValue({
      httpService: null,
    });

    render(<GameContainer />);

    const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
    fireEvent.click(firstCardButton);
    fireEvent.click(screen.getByText("Discard cards"));

    const finishButton = screen.getByText("Finish turn");

    await act(async () => {
      fireEvent.click(finishButton);
    });

    expect(mockPutMatchCards).not.toHaveBeenCalled();
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

    expect(mockPutMatchCards).not.toHaveBeenCalled();
  });

  it("should not call API when finishing turn without match", async () => {
    vi.mocked(useGame).mockReturnValue({
      secrets: [],
      cards: mockCards,
      match: null,
      players: [],
      sets: [],
      isLoading: false,
      hasError: false,
      error: null,
    });

    render(<GameContainer />);

    const finishButton = screen.getByText("Finish turn");

    await act(async () => {
      fireEvent.click(finishButton);
    });

    expect(mockPutMatchCards).not.toHaveBeenCalled();
  });

  it("should not call API when finishing turn with no discarded cards", async () => {
    mockPutMatchCards.mockResolvedValue(undefined);

    render(<GameContainer />);

    const finishButton = screen.getByText("Finish turn");

    await act(async () => {
      fireEvent.click(finishButton);
    });

    expect(mockPutMatchCards).not.toHaveBeenCalled();
  });
});
