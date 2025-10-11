import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import type { GameCard } from "@/types/card";

import DiscardPile from "./DiscardPile";
import userEvent from "@testing-library/user-event";

const testCard: GameCard = {
  id: crypto.randomUUID(),
  card_id: crypto.randomUUID(),
  match_id: crypto.randomUUID(),
  player_id: crypto.randomUUID(),
  is_discarded: true,
  discarded_at: new Date(),
  name: "MR SATTERTHWAITE",
  type: "DETECTIVE",
  description:
    "Un hombre modesto con una habilidad sorprendente para resolver crímenes.",
};

const mockOnClick = vi.fn();

describe("DiscardPile", () => {
  describe("Rendering", () => {
    it("renders the empty discard pile", () => {
      render(<DiscardPile topCard={null} onClick={mockOnClick} />);

      expect(screen.getByText("Discard pile is empty")).toBeInTheDocument();
    });

    it("renders the discard pile with cards", () => {
      render(<DiscardPile topCard={testCard} onClick={mockOnClick} />);

      const cardElement = screen.getByRole("img");

      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveAttribute(
        "src",
        expect.stringContaining("satterthwaite.png"),
      );
    });
  });

  it("should call the 'onClick' function when clicking DiscardPile", async () => {
    const { unmount } = render(
      <DiscardPile topCard={null} onClick={mockOnClick} />,
    );

    const discardPileEmty = screen.getByTestId("discard-pile");
    expect(discardPileEmty).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(discardPileEmty);
    });

    expect(mockOnClick).toBeCalledTimes(1);
    mockOnClick.mockClear();

    unmount();

    render(<DiscardPile topCard={testCard} onClick={mockOnClick} />);

    const discardPileWithCard = screen.getByTestId("discard-pile");
    expect(discardPileWithCard).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(discardPileWithCard);
    });

    expect(mockOnClick).toBeCalledTimes(1);
  });
});
