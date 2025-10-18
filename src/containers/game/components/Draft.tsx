import type { GameCard } from "@/types/card";
import Card from "./Card";

interface DraftProps {
  cards: GameCard[];
  onClick: (card: GameCard) => void; // Callback que se ejecuta al tomar una carta del draft
  isDisabled: boolean; // Indica si el jugador puede tomar cartas del draft
}

export default function Draft({ cards, onClick, isDisabled }: DraftProps) {
  return (
    <div data-testid="draft" className="flex gap-x-3">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => onClick(card)}
          className={
            !isDisabled
              ? "cursor-pointer"
              : "cursor-not-allowed opacity-75 grayscale"
          }
        >
          <Card size="xsmall" name={card.name} description={card.description} />
        </button>
      ))}
    </div>
  );
}
