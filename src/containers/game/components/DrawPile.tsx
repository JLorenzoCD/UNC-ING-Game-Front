import cardBackImage from "@/assets/01-card_back.png";
import cardMurdererEscapes from "@/assets/02-murder_escapes.png";

interface DrawPileProps {
  cardCount: number;
}

export default function DrawPile({ cardCount }: DrawPileProps) {
  return (
    <div data-testid="draw-pile" className="w-30 h-[180px]">
      {cardCount == 0 ? (
        <img
          src={cardMurdererEscapes}
          className="w-30 h-[180px] object-cover"
        />
      ) : (
        <img src={cardBackImage} className="w-30 h-[180px] object-cover" />
      )}
      <div className="text-white">REMAINING: {cardCount}</div>
    </div>
  );
}
