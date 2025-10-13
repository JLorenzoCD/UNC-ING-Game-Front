import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DrawPile from "./DrawPile";

describe("DrawPile", () => {
  describe("Rendering", () => {
    it("renders the usual draw pile", () => {
      render(<DrawPile cardCount={1} />);

      const cardElement = screen.getByRole("img");

      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveAttribute(
        "src",
        expect.stringContaining("card_back.png"),
      );
    });

    it("renders murderer escapes when card count is zero", () => {
      render(<DrawPile cardCount={0} />);

      const cardElement = screen.getByRole("img");

      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveAttribute(
        "src",
        expect.stringContaining("murder_escapes.png"),
      );
    });
  });
});
