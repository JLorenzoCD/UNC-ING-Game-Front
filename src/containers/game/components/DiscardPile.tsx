import type { Card as CardSchema} from "@/types/card.d.ts";
import Card from "./Card.tsx";


type DiscardPileProps = {
  topCard: CardSchema | null;
};

const DefaultCardImage = () => {
  return (
    <div className="w-40 h-60 border-2 border-dashed border-white rounded-md flex items-center justify-center text-center text-white">
    <p className="p-2">Discard pile is empty</p>
    </div>
  );
};

export default function DiscardPile({ topCard }: DiscardPileProps) {
  return (
    <div className="position absolute top-89.5 left-185">
      {topCard ? (
        <Card name={topCard.name} description={topCard.description}/>
      ) : (
        <DefaultCardImage/>
      )}
    </div>
  )
}
