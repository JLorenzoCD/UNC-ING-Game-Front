import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DrawPile from "./DrawPile";

const mockOnClick = vi.fn();

describe("DrawPile", () => {
  describe("Rendering", () => {
    it("renders the usual draw pile", () => {
      render(<DrawPile cardCount={1} onClick={mockOnClick} />);

      const cardElement = screen.getByRole("img");

      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveAttribute(
        "src",
        expect.stringContaining("card_back.png"),
      );
    });

    it("renders murderer escapes when card count is zero", () => {
      render(<DrawPile cardCount={0} onClick={mockOnClick} />);

      const cardElement = screen.getByRole("img");

      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveAttribute(
        "src",
        expect.stringContaining("murder_escapes.png"),
      );
    });
  });
});
