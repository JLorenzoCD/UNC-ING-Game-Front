import type { HandCard } from "@/types/card";
import Card from "./Card";

export const HAND_SIZE = 6; // Número máximo (y necesario al princio de cada ronda) de cartas en la mano

interface HandProps {
  cards: HandCard[];
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
  return (
    <div data-testid="hand" className="flex gap-x-4 items-center">
      {cards.map((card) => 
        card === null
          ? <EmptyHandPosition key={`empty-${Math.random()}`} />
          : <Card key={card.id} name={card.name} description={card.description} />
      )}
    </div>
  )
}