import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

import type { GameCard } from "@/types/card";

import DiscardModal from "./DiscardModal";

// Mocks de Componentes Externos
vi.mock("@/components/Button", () => ({
  __esModule: true,
  default: vi.fn(({ children, onClick, className }) => (
    <button data-testid="mock-button" onClick={onClick} className={className}>
      {children}
    </button>
  )),
}));

vi.mock("@/components/Modal", () => ({
  __esModule: true,
  default: vi.fn(({ isOpen, onClose, header, footer, children }) =>
    isOpen ? (
      <div data-testid="mock-modal">
        <div data-testid="mock-modal-header">{header}</div>
        <button data-testid="mock-modal-close" onClick={onClose}>
          Close Modal
        </button>
        <div data-testid="mock-modal-footer">{footer}</div>
        {children}
      </div>
    ) : null,
  ),
}));

vi.mock("./Card", () => ({
  __esModule: true,
  default: vi.fn(({ name }) => <div data-testid="mock-card">{name}</div>),
}));

vi.mock("@/assets/background.png", () => ({ default: "mock-bg-url" }));

// --- Datos de Prueba ---
const NOW = new Date().getTime();
const ONE_SECOND = 1000;

const MATCH_ID = "10203040-5060-4708-890a-b0c0d0e0f0a0";
const CARD_1_ID = "a1b2c3d4-e5f6-4789-8012-34567890abcd";

const mockDiscardCards = [
  // 1. CARTA MÁS RECIENTE (DETECTIVE)
  {
    id: CARD_1_ID,
    match_id: MATCH_ID,
    player_id: null,
    card_id: "c0010000-0000-4000-8000-00000000000a",
    name: "HERCULE POIROT",
    description: "La carta más recientemente descartada.",
    type: "DETECTIVE",
    is_discarded: true,
    discarded_at: new Date(NOW).toISOString(),
  },
  // 2. Segunda más reciente (EVENT)
  {
    id: "b2c3d4e5-f6e5-4890-9123-4567890abcef",
    match_id: MATCH_ID,
    player_id: null,
    card_id: "c0010000-0000-4000-8000-00000000000b",
    name: "CARDS OFF THE TABLE",
    description: "Una carta descartada hace un momento.",
    type: "EVENT",
    is_discarded: true,
    discarded_at: new Date(NOW - ONE_SECOND).toISOString(),
  },
  {
    id: "a0000000-0000-4000-8000-000000000007",
    match_id: MATCH_ID,
    player_id: "00000000-0000-4000-8000-00000000abcd",
    card_id: "c0010000-0000-4000-8000-00000000000g",
    name: "SOCIAL FAUX PAS",
    description: "Debe ser filtrada por is_discarded: false.",
    type: "DEVIOUS",
    is_discarded: false,
    discarded_at: null,
  },
  // 3. Tercera más reciente (DEVIOUS)
  {
    id: "c3d4e5f6-d4c3-4901-a234-567890abcdef",
    match_id: MATCH_ID,
    player_id: null,
    card_id: "c0010000-0000-4000-8000-00000000000c",
    name: "BLACKMAILED",
    description: "Tercera en la pila.",
    type: "DEVIOUS",
    is_discarded: true,
    discarded_at: new Date(NOW - 2 * ONE_SECOND).toISOString(),
  },
  // 4. Cuarta más reciente (INSTANT)
  {
    id: "d4e5f6a1-c3b2-4012-b345-67890abcdef0",
    match_id: MATCH_ID,
    player_id: null,
    card_id: "c0010000-0000-4000-8000-00000000000d",
    name: "NOT SO FAST",
    description: "Cuarta en la pila.",
    type: "INSTANT",
    is_discarded: true,
    discarded_at: new Date(NOW - 3 * ONE_SECOND).toISOString(),
  },
  // 5. Quinta más reciente (DETECTIVE) - Límite visible
  {
    id: "e5f6a1b2-b2a1-4123-c456-7890abcdef01",
    match_id: MATCH_ID,
    player_id: null,
    card_id: "c0010000-0000-4000-8000-00000000000e",
    name: "MISS MARPLE",
    description: "Quinta en la pila y la última a mostrar.",
    type: "DETECTIVE",
    is_discarded: true,
    discarded_at: new Date(NOW - 4 * ONE_SECOND).toISOString(),
  },
  // 6. CARTA IGNORADA POR LÍMITE (EVENT)
  {
    id: "f6a1b2c3-a1b2-4234-d567-890abcdef012",
    match_id: MATCH_ID,
    player_id: null,
    card_id: "c0010000-0000-4000-8000-00000000000f",
    name: "ANOTHER VICTIM",
    description: "Debe ser filtrada por el límite de 5.",
    type: "EVENT",
    is_discarded: true,
    discarded_at: new Date(NOW - 5 * ONE_SECOND).toISOString(),
  },
] as GameCard[];

describe("DiscardModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSelect = vi.fn();
  const mockIsSelected = vi.fn((card: GameCard) => card.id === CARD_1_ID);
  const mockOnEndEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null if discartedCards array is empty", () => {
    const { container } = render(
      <DiscardModal
        isOpen={true}
        onClose={mockOnClose}
        discardedCards={[]}
        onSelect={mockOnSelect}
        isSelected={mockIsSelected}
        isEventDiscard={false}
        onEndEvent={mockOnEndEvent}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should return null if isOpen is false (handled by Modal mock)", () => {
    render(
      <DiscardModal
        isOpen={false}
        onClose={mockOnClose}
        discardedCards={mockDiscardCards}
        onSelect={mockOnSelect}
        isSelected={mockIsSelected}
        isEventDiscard={false}
        onEndEvent={mockOnEndEvent}
      />,
    );

    expect(screen.queryByTestId("mock-modal")).not.toBeInTheDocument();
  });

  it("should render only the last 5 discarded cards, ordered from newest to oldest", () => {
    render(
      <DiscardModal
        isOpen={true}
        onClose={mockOnClose}
        discardedCards={mockDiscardCards}
        onSelect={mockOnSelect}
        isSelected={mockIsSelected}
        isEventDiscard={false}
        onEndEvent={mockOnEndEvent}
      />,
    );

    const discardedCardElements = screen.getAllByTestId("discard-card");
    expect(discardedCardElements).toHaveLength(5);

    // La carta que no fue descartada no se cuenta
    expect(screen.queryByText("SOCIAL FAUX PAS")).not.toBeInTheDocument();

    // Verificar que las cartas mas recientemente descartadas se encuentren
    expect(screen.getByText("HERCULE POIROT")).toBeInTheDocument();
    expect(screen.getByText("CARDS OFF THE TABLE")).toBeInTheDocument();
    expect(screen.getByText("BLACKMAILED")).toBeInTheDocument();
    expect(screen.getByText("NOT SO FAST")).toBeInTheDocument();
    expect(screen.getByText("MISS MARPLE")).toBeInTheDocument();

    // La 6ta carta no se renderiza
    expect(screen.queryByText("ANOTHER VICTIM")).not.toBeInTheDocument();
  });

  it("should apply the selected class name to the selected card", () => {
    render(
      <DiscardModal
        isOpen={true}
        onClose={mockOnClose}
        discardedCards={mockDiscardCards.slice(0, 3)}
        onSelect={mockOnSelect}
        isSelected={mockIsSelected}
        isEventDiscard={false}
        onEndEvent={mockOnEndEvent}
      />,
    );

    const selectedCard = screen
      .getByText("HERCULE POIROT")
      .closest('[data-testid="discard-card"]');
    const unselectedCard = screen
      .getByText("CARDS OFF THE TABLE")
      .closest('[data-testid="discard-card"]');

    // La carta 1 (HERCULE POIROT) debe tener la clase de selección
    expect(selectedCard).toHaveClass("ring-4 ring-blue-200");

    // La carta 2 (CARDS OFF THE TABLE) no debe tener la clase de selección
    expect(unselectedCard).not.toHaveClass("ring-4 ring-blue-200");
  });

  it("should call onSelect with the correct card when a card is clicked", async () => {
    render(
      <DiscardModal
        isOpen={true}
        onClose={mockOnClose}
        discardedCards={mockDiscardCards.slice(0, 1)} // Solo HERCULE POIROT
        onSelect={mockOnSelect}
        isSelected={mockIsSelected}
        isEventDiscard={false}
        onEndEvent={mockOnEndEvent}
      />,
    );

    const cardElement = screen
      .getByText("HERCULE POIROT")
      .closest('[data-testid="discard-card"]');

    await userEvent.click(cardElement!);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(mockDiscardCards[0]);
  });

  it("should render the 'Close' button and call onClose when not in event discard mode", async () => {
    render(
      <DiscardModal
        isOpen={true}
        onClose={mockOnClose}
        discardedCards={mockDiscardCards.slice(0, 1)}
        onSelect={mockOnSelect}
        isSelected={mockIsSelected}
        isEventDiscard={false}
        onEndEvent={mockOnEndEvent}
      />,
    );

    const closeButton = screen.getByText("Close");
    expect(closeButton).toBeInTheDocument();
    expect(screen.queryByText("End Event")).not.toBeInTheDocument();

    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnEndEvent).not.toHaveBeenCalled();
  });

  it("should render the 'End Event' button and call onEndEvent when in event discard mode", async () => {
    render(
      <DiscardModal
        isOpen={true}
        onClose={mockOnClose}
        discardedCards={mockDiscardCards.slice(0, 1)}
        onSelect={mockOnSelect}
        isSelected={mockIsSelected}
        isEventDiscard={true}
        onEndEvent={mockOnEndEvent}
      />,
    );

    const endEventButton = screen.getByText("End Event");
    expect(endEventButton).toBeInTheDocument();
    expect(screen.queryByText("Close")).not.toBeInTheDocument();

    await userEvent.click(endEventButton);

    expect(mockOnEndEvent).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
