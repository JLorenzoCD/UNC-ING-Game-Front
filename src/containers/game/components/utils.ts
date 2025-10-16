import type { GameCard } from "@/types/card";
import type { SetType } from "@/types/set";

const MIN_CARD_COUT_FOR_SET: Record<SetType, number> = {
  "HERCULE POIROT": 3,
  "MISS MARPLE": 3,
  "MR SATTERTHWAITE": 2,
  "PARKER PYNE": 2,
  "LADY EILEEN": 2,
  "TOMMY BERESFORD": 2,
  "TUPPENCE BERESFORD": 2,
  "TWO BERESFORD": 2,
} as const;
const MAX_CARD_COUNT = Math.max(...Object.values(MIN_CARD_COUT_FOR_SET));
const MIN_CARD_COUNT = Math.min(...Object.values(MIN_CARD_COUT_FOR_SET));
const MAX_QUIN_COUNT = 2 as const;

export function isCardsValidSet(cards: GameCard[]) {
  if (cards.length < MIN_CARD_COUNT || cards.length > MAX_CARD_COUNT)
    return false;

  const currCardPlayerOwnerId = cards[0].player_id;
  const currMatch = cards[0].match_id;

  const isAllDetectiveCardsValid = cards.every(
    (card) =>
      card.type === "DETECTIVE" &&
      card.player_id === currCardPlayerOwnerId &&
      !card.is_discarded &&
      card.discarded_at === null &&
      card.match_id === currMatch,
  );
  if (!isAllDetectiveCardsValid) return false;

  const cardsGroupByDetective = Object.groupBy(cards, (card) => card.name);

  if (Object.keys(cardsGroupByDetective).length > 2) return false;

  const quinDetective = cardsGroupByDetective["HARLEY QUIN WILDCARD"];
  if (quinDetective && quinDetective.length > MAX_QUIN_COUNT) return false;

  return true;
}
