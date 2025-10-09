import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Card from "./Card";

import backgroundGame from "@/assets/background.png";

import type { GameCard } from "@/types/card";

function getLastFiveDiscarded(discartedCards: GameCard[]): (GameCard | null)[] {
  // 1. Filtrar las cartas que realmente han sido descartadas (discarded_at no es null)
  const discarded = discartedCards.filter(
    (card) => card.discarded_at instanceof Date,
  );

  // 2. Ordenar las cartas de forma descendente por la fecha de descarte.
  //    Cuanto más reciente es la fecha, mayor es su valor, por lo que va primero.
  discarded.sort((a, b) => {
    // Nota: Aunque ya se filtró, TypeScript aún requiere la comprobación para a.discarded_at y b.discarded_at.
    const dateA = a.discarded_at ? a.discarded_at.getTime() : 0;
    const dateB = b.discarded_at ? b.discarded_at.getTime() : 0;

    // b.getTime() - a.getTime() produce un orden descendente (el más reciente va primero)
    return dateB - dateA;
  });

  // 3. Obtener las primeras 5 cartas (las más recientes)
  const latestFive = discarded.slice(0, 5);

  // 4. Rellenar con nulls si hay menos de 5 elementos
  //    Crea un nuevo arreglo de 5 elementos, mapea los índices
  //    para devolver la carta si existe, o null si el índice supera el número de cartas.
  const result: (GameCard | null)[] = Array.from({ length: 5 }, (_, index) => {
    return latestFive[index] || null;
  });

  return result;
}

interface Props {
  isOpen: boolean;
  discartedCards: GameCard[];

  onClose: () => void;
  onSelect: (card: GameCard) => void; // Callback que se ejecuta al seleccionar una carta
  isSelected: (card: GameCard) => boolean; // Función para determinar si una carta está seleccionada
}

export default function DiscardModal({
  isOpen,
  onClose,
  discartedCards,
  onSelect,
  isSelected,
}: Props) {
  if (discartedCards.length === 0) return null;

  const selectedCardClassName = "ring-4 ring-blue-200";
  const lastFiveCardDiscarted = getLastFiveDiscarded(discartedCards);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={
        <h3 className="text-2xl text-black font-bold p-4 md:p-5">
          The last 5 discarded cards
        </h3>
      }
      footer={
        <div className="p-3 w-full flex justify-end">
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div
        className="flex gap-4 flex-wrap justify-center items-center bg-cover bg-center p-6"
        style={{ backgroundImage: `url(${backgroundGame})` }}
      >
        {lastFiveCardDiscarted.map((card) =>
          card === null ? null : (
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
    </Modal>
  );
}
