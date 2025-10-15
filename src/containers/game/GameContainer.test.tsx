import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import type { GameCard } from "@/types/card";

import GameContainer from "./GameContainer";
import type { GamePlayer, Player } from "@/types/player";
import type { Match } from "@/types/match";

const MOCK_CARD_ID_1 = crypto.randomUUID();
const MOCK_CARD_ID_2 = crypto.randomUUID();
const MOCK_CARD_ID_3 = crypto.randomUUID(); // Carta disponible para robar
const MOCK_PLAYER_ID = crypto.randomUUID();
const MOCK_MATCH_ID = crypto.randomUUID();

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
    player_id: null,
    card_id: crypto.randomUUID(),
    name: "PARKER PYNE",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: false,
    discarded_at: null,
  },
];

/* Métodos mockeados por Vitest */

const { mockPutMatchCards, mockPutPassTurn } = vi.hoisted(() => {
  const mockPutMatchCards = vi.fn();
  const mockPutPassTurn = vi.fn();

  return { mockPutMatchCards, mockPutPassTurn };
});

/* Componentes mockeados por Vitest */

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
    isDiscarded,
    isDisabled,
  }: {
    cards: (GameCard | null)[];
    onSelect: (card: GameCard) => void;
    isSelected: (card: GameCard) => boolean;
    isDiscarded: (card: GameCard) => boolean;
    isDisabled?: boolean;
  }) => (
    <div data-testid="mock-hand">
      {cards.map((card, index) =>
        card ? (
          <button
            key={card.id}
            data-testid={`hand-card-${card.id}`}
            aria-selected={isSelected(card)}
            aria-disabled={isDiscarded(card)}
            onClick={() => onSelect(card)}
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
  default: vi.fn(({ onFinish, onDiscard, isDiscarding, isDisabled }) => (
    <div data-testid="mock-hand-actions">
      <button onClick={onDiscard} disabled={isDisabled}>
        {isDiscarding ? "Cancel discard" : "Discard cards"}
      </button>
      <button onClick={onFinish} disabled={isDisabled}>
        Finish turn
      </button>
    </div>
  )),
}));

vi.mock("./components/Sets", () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="mock-sets">Sets Component</div>),
}));

describe("GameContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPutPassTurn.mockReset();
    mockPutMatchCards.mockReset();

    vi.mocked(usePlayer).mockReturnValue({
      player: mockPlayer,
      setPlayer: vi.fn(),
    });

    vi.mocked(useGame).mockReturnValue({
      sets: [],
      secrets: [],
      cards: mockCards,
      match: mockMatch,
      players: [mockMatchPlayer],
      isLoading: false,
      hasError: false,
      error: null,
    });

    vi.mocked(useHttpService).mockReturnValue({
      httpService: {
        putMatchCards: mockPutMatchCards,
        putPassTurn: mockPutPassTurn,
      } as any,
    });
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

    it("should mark cards for discard when clicking 'Discard cards' button", () => {
      render(<GameContainer />);

      const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
      const discardButton = screen.getByText("Discard cards");

      // Seleccionamos la carta y la marcamos para descartar.
      fireEvent.click(firstCardButton);
      fireEvent.click(discardButton);

      expect(screen.getByText("Cancel discard")).toBeInTheDocument();
      expect(firstCardButton).toHaveAttribute("aria-disabled", "true");
    });

    it("should actually discard cards after finishing turn", async () => {
      mockPutMatchCards.mockResolvedValue(undefined);

      render(<GameContainer />);

      const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
      const discardButton = screen.getByText("Discard cards");
      const finishButton = screen.getByText("Finish turn");

      // Seleccionamos la carta.
      fireEvent.click(firstCardButton);
      expect(firstCardButton).toHaveAttribute("aria-selected", "true");

      // La marcamos para descartar.
      fireEvent.click(discardButton);

      // Chequeamos que marcamos para descartar correctamente.
      expect(screen.getByText("Cancel discard")).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(finishButton);
      });

      expect(mockPutMatchCards).toHaveBeenCalledTimes(1);
      expect(mockPutMatchCards).toHaveBeenCalledWith(
        MOCK_MATCH_ID,
        MOCK_PLAYER_ID,
        [MOCK_CARD_ID_3], // Carta a robar (única en la pila regular)
        [MOCK_CARD_ID_1], // Carta a descartar
      );
    });

    it("should cancel discard mode when clicking 'Cancel discard'", () => {
      render(<GameContainer />);

      const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
      const discardButton = screen.getByText("Discard cards");

      // Marcamos la carta para descartar.
      fireEvent.click(firstCardButton);
      fireEvent.click(discardButton);

      // Chequeamos que la carta está marcada para descartar.
      expect(firstCardButton).toHaveAttribute("aria-selected", "false");
      expect(firstCardButton).toHaveAttribute("aria-disabled", "true");

      // Chequeamos que ahora podemos cancelar el descarte.
      const cancelButton = screen.getByText("Cancel discard");
      expect(cancelButton).toBeInTheDocument();

      // Cancelamos el descarte.
      fireEvent.click(cancelButton);

      // Chequeamos que ya no estamos en modo descarte
      // y que la carta ya no está marcada para descartar.
      expect(screen.getByText("Discard cards")).toBeInTheDocument();
      expect(firstCardButton).toHaveAttribute("aria-disabled", "false");
    });

    it("should not allow selecting a card that is already marked for discard", () => {
      render(<GameContainer />);

      const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
      const discardButton = screen.getByText("Discard cards");

      // Seleccionamos la carta.
      fireEvent.click(firstCardButton);
      expect(firstCardButton).toHaveAttribute("aria-selected", "true");

      // La marcamos para descartar.
      fireEvent.click(discardButton);
      expect(firstCardButton).toHaveAttribute("aria-selected", "false");

      // Intentamos seleccionarla de nuevo.
      fireEvent.click(firstCardButton);
      expect(firstCardButton).toHaveAttribute("aria-selected", "false");
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
      vi.mocked(useGame).mockReturnValue({
        sets: [],
        secrets: [],
        players: [],
        match: mockMatch,
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
      });

      render(<GameContainer />);

      const discardPile = screen.getByTestId("mock-discard-pile");

      await act(async () => {
        await userEvent.click(discardPile);
      });

      expect(screen.getByTestId("mock-discard-modal")).toBeInTheDocument();
    });
  });

  describe("Turn", () => {
    it("should disable Hand and HandActions when it's not the player's turn", () => {
      vi.mocked(useGame).mockReturnValue({
        sets: [],
        secrets: [],
        cards: mockCards,
        players: [mockMatchPlayer],
        match: { ...mockMatch, current_player_order: 2 }, // Turno de otro jugador
        isLoading: false,
        hasError: false,
        error: null,
      });

      render(<GameContainer />);

      const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
      const discardButton = screen.getByText("Discard cards");
      const finishButton = screen.getByText("Finish turn");

      expect(firstCardButton).toBeDisabled();
      expect(discardButton).toBeDisabled();
      expect(finishButton).toBeDisabled();
    });

    it("should enable Hand and HandActions when it's the player's turn", () => {
      render(<GameContainer />);

      const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
      const discardButton = screen.getByText("Discard cards");
      const finishButton = screen.getByText("Finish turn");

      expect(firstCardButton).not.toBeDisabled();
      expect(discardButton).not.toBeDisabled();
      expect(finishButton).not.toBeDisabled();
    });
  });

  describe("Finish turn control flow", () => {
    it("should handle API error gracefully when finishing turn", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockPutMatchCards.mockRejectedValue(new Error("API Error"));

      render(<GameContainer />);

      const finishButton = screen.getByText("Finish turn");

      await act(async () => {
        fireEvent.click(finishButton);
      });

      // Esto vale para ambos casos, tanto el descarte obligatorio
      // como el manual.
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Error),
      );

      expect(mockPutMatchCards).toHaveBeenCalledTimes(1);
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

    it("should call mandatory discard when finishing turn with no manually discarded cards", async () => {
      mockPutMatchCards.mockResolvedValue(undefined);
      mockPutPassTurn.mockResolvedValue(undefined);

      render(<GameContainer />);

      const finishButton = screen.getByText("Finish turn");

      await act(async () => {
        fireEvent.click(finishButton);
      });

      // Ejecutamos el descarte obligatorio
      expect(mockPutMatchCards).toHaveBeenCalledTimes(1);
      expect(mockPutMatchCards).toHaveBeenCalledWith(
        MOCK_MATCH_ID,
        MOCK_PLAYER_ID,
        [MOCK_CARD_ID_3], // First takeable card
        expect.arrayContaining([expect.any(String)]), // Random card from hand
      );

      // Pasamos el turno
      expect(mockPutPassTurn).toHaveBeenCalledTimes(1);
      expect(mockPutPassTurn).toHaveBeenCalledWith(MOCK_MATCH_ID);
    });

    it("should perform manual discard when finishing turn after marking cards for discard", async () => {
      mockPutMatchCards.mockResolvedValue(undefined);
      mockPutPassTurn.mockResolvedValue(undefined);

      render(<GameContainer />);

      const firstCardButton = screen.getByTestId(`hand-card-${MOCK_CARD_ID_1}`);
      const discardButton = screen.getByText("Discard cards");

      // Seleccionamos y marcamos una carta para descartar
      fireEvent.click(firstCardButton);
      fireEvent.click(discardButton);

      const finishButton = screen.getByText("Finish turn");

      await act(async () => {
        fireEvent.click(finishButton);
      });

      // Should call putMatchCards with the specifically marked card
      expect(mockPutMatchCards).toHaveBeenCalledTimes(1);
      expect(mockPutMatchCards).toHaveBeenCalledWith(
        MOCK_MATCH_ID,
        MOCK_PLAYER_ID,
        [MOCK_CARD_ID_3], // Carta en la pila regular
        [MOCK_CARD_ID_1], // La carta que marcamos para descartar
      );

      // Pasamos el turno
      expect(mockPutPassTurn).toHaveBeenCalledTimes(1);
      expect(mockPutPassTurn).toHaveBeenCalledWith(MOCK_MATCH_ID);

      // Se resetea el estado de descarte
      expect(screen.getByText("Discard cards")).toBeInTheDocument();
    });

    it("should not perform discard if no cards are available to take", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock cards with no takeable cards
      vi.mocked(useGame).mockReturnValue({
        sets: [],
        match: mockMatch,
        secrets: [],
        players: [mockMatchPlayer],
        cards: [
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
        ],
        isLoading: false,
        hasError: false,
        error: null,
      });

      mockPutMatchCards.mockResolvedValue(undefined);
      mockPutPassTurn.mockResolvedValue(undefined);

      render(<GameContainer />);

      const finishButton = screen.getByText("Finish turn");

      await act(async () => {
        fireEvent.click(finishButton);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to finish turn:",
        expect.any(Error),
      );

      expect(mockPutMatchCards).not.toHaveBeenCalled();
      expect(mockPutPassTurn).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
