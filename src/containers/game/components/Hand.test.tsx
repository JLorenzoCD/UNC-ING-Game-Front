import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { HandCard } from "@/types/card";
import Hand from "./Hand";

describe("Hand", () => {
  const match_id = crypto.randomUUID()
  const player_id = crypto.randomUUID()

  const fullHand: HandCard[] = [
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id,
      player_id,
      name: "POIROT",
      description: "Un detective belga famoso por su intelecto y sus métodos poco convencionales.",
      is_discarded: false,
    },
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id,
      player_id,
      name: "MARPLE",
      description: "Una astuta anciana que resuelve misterios en su pequeño pueblo.",
      is_discarded: false
    },
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id,
      player_id,
      name: "SATTERTHWAITE",
      description: "Un hombre modesto con una habilidad sorprendente para resolver crímenes.",
      is_discarded: false
    },
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id,
      player_id,
      name: "PYNE",
      description: "Un detective privado con un enfoque pragmático para resolver casos.",
      is_discarded: false
    },
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id,
      player_id,
      name: "BRENT",
      description: "Un detective aficionado con un talento natural para la observación.",
      is_discarded: false,
      
    },
    {
      id: crypto.randomUUID(),
      card_id: crypto.randomUUID(),
      match_id,
      player_id,
      name: "TOMMY",
      description: "Un joven detective que trabaja junto a su esposa Tuppence.",
      is_discarded: false
    },
  ]

  const partialHand = [fullHand[0], null, fullHand[1], null, fullHand[2], fullHand[3]]; // 4 cartas, 2 espacios vacíos en medio

  const emptyHand = [null, null, null, null, null, null]; // 0 cartas, 6 espacios vacíos

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

    it("renders an empty hand with all slots empty", () => {
      render(<Hand cards={emptyHand} />);

      const cardElements = screen.queryAllByRole("img");
      const emptyElements = screen.getAllByText("Draw a card here");

      expect(cardElements.length).toBe(0);
      expect(emptyElements.length).toBe(6);
    })
  })
})