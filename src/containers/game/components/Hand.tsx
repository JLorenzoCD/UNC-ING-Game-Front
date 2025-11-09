import type { GameCard } from "@/types/card";
import Card, { CARD_SIZES } from "./Card";
import { twMerge } from "tailwind-merge";

interface HandProps {
  cards: Array<GameCard | null>; // Un valor `null` representa una posición vacía en la mano;

  onSelect: (card: GameCard) => void; // Callback que se ejecuta al seleccionar una carta
  isSelected: (card: GameCard) => boolean; // Función para determinar si una carta está seleccionada
  onDoubleClickCard?: (card: GameCard) => void; // Handler al hacer doble click
  isDisabled: boolean; // Indica si la mano está deshabilitada (no se pueden ejecutar acciones)
  isSelecting: boolean; // Indica si el jugador está en modo de selección
  isActivateNSF: boolean; // Indica si el jugador puede jugar una Not so fast
  isPendingResponse: boolean; // Indica si el jugador tiene que seleccionar una carta para intercambiar
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
  isActivateNSF = false,
  onDoubleClickCard,
  isPendingResponse = false,
}: HandProps) {
  // Si la mano está deshabilitada, aplicamos estilos para indicar que no se puede interactuar
  const disabledClassName =
    "pointer-events-none cursor-not-allowed opacity-75 grayscale-50";

  // Una carta seleccionada se resalta con un borde y se eleva ligeramente
  const selectedCardClassName = "rounded-lg ring-4 ring-red-500 -translate-y-4";

  // Si estamos en momento de elegir una nsf
  const selectedNSFClasName =
    "rounded-lg ring-4 ring-blue-500 -translate-y-4 animate-pulse";

  // Si estamos en un evento de seleccionar carta
  const pendingResponseClassName =
    "rounded-lg animate-pulse ring-4 ring-yellow-500";

  const shouldDecreaseCardOpacity = (isSelected: boolean) => {
    if (isSelected || isDisabled || isActivateNSF || isPendingResponse)
      return false;
    return isSelecting;
  };

  const handleClick = (card: GameCard) => {
    if (isDisabled || isActivateNSF || isPendingResponse) return;

    onSelect(card);
  };

  const handleDoubleClick = (card: GameCard) => {
    if (!onDoubleClickCard) return;

    if (isActivateNSF) {
      if (card.name === "NOT SO FAST") {
        onDoubleClickCard(card);
      }
      return;
    }

    if (isPendingResponse) {
      onDoubleClickCard(card);
      return;
    }
  };

  return (
    <div data-testid="hand" className="flex gap-x-4 items-center">
      {cards.map((card, index) => {
        if (card === null) {
          return <EmptyHandPosition key={`empty-${index}`} />;
        }

        const isCardSelected = isSelected(card);
        const isNotSoFastCard = card.name === "NOT SO FAST";
        const isCardOpacityDecreased =
          shouldDecreaseCardOpacity(isCardSelected);

        return (
          <div
            key={card.id}
            data-testid="hand-card"
            aria-disabled={
              isDisabled ||
              (isActivateNSF && !isNotSoFastCard) ||
              isPendingResponse
            }
            aria-selected={isCardSelected}
            onClick={() => handleClick(card)}
            onDoubleClick={() => handleDoubleClick(card)}
            className={twMerge(
              "cursor-pointer hover:scale-105 transform transition-all duration-150",
              isActivateNSF // 1. Prioridad: Evento NSF
                ? isNotSoFastCard
                  ? selectedNSFClasName // 1a. Carta NSF
                  : disabledClassName // 1b. Otras cartas (deshabilitadas)
                : isPendingResponse // 2. Prioridad: Evento Pendiente
                  ? pendingResponseClassName // 2a. TODAS las cartas pulsando en amarillo
                  : isDisabled // 3. Prioridad: Mano deshabilitada
                    ? disabledClassName
                    : isCardSelected // 4. Estado normal: Carta seleccionada
                      ? selectedCardClassName
                      : isCardOpacityDecreased // 5. Estado normal: Atenuado
                        ? "opacity-80"
                        : "",
            )}
          >
            <Card name={card.name} description={card.description} />
          </div>
        );
      })}
    </div>
  );
}
