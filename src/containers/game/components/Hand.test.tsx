import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Card } from "@/types/card";
import Hand from "./Hand";

describe("Hand", () => {
  const fullHand: Card[] = [
    {
      id: crypto.randomUUID(),
      name: "POIROT",
      description: "Un detective belga famoso por su intelecto y sus métodos poco convencionales."
    },
    {
      id: crypto.randomUUID(),
      name: "MARPLE",
      description: "Una astuta anciana que resuelve misterios en su pequeño pueblo."
    },
    {
      id: crypto.randomUUID(),
      name: "SATTERTHWAITE",
      description: "Un hombre modesto con una habilidad sorprendente para resolver crímenes."
    },
    {
      id: crypto.randomUUID(),
      name: "PYNE",
      description: "Un detective privado con un enfoque pragmático para resolver casos."
    },
    {
      id: crypto.randomUUID(),
      name: "BRENT",
      description: "Un detective aficionado con un talento natural para la observación."
    },
    {
      id: crypto.randomUUID(),
      name: "TOMMY",
      description: "Un joven detective que trabaja junto a su esposa Tuppence."
    },
  ]

  const partialHand = fullHand.slice(0, 4); // 4 cartas, 2 espacios vacíos

  const emptyHand: Card[] = []; // 0 cartas, 6 espacios vacíos

  describe("Rendering", () => {
    it("renders a full hand of cards", () => {
      render(<Hand cards={fullHand} />);

      const cardElements = screen.getAllByRole("img");
      const emptyElements = screen.queryAllByText("Draw a card here");

      expect(cardElements.length).toBe(6);
      expect(emptyElements.length).toBe(0);
    })

    it("renders a partial hand with empty slots", () => {
      render(<Hand cards={partialHand} />);

      const cardElements = screen.getAllByRole("img");
      const emptyElements = screen.getAllByText("Draw a card here");

      expect(cardElements.length).toBe(4);
      expect(emptyElements.length).toBe(2);
    })

    it("renders empty slots at the end of the hand", () => {
      render(<Hand cards={partialHand} />);

      const handContainer = screen.getByTestId("hand");
      const children = Array.from(handContainer.children);
      const lastTwo = children.slice(-2);

      lastTwo.forEach(child => {
        expect(child.textContent).toBe("Draw a card here");
      });
    })

    it("renders an empty hand with all slots empty", () => {
      render(<Hand cards={emptyHand} />);

      const cardElements = screen.queryAllByRole("img");
      const emptyElements = screen.getAllByText("Draw a card here");

      expect(cardElements.length).toBe(0);
      expect(emptyElements.length).toBe(6);
    })

    it("matches the snapshot for a full hand", () => {
      const { asFragment } = render(<Hand cards={fullHand} />);
      expect(asFragment()).toMatchSnapshot();
    })

    it("matches the snapshot for a partial hand", () => {
      const { asFragment } = render(<Hand cards={partialHand} />);
      expect(asFragment()).toMatchSnapshot();
    })

    it("matches the snapshot for an empty hand", () => {
      const { asFragment } = render(<Hand cards={emptyHand} />);
      expect(asFragment()).toMatchSnapshot();
    })
  })
})