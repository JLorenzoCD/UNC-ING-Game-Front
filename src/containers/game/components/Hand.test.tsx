import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GameCard } from "@/types/card";
import Hand from "./Hand";

const match_id = crypto.randomUUID();
const player_id = crypto.randomUUID();

const fullHand: GameCard[] = [
  {
    id: crypto.randomUUID(),
    card_id: crypto.randomUUID(),
    match_id,
    player_id,
    name: "HERCULE POIROT",
    type: "DETECTIVE",
    description:
      "Un detective belga famoso por su intelecto y sus métodos poco convencionales.",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: crypto.randomUUID(),
    card_id: crypto.randomUUID(),
    match_id,
    player_id,
    name: "MISS MARPLE",
    type: "DETECTIVE",
    description:
      "Una astuta anciana que resuelve misterios en su pequeño pueblo.",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: crypto.randomUUID(),
    card_id: crypto.randomUUID(),
    match_id,
    player_id,
    name: "MR SATTERTHWAITE",
    type: "DETECTIVE",
    description:
      "Un hombre modesto con una habilidad sorprendente para resolver crímenes.",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: crypto.randomUUID(),
    card_id: crypto.randomUUID(),
    match_id,
    player_id,
    name: "PARKER PYNE",
    type: "DETECTIVE",
    description:
      "Un detective privado con un enfoque pragmático para resolver casos.",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: crypto.randomUUID(),
    card_id: crypto.randomUUID(),
    match_id,
    player_id,
    name: "LADY EILEEN",
    type: "DETECTIVE",
    description:
      "Un detective aficionado con un talento natural para la observación.",
    is_discarded: false,
    discarded_at: null,
  },
  {
    id: crypto.randomUUID(),
    card_id: crypto.randomUUID(),
    match_id,
    player_id,
    name: "TOMMY BERESFORD",
    type: "DETECTIVE",
    description: "Un joven detective que trabaja junto a su esposa Tuppence.",
    is_discarded: false,
    discarded_at: null,
  },
];

const partialHand = [
  fullHand[0],
  null,
  fullHand[1],
  null,
  fullHand[2],
  fullHand[3],
]; // 4 cartas, 2 espacios vacíos en medio

const emptyHand = [null, null, null, null, null, null]; // 0 cartas, 6 espacios vacíos

const { mockOnSelect, mockIsSelected, mockIsDiscarded } = vi.hoisted(() => {
  const mockOnSelect = vi.fn();
  const mockIsSelected = vi.fn();
  const mockIsDiscarded = vi.fn();

  return { mockOnSelect, mockIsSelected, mockIsDiscarded };
});

vi.mock("", () => ({
  twMerge: vi.fn((...classes) => classes.filter(Boolean).join(" ")),
}));

describe("Hand", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockIsSelected.mockReturnValue(false);
    mockIsDiscarded.mockReturnValue(false);
  });

  describe("Rendering", () => {
    it("renders a full hand of cards", () => {
      render(
        <Hand
          cards={fullHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
          isSelecting={false}
          isDisabled={false}
        />,
      );

      const cardElements = screen.getAllByRole("img");
      const emptyElements = screen.queryAllByText("Draw a card here");

      expect(cardElements.length).toBe(6);
      expect(emptyElements.length).toBe(0);
    });

    it("renders a partial hand with empty slots", () => {
      render(
        <Hand
          cards={partialHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
          isSelecting={false}
          isDisabled={false}
        />,
      );

      const cardElements = screen.getAllByRole("img");
      const emptyElements = screen.getAllByText("Draw a card here");

      expect(cardElements.length).toBe(4);
      expect(emptyElements.length).toBe(2);
    });

    it("renders an empty hand with all slots empty", () => {
      render(
        <Hand
          cards={emptyHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
          isSelecting={false}
          isDisabled={false}
        />,
      );

      const cardElements = screen.queryAllByRole("img");
      const emptyElements = screen.getAllByText("Draw a card here");

      expect(cardElements.length).toBe(0);
      expect(emptyElements.length).toBe(6);
    });

    it("applies disabled styles when isDisabled is true", () => {
      render(
        <Hand
          cards={fullHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
          isSelecting={false}
          isDisabled={true} // Mano deshabilitada
        />,
      );

      const handCardElement = screen.getAllByTestId("hand-card")[0];
      expect(handCardElement.className).toContain("pointer-events-none");
      expect(handCardElement.className).toContain("cursor-not-allowed");
      expect(handCardElement.className).toContain("opacity-75");
      expect(handCardElement.className).toContain("grayscale-50");
    });
  });

  describe("Interactions", () => {
    it("calls onSelect when a card is clicked", () => {
      render(
        <Hand
          cards={fullHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
          isSelecting={false}
          isDisabled={false}
        />,
      );

      const cardElements = screen.getAllByTestId("hand-card");
      fireEvent.click(cardElements[0]);

      expect(mockOnSelect).toHaveBeenCalledOnce();
      expect(mockOnSelect).toHaveBeenCalledWith(fullHand[0]);
    });

    it("does not call onSelect when a card is clicked and isDisabled is true", () => {
      render(
        <Hand
          cards={fullHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
          isSelecting={false}
          isDisabled={true} // Mano deshabilitada
        />,
      );

      const cardElements = screen.getAllByTestId("hand-card");
      fireEvent.click(cardElements[0]);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it("applies selected styling when isSelected returns true", () => {
      mockIsSelected.mockReturnValueOnce(true).mockReturnValueOnce(true); // La primera carta estará seleccionada (esta se llama 2 veces, en el aria-selected y en la className)

      render(
        <Hand
          cards={fullHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
          isSelecting={false}
          isDisabled={false}
        />,
      );

      const cardElements = screen.getAllByTestId("hand-card");
      expect(cardElements[0].className).toContain("ring-4 ring-red-500");
    });

    it("does not apply selected styling when isSelected returns false", () => {
      mockIsSelected.mockReturnValue(false); // Ninguna carta estará seleccionada

      render(
        <Hand
          cards={fullHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
          isSelecting={false}
          isDisabled={false}
        />,
      );

      const cardElements = screen.getAllByTestId("hand-card");
      cardElements.forEach((card) => {
        expect(card.className).not.toContain("ring-4 ring-red-500");
      });
    });

    it("decreases opacity when user is selecting other cards", () => {
      // Por defecto, devolvemos false.
      // Para la primer, segunda y tercera llamada devolvemos true
      // (chequeo de `isSelected` and `shouldDecreaseOpacity`)
      mockIsSelected.mockReturnValueOnce(true);

      render(
        <Hand
          cards={fullHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
          isSelecting={true} // El usuario está en modo selección
          isDisabled={false}
        />,
      );

      screen.debug();

      const cardElements = screen.getAllByTestId("hand-card");
      cardElements.forEach((card, index) => {
        if (index === 0) {
          // La primera carta está seleccionada, no debería tener opacidad reducida
          expect(card.className).not.toContain("opacity-80");
        } else {
          // Las demás cartas deberían tener opacidad reducida
          expect(card.className).toContain("opacity-80");
        }
      });
    });
  });
});
