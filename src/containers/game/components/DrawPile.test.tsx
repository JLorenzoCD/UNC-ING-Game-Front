import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DrawPile from "./DrawPile";
import { DRAFT_SIZE } from "../GameContainer";

const mockOnClick = vi.fn();

describe("DrawPile", () => {
  describe("Rendering", () => {
    it("renders the usual draw pile", () => {
      render(<DrawPile cardCount={DRAFT_SIZE + 1} onClick={mockOnClick} />);

      const cardElement = screen.getByRole("img");

      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveAttribute(
        "src",
        expect.stringContaining("card_back.png"),
      );
    });

    it("renders murderer escapes when there are only cards in the draft", () => {
      render(<DrawPile cardCount={DRAFT_SIZE} onClick={mockOnClick} />);

      const cardElement = screen.getByRole("img");

      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveAttribute(
        "src",
        expect.stringContaining("murder_escapes.png"),
      );
    });
  });
});
