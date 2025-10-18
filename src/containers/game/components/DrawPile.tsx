import { CARD_SIZES } from "./Card";
import { DRAFT_SIZE } from "../GameContainer";

import cardBackImage from "@/assets/01-card_back.png";
import cardMurdererEscapes from "@/assets/02-murder_escapes.png";

interface DrawPileProps {
  onClick: () => void;
  cardCount: number;
}

export default function DrawPile({ onClick, cardCount }: DrawPileProps) {
  return (
    <img
      src={cardCount === 0 ? cardMurdererEscapes : cardBackImage}
      alt="Draw pile top card"
      data-testid="draw-pile"
      onClick={onClick}
      className={`${CARD_SIZES.small} rounded-lg object-cover`}
    />
  );
}
