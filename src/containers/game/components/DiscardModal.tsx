import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Card from "./Card";

import backgroundGame from "@/assets/background.png";

import type { GameCard } from "@/types/card";

function getLastFiveDiscarded(discartedCards: GameCard[]): GameCard[] {
  const discarded = discartedCards.filter(
    (card) => card.is_discarded && card.discarded_at !== null,
  );

  // Ordenar las cartas de forma descendente por la fecha de descarte.
  discarded.sort((a, b) => {
    const dateA = a.discarded_at ? new Date(a.discarded_at).getTime() : 0;
    const dateB = b.discarded_at ? new Date(b.discarded_at).getTime() : 0;

    return dateB - dateA;
  });

  // Obtener las 5 más recientemente descartadas
  const latestFive = discarded.slice(0, 5);

  return latestFive;
}

interface Props {
  isOpen: boolean;
  isEventDiscard: boolean;
  discartedCards: GameCard[];

  onClose: () => void; // Callback que se ejecuta cerrar el modal
  onSelect: (card: GameCard) => void; // Callback que se ejecuta al seleccionar una carta
  isSelected: (card: GameCard) => boolean; // Función para determinar si una carta está seleccionada
  onEndEvent: () => void; // Callback que se ejecuta al
}

export default function DiscardModal({
  isOpen,
  onClose,
  discartedCards,
  onSelect,
  isSelected,
  isEventDiscard,
  onEndEvent,
}: Props) {
  if (discartedCards.length === 0) return null;

  const selectedCardClassName = "ring-4 ring-blue-200";
  const lastFiveCardDiscarted = getLastFiveDiscarded(discartedCards);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={
        <h3 className="text-2xl text-black font-bold p-4">
          The last 5 discarded cards
        </h3>
      }
      footer={
        <div className="p-3 w-full flex justify-end">
          {isEventDiscard ? (
            <Button type="button" onClick={onEndEvent} className="mr-2">
              End Event
            </Button>
          ) : (
            <Button type="button" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      }
    >
      <div
        className="flex gap-4 flex-wrap justify-center items-center bg-cover bg-center p-6"
        style={{ backgroundImage: `url(${backgroundGame})` }}
      >
        {lastFiveCardDiscarted.map((card) => (
          <div
            key={card.id}
            data-testid="discard-card"
            onClick={() => onSelect(card)}
            className={`
                cursor-pointer hover:scale-105 transform transition-transform
                ${isSelected(card) ? selectedCardClassName : ""}
                `}
          >
            <Card name={card.name} description={card.description} />
          </div>
        ))}
      </div>
    </Modal>
  );
}
