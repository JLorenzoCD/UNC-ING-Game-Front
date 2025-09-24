import cardBackImage from "@/assets/01-card_back.png"

type DrawPileProps = {
  cardCount: number;
};

export default function DrawPile({ cardCount }: DrawPileProps) {
  return (
    <div className="position absolute top-90 left-235">
      <img src={cardBackImage} className="w-40 h-60 object-cover" />
      <div className="text-white">REMAINING: {cardCount}</div>
    </div>
  )
}
