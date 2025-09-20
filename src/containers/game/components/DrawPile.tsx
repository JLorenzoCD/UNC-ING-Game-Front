const cardBack = { "CARD_BACK": "/cards/01-card_back.png" }

type DrawPileProps = {
  cardCount: number;
};

function DrawPile({ cardCount }: DrawPileProps) {
  return (
    <>
      <div className="w-40 h-50 position absolute top-90 left-235">
        <img src={cardBack["CARD_BACK"]} />
        <div className="draw-pile text-white">REMAINING: {cardCount}</div>
      </div>
    </>
  )
}

export default DrawPile;