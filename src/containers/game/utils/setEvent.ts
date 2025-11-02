import type { UUID } from "@/types/common";
import type { CardName, GameCard } from "@/types/card";
import type { MatchSet, SetCreationData, SetType } from "@/types/set";

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

/*
 * pre: isCardsValidSet.
 */
export function cardsToSetTypeDetective(cards: GameCard[]) {
  let setType: SetType | null = null;

  if (isValidTwoBeresfordSetType(cards)) {
    setType = "TWO BERESFORD";
    return setType;
  }

  const cardsGroupByDetective = Object.groupBy(cards, (card) => card.name);
  if (cardsGroupByDetective["HARLEY QUIN WILDCARD"])
    delete cardsGroupByDetective["HARLEY QUIN WILDCARD"];
  if (cardsGroupByDetective["ARIADNE OLIVER"])
    delete cardsGroupByDetective["ARIADNE OLIVER"];

  const detectiveName = Object.keys(cardsGroupByDetective)[0];

  switch (detectiveName) {
    case "HERCULE POIROT":
    case "MISS MARPLE":
    case "MR SATTERTHWAITE":
    case "PARKER PYNE":
    case "LADY EILEEN":
    case "TOMMY BERESFORD":
    case "TUPPENCE BERESFORD":
      setType = detectiveName;
      break;

    default:
      setType = null;
  }

  return setType;
}

export function isValidTwoBeresfordSetType(cards: GameCard[]) {
  const cardsGroupByDetective = Object.groupBy(cards, (card) => card.name);
  if (Object.keys(cardsGroupByDetective).length !== 2) return false;

  const tommyBeresfordCards = cardsGroupByDetective["TOMMY BERESFORD"];
  const typplanceBeresfordCards = cardsGroupByDetective["TUPPENCE BERESFORD"];

  const isTommyBeresford =
    !!tommyBeresfordCards && tommyBeresfordCards.length === 1;
  const isTypplanceford =
    !!typplanceBeresfordCards && typplanceBeresfordCards.length === 1;

  return isTommyBeresford && isTypplanceford;
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

  const cardsGroupByDetective: Partial<Record<CardName | SetType, GameCard[]>> =
    Object.groupBy(cards, (card) => card.name);

  // Solo puede haber sets con 2 detectives diferentes como máximo
  if (Object.keys(cardsGroupByDetective).length > 2) return false;

  //* De momento los sets con Oliver no son permitidos
  const oliverDetective = cardsGroupByDetective["ARIADNE OLIVER"];
  if (oliverDetective && oliverDetective.length) return false;

  const quinDetective = cardsGroupByDetective["HARLEY QUIN WILDCARD"] ?? [];
  if (quinDetective.length > MAX_QUIN_COUNT) return false;

  const isTwoBeresford = isValidTwoBeresfordSetType(cards);
  if (quinDetective.length !== 0 && isTwoBeresford) return false;

  if (isTwoBeresford) {
    cardsGroupByDetective["TWO BERESFORD"] = [
      ...(cardsGroupByDetective["TOMMY BERESFORD"] as GameCard[]),
      ...(cardsGroupByDetective["TUPPENCE BERESFORD"] as GameCard[]),
    ];
  }

  const setType = cardsToSetTypeDetective(cards);
  if (setType === null || !cardsGroupByDetective[setType]) return false;

  if (
    cardsGroupByDetective[setType].length + quinDetective.length !==
      MIN_CARD_COUT_FOR_SET[setType] ||
    cardsGroupByDetective[setType].length + quinDetective.length !==
      cards.length
  )
    return false;

  return true;
}

export function cardsToSet(
  cards: GameCard[],
  targetPlayerId: UUID,
  targetSecretId?: UUID,
): SetCreationData {
  if (!isCardsValidSet(cards))
    throw new Error("The cards given are not a valid Set.");

  // Si o si debe haber 1 por validación de isCardsValidSet
  const cardDetective = cards.find(
    (card) => card.name !== "HARLEY QUIN WILDCARD",
  ) as GameCard;

  const player_id = cardDetective.player_id as UUID;
  const card_ids = cards.map((card) => card.id) as unknown as UUID[];
  const target_player_id = targetPlayerId;
  const target_secret_id = targetSecretId;

  // Si o si por isCardsValidSet
  const type = cardsToSetTypeDetective(cards) as SetType;

  const setData: SetCreationData = {
    type,
    player_id,
    card_ids,
    target_player_id,
  };

  if (target_secret_id) setData.target_secret_id = target_secret_id;

  return setData;
}

export function isSetTargetOneSecret(cards: GameCard[]) {
  if (!isCardsValidSet(cards))
    throw new Error("The cards given are not a valid Set.");

  // Valido por isCardsValidSet
  const setType = cardsToSetTypeDetective(cards) as SetType;

  switch (setType) {
    case "HERCULE POIROT":
    case "MISS MARPLE":
    case "PARKER PYNE":
      return true;
    case "MR SATTERTHWAITE":
    case "LADY EILEEN":
    case "TOMMY BERESFORD":
    case "TUPPENCE BERESFORD":
    case "TWO BERESFORD":
      return false;
  }
}

/*
 * pre: isCardsValidSet.
 */
export function isSetWithQuin(cards: GameCard[]) {
  const cardsGroupByDetective = Object.groupBy(cards, (card) => card.name);

  const quinDetective = cardsGroupByDetective["HARLEY QUIN WILDCARD"] ?? [];

  return quinDetective.length !== 0;
}

/*
 * pre: isCardsValidSet.
 */
export function isSetActionRevealSecret(cards: GameCard[]) {
  const setType = cardsToSetTypeDetective(cards) as SetType;

  return setType !== "PARKER PYNE";
}

/*
 * pre: isCardsValidSet.
 */
export function isSetActionStolenSecret(cards: GameCard[]) {
  const setType = cardsToSetTypeDetective(cards) as SetType;

  return setType === "MR SATTERTHWAITE" && isSetWithQuin(cards);
}

export function canDownTheCardToASet(
  card: GameCard,
  sets: MatchSet[],
  currPlayerId: UUID,
) {
  if (card.type !== "DETECTIVE") return false;
  if (sets.length === 0) return false;

  if (card.name === "HARLEY QUIN WILDCARD") return false;
  if (card.name === "ARIADNE OLIVER") return true;

  const currPlayerSetsType = Object.keys(
    Object.groupBy(
      sets.filter((s) => s.player_id === currPlayerId),
      (set) => set.type,
    ),
  ) as SetType[];
  if (currPlayerSetsType.length === 0) return false; // El jugador no tiene sets

  for (const setType of currPlayerSetsType) {
    if (card.name === setType) return true;

    if (
      setType === "TWO BERESFORD" &&
      (card.name === "TOMMY BERESFORD" || card.name === "TUPPENCE BERESFORD")
    )
      return true;
  }

  // El jugador actual no tiene ningún set valido al cual bajar la carta
  return false;
}
