import cardBackImage from "@/assets/01-card_back.png";

interface DrawPileProps {
  cardCount: number;
}

export default function DrawPile({ cardCount }: DrawPileProps) {
  return (
    <div data-testid="draw-pile" className="w-40 h-60">
      <img src={cardBackImage} className="w-40 h-60 object-cover" />
      <div className="text-white">REMAINING: {cardCount}</div>
    </div>
  );
}
