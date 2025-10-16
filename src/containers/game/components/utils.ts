import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";
import type { SetType } from "@/types/set";

interface SetCreationData {
  type: SetType;
  card_ids: UUID[];
  player_id: UUID;
  target_player_id: UUID;
  target_secret_id?: UUID;
}

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

export function CardNameToSetTypeDetective(card: GameCard): SetType {
  let setType: SetType = "HERCULE POIROT";

  switch (card.name) {
    case "HERCULE POIROT":
    case "MISS MARPLE":
    case "MR SATTERTHWAITE":
    case "PARKER PYNE":
    case "LADY EILEEN":
    case "TOMMY BERESFORD":
    case "TUPPENCE BERESFORD":
      setType = card.name;
      break;

    default:
      throw new Error("The given card is not a valid detective.");
  }

  return setType;
}

export function isValidTwoBeresfordSetType(cards: GameCard[]) {
  const cardsGroupByDetective = Object.groupBy(cards, (card) => card.name);

  const tommyBeresfordCards = cardsGroupByDetective["TOMMY BERESFORD"];
  const typplanceBeresfordCards = cardsGroupByDetective["TUPPENCE BERESFORD"];

  const isTommyBeresford =
    !!tommyBeresfordCards && tommyBeresfordCards.length === 1;
  const istypplanceford =
    !!typplanceBeresfordCards && typplanceBeresfordCards.length === 1;

  return isTommyBeresford && istypplanceford;
}

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

  if (!quinDetective && !isValidTwoBeresfordSetType(cards)) return false;

  return true;
}

export function cardsToSet(
  cards: GameCard[],
  targetPlayerId: UUID,
  targetSecretId?: UUID,
): SetCreationData {
  if (!isCardsValidSet(cards))
    throw new Error("The cards given are not a valid Set.");

  // Si o si debe haber 1, isCardsValidSet lo valida
  const cardDetective = cards.find(
    (card) => card.name !== "HARLEY QUIN WILDCARD",
  ) as GameCard;

  const player_id = cardDetective.player_id as UUID;
  const card_ids = cards.filter((card) => card.id) as unknown as UUID[];
  const target_player_id = targetPlayerId;
  const target_secret_id = targetSecretId;

  let type: SetType = "HERCULE POIROT";
  if (isValidTwoBeresfordSetType(cards)) {
    type = "TWO BERESFORD";
  } else {
    type = CardNameToSetTypeDetective(cardDetective);
  }

  const setData: SetCreationData = {
    type,
    player_id,
    card_ids,
    target_player_id,
    target_secret_id,
  };

  return setData;
}
