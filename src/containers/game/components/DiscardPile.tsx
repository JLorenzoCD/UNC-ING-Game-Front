import type { Card } from "../../../types/card.d.ts";
import GameCard from "./GameCard.tsx";


type DiscardPileProps = {
  topCard: Card | null;
};

const DefaultCardImage = () => {
  return (
    <div className="w-40 h-56 border-2 border-dashed border-white rounded-md flex items-center justify-center text-center text-white">
    <span className="p-2">Discard pile is empty</span>
    </div>
  );
};

export default function DiscardPile({ topCard }: DiscardPileProps) {
  return (
    <div className="w-40 position absolute top-89.5 left-185">
      {topCard ? (
        <GameCard card={topCard}/>
      ) : (
        <DefaultCardImage/>
      )}
    </div>
  )
}
