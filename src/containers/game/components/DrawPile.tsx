import cardBackImage from "@/assets/01-card_back.png";
import cardMurdererEscapes from "@/assets/02-murder_escapes.png";

interface DrawPileProps {
  cardCount: number;
}

export default function DrawPile({ cardCount }: DrawPileProps) {
  return (
    <div data-testid="draw-pile" className="w-40 h-60">
      {cardCount == 0 ? (
        <img src={cardMurdererEscapes} className="w-40 h-60 object-cover" />
      ) : (
        <img src={cardBackImage} className="w-40 h-60 object-cover" />
      )}
      <div className="text-white">REMAINING: {cardCount}</div>
    </div>
  );
}
