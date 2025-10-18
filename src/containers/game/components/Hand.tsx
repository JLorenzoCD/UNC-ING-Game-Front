import type { GameCard } from "@/types/card";
import Card, { CARD_SIZES } from "./Card";
import { twMerge } from "tailwind-merge";

interface HandProps {
  cards: Array<GameCard | null>; // Un valor `null` representa una posición vacía en la mano;

  onSelect: (card: GameCard) => void; // Callback que se ejecuta al seleccionar una carta
  isSelected: (card: GameCard) => boolean; // Función para determinar si una carta está seleccionada
  isDisabled: boolean; // Indica si la mano está deshabilitada (no se pueden ejecutar acciones)
  isSelecting: boolean; // Indica si el jugador está en modo de selección
}

function EmptyHandPosition() {
  return (
    <div
      className={`${CARD_SIZES.default} border-2 border-gray-400 border-dashed flex items-center justify-center`}
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
  isDisabled,
}: HandProps) {
  // Si la mano está deshabilitada, aplicamos estilos para indicar que no se puede interactuar
  const disabledClassName =
    "pointer-events-none cursor-not-allowed opacity-75 grayscale-50";

  // Una carta seleccionada se resalta con un borde y se eleva ligeramente
  const selectedCardClassName = "rounded-lg ring-4 ring-red-500 -translate-y-4";

  const shouldDecreaseCardOpacity = (isSelected: boolean) => {
    if (isSelected || isDisabled) return false;

    return isSelecting;
  };

  const handleClick = (card: GameCard) => {
    if (isDisabled) return;

    onSelect(card);
  };

  return (
    <div data-testid="hand" className="flex gap-x-4 items-center">
      {cards.map((card, index) => {
        if (card === null) {
          return <EmptyHandPosition key={`empty-${index}`} />;
        }

        const isCardSelected = isSelected(card);
        const isCardOpacityDecreased =
          shouldDecreaseCardOpacity(isCardSelected);

        return (
          <div
            key={card.id}
            data-testid="hand-card"
            aria-disabled={isDisabled}
            aria-selected={isCardSelected}
            onClick={() => handleClick(card)}
            className={twMerge(
              "cursor-pointer hover:scale-105 transform transition-all duration-150",
              isDisabled ? disabledClassName : "",
              isCardSelected ? selectedCardClassName : "",
              isCardOpacityDecreased ? "opacity-80" : "",
            )}
          >
            <Card name={card.name} description={card.description} />
          </div>
        );
      })}
    </div>
  );
}
