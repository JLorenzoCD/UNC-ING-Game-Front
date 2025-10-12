import type { GameCard } from "@/types/card";
import Card, { CARD_SIZES } from "./Card";

interface HandProps {
  cards: Array<GameCard | null>; // Un valor `null` representa una posición vacía en la mano;

  onSelect: (card: GameCard) => void; // Callback que se ejecuta al seleccionar una carta
  isSelected: (card: GameCard) => boolean; // Función para determinar si una carta está seleccionada
  isSelecting: boolean; // Indica si el jugador está en modo de selección
  isDiscarded: (card: GameCard) => boolean; // Función para determinar si una carta está marcada para descartar
}

function EmptyHandPosition() {
  return (
    <div
      className={`${CARD_SIZES.small} border-2 border-gray-400 border-dashed flex items-center justify-center`}
    >
      <div className="text-center text-gray-400 italic p-4">
        Draw a card here
      </div>
    </div>
  );
}

export default function Hand({
  cards,
  onSelect,
  isSelected,
  isSelecting,
  isDiscarded,
}: HandProps) {
  // Una carta seleccionada se resalta con un borde y se eleva ligeramente
  const selectedCardClassName = "rounded-lg ring-4 ring-red-500 -translate-y-4";

  // Una carta descartada se muestra con opacidad reducida y en escala de grises
  const discaredCardClassName = "opacity-50 grayscale";

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
                cursor-pointer hover:scale-105 transform transition-all duration-150
                ${isSelected(card) ? selectedCardClassName : ""}
                ${isDiscarded(card) ? discaredCardClassName : ""}
                ${
                  // Si está en modo selección, y la carta no está seleccionada ni descartada,
                  // se aplica un leve oscurecimiento para indicar que no está activa.
                  isSelecting && !isSelected(card) && !isDiscarded(card)
                    ? "opacity-80"
                    : ""
                }
              `}
          >
            <Card name={card.name} description={card.description} />
          </div>
        ),
      )}
    </div>
  );
}
