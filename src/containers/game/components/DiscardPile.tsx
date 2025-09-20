import type { Card } from "../../../types/card.d.ts";
const cards: Record<string, string> = { 
    "POIROT" : "/cards/07-detective_poirot.png",
    "MARPLE" : "/cards/08-detective_marple.png",
    "SATTERTHWAITE" : "/cards/09-detective_satterthwaite.png",
    "PYNE" : "/cards/10-detective_pyne.png",
    "BRENT" : "/cards/11-detective_brent.png",
    "TOMMY" : "/cards/12-detective_tommyberesford.png",
    "TUPPENCE" : "/cards/13-detective_tuppenceberesford.png",
    "QUIN" : "/cards/14-detective_quin.png",
    "OLIVER" : "/cards/15-detective_oliver.png",
    "NOT SO FAST" : "/cards/16-Instant_notsofast.png",
    "CARDS ON THE TABLE" : "/cards/17-event_cardsonetable.png",
    "ANOTHER VICTIM" : "/cards/18-event_anothervictim.png",
    "DEAD CARD FOLLY" : "/cards/19-event_deadcardfolly.png",
    "LOOK ASHES" : "/cards/20-event_lookashes.png",
    "CARD TRADE" : "/cards/21-event_cardtrade.png",
    "ONE MORE" : "/cards/22-event_onemore.png",
    "DELAY ESCAPE" : "/cards/23-event_delayescape.png",
    "EARLY TRAIN" : "/cards/24-event_earlytrain.png",
    "POINT SUSPICIONS" : "/cards/25-event_pointsuspicions.png",
    "BLACK MAILED" : "/cards/26-devious_blackmailed.png",
    "FAUX PAS" : "/cards/27-devious_fauxpas.png",
}

type DiscardPileProps = {
  topCard: Card | null;
  cardCount: number;
};

const defaultCardImage = () => {
  return (
    <div className="w-40 h-56 border-2 border-dashed border-white rounded-md flex items-center justify-center text-center text-white">
    <span className="p-2">Discard pile is empty</span>
    </div>
  );
};

function DiscardPile(props: DiscardPileProps) {
  const { topCard, cardCount } = props;
  return (
    <>
      <div className="w-40 position absolute top-89.5 left-185">
        {topCard ? (
          <img src={cards[topCard.name]} />
        ) : (
          defaultCardImage()
        )}
      <div className="draw-pile text-white">DISCARDS: {cardCount}</div>
      </div>
    </>
  )
}

export default DiscardPile;