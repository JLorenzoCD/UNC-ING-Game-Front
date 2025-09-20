import type { Card as CardSchema } from "@/types/card";
import Card from "./Card";
import { useMemo } from "react";

export const HAND_SIZE = 6; // Número máximo (y necesario al princio de cada ronda) de cartas en la mano

interface HandProps {
  cards: CardSchema[];
}

function EmptyHandPosition() {
  return (
    <div className="w-40 h-60 border-2 border-gray-400 border-dashed flex items-center justify-center">
      <div className="text-center text-gray-400 italic p-4">
        Draw a card here
      </div>
    </div>
  )
}

export default function Hand({ cards }: HandProps) {
  const hand: Array<CardSchema | null> = useMemo(() => {
    if (cards.length < HAND_SIZE) {
      console.warn(`Hand has less than ${HAND_SIZE} cards. Filling with empty slots.`);

      // Llenamos la mano con posiciones vacías hasta llegar al tamaño HAND_SIZE.
      return [...cards, ...Array.from({ length: HAND_SIZE - cards.length }, () => null)];
    }

    return cards;
  }, [cards])

  return (
    <div data-testid="hand" className="flex gap-x-4 items-center">
      {hand.map((card) => 
        card === null
          ? <EmptyHandPosition key={`empty-${Math.random()}`} />
          : <Card key={card.id} name={card.name} description={card.description} />
      )}
    </div>
  )
}