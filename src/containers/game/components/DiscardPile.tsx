import type { GameCard } from "@/types/card.d.ts";

import Card, { CARD_SIZES } from "./Card.tsx";

interface DiscardPileProps {
  topCard: GameCard | null;
  onClick: () => void;
}

const DefaultCardImage = () => {
  return (
    <div
      className={`${CARD_SIZES.small} border-2 border-dashed border-white rounded-md flex items-center justify-center text-center text-white`}
    >
      <p className="p-2 select-none">Discard pile is empty</p>
    </div>
  );
};

export default function DiscardPile({ topCard, onClick }: DiscardPileProps) {
  return (
    <div data-testid="discard-pile" onClick={onClick}>
      {topCard ? (
        <Card
          size="small"
          name={topCard.name}
          description={topCard.description}
        />
      ) : (
        <DefaultCardImage />
      )}
    </div>
  );
}
