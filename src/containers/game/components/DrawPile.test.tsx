import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DrawPile from "./DrawPile";

describe("DrawPile", () => {
  describe("Rendering", () => {
    it("renders the draw pile with 40 cards", () => {
      render(<DrawPile cardCount={40} />);

      const cardElement = screen.getByRole("img");

      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveAttribute(
        "src",
        expect.stringContaining("card_back.png"),
      );
      expect(screen.getByText("REMAINING: 40")).toBeInTheDocument();
    });

    it("renders finish game with 0 cards", () => {
      render(<DrawPile cardCount={0} />);

      const cardElement = screen.getByRole("img");

      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveAttribute(
        "src",
        expect.stringContaining("murder_escapes.png"),
      );
      expect(screen.getByText("REMAINING: 0")).toBeInTheDocument();
    });
  });
});
