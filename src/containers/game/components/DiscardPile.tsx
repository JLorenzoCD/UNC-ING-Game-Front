import type { GameCard } from "@/types/card.d.ts";
import Card from "./Card.tsx";

interface DiscardPileProps {
  topCard: GameCard | null;
}

const DefaultCardImage = () => {
  return (
    <div className="w-40 h-60 border-2 border-dashed border-white rounded-md flex items-center justify-center text-center text-white">
      <p className="p-2 select-none">Discard pile is empty</p>
    </div>
  );
};

export default function DiscardPile({ topCard }: DiscardPileProps) {
  const handleClick = () => {
    if (topCard === null) return;

    console.log("Entro");
  };

  return (
    <div data-testid="discard-pile" className="w-40 h-60" onClick={handleClick}>
      {topCard ? (
        <Card name={topCard.name} description={topCard.description} />
      ) : (
        <DefaultCardImage />
      )}
    </div>
  );
}
