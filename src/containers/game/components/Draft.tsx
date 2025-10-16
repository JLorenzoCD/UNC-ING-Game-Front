import type { GameCard } from "@/types/card";
import Card from "./Card";

interface DraftProps {
  cards: GameCard[];
  onTake: (card: GameCard) => void; // Callback que se ejecuta al tomar una carta del draft
  canTake: boolean; // Indica si el jugador puede tomar cartas del draft
}

export default function Draft({ cards, onTake, canTake }: DraftProps) {
  const handleTake = (card: GameCard) => {
    if (!canTake) return;

    onTake(card);
  };

  return (
    <div data-testid="draft" className="flex gap-x-3">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => handleTake(card)}
          className={
            canTake
              ? "cursor-pointer"
              : "cursor-not-allowed pointer-events-none"
          }
        >
          <Card size="xsmall" name={card.name} description={card.description} />
        </div>
      ))}
    </div>
  );
}
