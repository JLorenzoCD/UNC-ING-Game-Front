import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";

import type { GameCard } from "@/types/card";

import GameContainer from "./GameContainer";

const MOCK_CARD_ID_1 = crypto.randomUUID();
const MOCK_CARD_ID_2 = crypto.randomUUID();
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
];

vi.mock("@/contexts/GameContext");

vi.mock("@/contexts/PlayerContext");

vi.mock("./components/Table", () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="mock-table">Table Component</div>),
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
      discartedCards,
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
          {discartedCards.map((card: GameCard) => (
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

describe("GameContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock return values
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
      match: null,
      players: [],
      sets: [],
      isLoading: false,
      hasError: false,
      error: null,
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

    // Initially, no cards are selected
    expect(firstCardButton).toBeInTheDocument();
    expect(firstCardButton).toHaveAttribute("aria-selected", "false");
    expect(secondCardButton).toBeInTheDocument();
    expect(secondCardButton).toHaveAttribute("aria-selected", "false");

    // Simulate selecting the first card
    fireEvent.click(firstCardButton);
    expect(firstCardButton).toHaveAttribute("aria-selected", "true");
    expect(secondCardButton).toHaveAttribute("aria-selected", "false");

    // Simulate selecting the second card (first remains selected)
    fireEvent.click(secondCardButton);
    expect(firstCardButton).toHaveAttribute("aria-selected", "true");
    expect(secondCardButton).toHaveAttribute("aria-selected", "true");

    // Simulate deselecting the first card
    fireEvent.click(firstCardButton);
    expect(firstCardButton).toHaveAttribute("aria-selected", "false");
    expect(secondCardButton).toHaveAttribute("aria-selected", "true");

    // Simulate deselecting the second card
    fireEvent.click(secondCardButton);
    expect(firstCardButton).toHaveAttribute("aria-selected", "false");
    expect(secondCardButton).toHaveAttribute("aria-selected", "false");
  });

  it("should not show the DiscardModal when clicking on the DiscardPile, since there are no discarded cards", async () => {
    render(<GameContainer />);

    const discardPile = screen.getByTestId("mock-discard-pile");

    await act(async () => {
      await userEvent.click(discardPile);
    });

    expect(screen.queryByTestId("mock-discard-modal")).not.toBeInTheDocument();
  });

  // TODO: Añadir tests sobre el modal de cartas descartadas. Actualmente no se
  // pude ya que no hay forma de descartar alguna carta.
});
