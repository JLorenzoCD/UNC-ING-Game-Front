import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react";
import type { Card } from "../../../types/card";
import DiscardPile from "./DiscardPile";

const testCard : Card = {
  id: crypto.randomUUID(),
  name: "SATTERTHWAITE",
  description: "Un hombre modesto con una habilidad sorprendente para resolver crímenes."
}

describe("DiscardPile", () => {
  describe("Rendering", () => {

    it("renders the empty discard pile", () => {
      render(<DiscardPile topCard={null}/>);

      expect(screen.getByText("Discard pile is empty")).toBeInTheDocument();
    })

    it("renders the discard pile with cards", () => {
      render(<DiscardPile topCard={testCard}/>);

      const cardElement = screen.getByRole("img");

      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveAttribute("src", expect.stringContaining("satterthwaite.png"));
    })

  })
})