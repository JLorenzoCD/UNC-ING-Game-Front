import type { HandCard } from "@/types/card";
import Card from "./Card";

export const HAND_SIZE = 6; // Número máximo (y necesario al princio de cada ronda) de cartas en la mano

interface HandProps {
  cards: Array<HandCard | null>; // Un valor `null` representa una posición vacía en la mano;

  onSelect: (card: HandCard) => void; // Callback que se ejecuta al seleccionar una carta
  isSelected: (card: HandCard) => boolean; // Función para determinar si una carta está seleccionada
}

function EmptyHandPosition() {
  return (
    <div className="w-40 h-60 border-2 border-gray-400 border-dashed flex items-center justify-center">
      <div className="text-center text-gray-400 italic p-4">
        Draw a card here
      </div>
    </div>
  );
}

export default function Hand({ cards, onSelect, isSelected }: HandProps) {
  const selectedCardClassName = "ring-4 ring-blue-200";

  return (
    <div data-testid="hand" className="flex gap-x-4 items-center">
      {cards.map((card, index) =>
        card === null ? (
          <EmptyHandPosition key={`empty-${index}`} />
        ) : (
          <div
            key={card.id}
            data-testid="hand-card"
            onClick={() => onSelect(card)}
            className={`
                cursor-pointer hover:scale-105 transform transition-transform
                ${isSelected(card) ? selectedCardClassName : ""}
              `}
          >
            <Card name={card.name} description={card.description} />
          </div>
        ),
      )}
    </div>
  );
}
