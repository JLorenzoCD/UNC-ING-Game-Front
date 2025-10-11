import { render, screen } from "@testing-library/react";
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

describe("Hand", () => {
  const mockOnSelect = vi.fn();
  const mockIsSelected = vi.fn().mockReturnValue(false);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders a full hand of cards", () => {
      render(
        <Hand
          cards={fullHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
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
        />,
      );

      const cardElements = screen.queryAllByRole("img");
      const emptyElements = screen.getAllByText("Draw a card here");

      expect(cardElements.length).toBe(0);
      expect(emptyElements.length).toBe(6);
    });
  });

  describe("Interactions", () => {
    it("calls onSelect when a card is clicked", () => {
      render(
        <Hand
          cards={fullHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
        />,
      );

      const cardElements = screen.getAllByTestId("hand-card");
      cardElements[0].click();

      expect(mockOnSelect).toHaveBeenCalledOnce();
    });

    it("calls onSelect with the correct card", () => {
      render(
        <Hand
          cards={fullHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
        />,
      );

      const cardElements = screen.getAllByTestId("hand-card");
      cardElements[1].click();

      expect(mockOnSelect).toHaveBeenCalledWith(fullHand[1]);
    });

    it("applies selected styling when isSelected returns true", () => {
      mockIsSelected.mockReturnValueOnce(true); // La primera carta estará seleccionada

      render(
        <Hand
          cards={fullHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
        />,
      );

      const cardElements = screen.getAllByTestId("hand-card");
      expect(cardElements[0].className).toContain("ring-4 ring-blue-200");
    });

    it("does not apply selected styling when isSelected returns false", () => {
      mockIsSelected.mockReturnValue(false); // Ninguna carta estará seleccionada

      render(
        <Hand
          cards={fullHand}
          onSelect={mockOnSelect}
          isSelected={mockIsSelected}
        />,
      );

      const cardElements = screen.getAllByTestId("hand-card");
      cardElements.forEach((card) => {
        expect(card.className).not.toContain("ring-4 ring-blue-200");
      });
    });
  });
});
