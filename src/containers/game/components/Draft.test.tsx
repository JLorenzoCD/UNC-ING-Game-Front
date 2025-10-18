import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import type { GameCard } from "@/types/card";
import Draft from "./Draft";

const match_id = crypto.randomUUID();
const player_id = crypto.randomUUID();

const createMockCard = (overrides?: Partial<GameCard>): GameCard => ({
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
  ...overrides,
});

const mockCards: GameCard[] = [
  createMockCard({
    name: "HERCULE POIROT",
    description:
      "Un detective belga famoso por su intelecto y sus métodos poco convencionales.",
  }),
  createMockCard({
    name: "MISS MARPLE",
    description:
      "Una astuta anciana que resuelve misterios en su pequeño pueblo.",
  }),
  createMockCard({
    name: "MR SATTERTHWAITE",
    description:
      "Un hombre modesto con una habilidad sorprendente para resolver crímenes.",
  }),
];

const { mockOnClick } = vi.hoisted(() => {
  const mockOnClick = vi.fn();

  return { mockOnClick };
});

describe("Draft", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders an empty draft when no cards are provided", () => {
      render(<Draft cards={[]} onClick={mockOnClick} isDisabled={false} />);

      const draftElement = screen.getByTestId("draft");
      expect(draftElement).toBeInTheDocument();
      expect(draftElement).toBeEmptyDOMElement();
    });

    it("renders a single card in the draft", () => {
      const singleCard = [mockCards[0]];

      render(
        <Draft cards={singleCard} onClick={mockOnClick} isDisabled={false} />,
      );

      const cardElements = screen.getAllByRole("img");
      expect(cardElements).toHaveLength(1);
    });

    it("renders multiple cards in the draft", () => {
      render(
        <Draft cards={mockCards} onClick={mockOnClick} isDisabled={false} />,
      );

      const cardElements = screen.getAllByRole("img");
      expect(cardElements).toHaveLength(3);
    });

    it("renders each card with correct description as alt text", () => {
      render(
        <Draft cards={mockCards} onClick={mockOnClick} isDisabled={false} />,
      );

      const poirotCard = screen.getByRole("img", {
        name: /Un detective belga famoso/i,
      });
      const marpleCard = screen.getByRole("img", {
        name: /Una astuta anciana/i,
      });
      const satterthwaiteCard = screen.getByRole("img", {
        name: /Un hombre modesto/i,
      });

      expect(poirotCard).toBeInTheDocument();
      expect(marpleCard).toBeInTheDocument();
      expect(satterthwaiteCard).toBeInTheDocument();
    });
  });

  describe("Disabled state styling", () => {
    it("applies enabled styling when isDisabled is false", () => {
      render(
        <Draft cards={mockCards} onClick={mockOnClick} isDisabled={false} />,
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button.className).toContain("cursor-pointer");
        expect(button.className).not.toContain("cursor-not-allowed");
        expect(button.className).not.toContain("opacity-75");
        expect(button.className).not.toContain("grayscale");
      });
    });

    it("applies disabled styling when isDisabled is true", () => {
      render(
        <Draft cards={mockCards} onClick={mockOnClick} isDisabled={true} />,
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button.className).toContain("cursor-not-allowed");
        expect(button.className).toContain("opacity-75");
        expect(button.className).toContain("grayscale");
        expect(button.className).not.toContain("cursor-pointer");
      });
    });
  });

  describe("Click interactions", () => {
    it("calls onClick with the correct card when a card is clicked", () => {
      render(
        <Draft cards={mockCards} onClick={mockOnClick} isDisabled={false} />,
      );

      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]);

      expect(mockOnClick).toHaveBeenCalledOnce();
      expect(mockOnClick).toHaveBeenCalledWith(mockCards[0]);
    });

    it("calls onClick with different cards when different buttons are clicked", () => {
      render(
        <Draft cards={mockCards} onClick={mockOnClick} isDisabled={false} />,
      );

      const buttons = screen.getAllByRole("button");

      fireEvent.click(buttons[0]);
      expect(mockOnClick).toHaveBeenCalledWith(mockCards[0]);

      fireEvent.click(buttons[1]);
      expect(mockOnClick).toHaveBeenCalledWith(mockCards[1]);

      fireEvent.click(buttons[2]);
      expect(mockOnClick).toHaveBeenCalledWith(mockCards[2]);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it("still calls onClick when isDisabled is true", () => {
      render(
        <Draft cards={mockCards} onClick={mockOnClick} isDisabled={true} />,
      );

      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]);

      expect(mockOnClick).toHaveBeenCalledOnce();
      expect(mockOnClick).toHaveBeenCalledWith(mockCards[0]);
    });
  });
});
