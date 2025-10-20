import { describe, it, expect } from "vitest";
import type { UUID } from "@/types/common";
import type { CardName, GameCard } from "@/types/card";
import type { SetCreationData } from "@/types/set";

import {
  cardsToSetTypeDetective,
  isValidTwoBeresfordSetType,
  isCardsValidSet,
  cardsToSet,
  isSetTargetOneSecret,
  isSetWithQuin,
  isSetActionRevealSecret,
  isSetActionStolenSecret,
} from "./setEvent";

const MOCK_PLAYER_ID = "player-123" as UUID;
const MOCK_MATCH_ID = "match-456" as UUID;
const MOCK_OTHER_PLAYER_ID = "player-999" as UUID;
const MOCK_TARGET_PLAYER_ID = "player-target-789" as UUID;
const MOCK_TARGET_SECRET_ID = "secret-target-000" as UUID;

// Factory de Cartas Mock
const createMockCard = (
  name: CardName,
  id: string,
  overrides: Partial<GameCard> = {},
): GameCard => ({
  id: id as UUID,
  match_id: MOCK_MATCH_ID,
  player_id: MOCK_PLAYER_ID,
  card_id: crypto.randomUUID(),
  name,
  description: "Test card",
  type: "DETECTIVE",
  is_discarded: false,
  discarded_at: null,
  ...overrides,
});

// Cartas Específicas
const cardPoirot1 = createMockCard("HERCULE POIROT", "c1");
const cardPoirot2 = createMockCard("HERCULE POIROT", "c2");
const cardPoirot3 = createMockCard("HERCULE POIROT", "c3");

const cardMarple1 = createMockCard("MISS MARPLE", "c4");
const cardMarple2 = createMockCard("MISS MARPLE", "c5");

const cardSatterthwaite1 = createMockCard("MR SATTERTHWAITE", "c7");
const cardSatterthwaite2 = createMockCard("MR SATTERTHWAITE", "c8");

const cardTommy = createMockCard("TOMMY BERESFORD", "c9");
const cardTuppence = createMockCard("TUPPENCE BERESFORD", "c10");

const cardPyne1 = createMockCard("PARKER PYNE", "c15");
const cardPyne2 = createMockCard("PARKER PYNE", "c16");

const cardQuin1 = createMockCard("HARLEY QUIN WILDCARD", "c11");
const cardQuin2 = createMockCard("HARLEY QUIN WILDCARD", "c12");

const cardOliver = createMockCard("ARIADNE OLIVER", "c14");

// Sets Válidos / Inválidos

// HERCULE POIROT (3 cards required)
const validPoirotSet: GameCard[] = [cardPoirot1, cardPoirot2, cardPoirot3];
const validPoirotSetWithOneQuin: GameCard[] = [
  cardPoirot1,
  cardPoirot2,
  cardQuin1,
];
const validPoirotSetWithTwoQuins: GameCard[] = [
  cardPoirot1,
  cardQuin1,
  cardQuin2,
];
const invalidPoirotSetShort: GameCard[] = [cardPoirot1, cardPoirot2];

// TWO BERESFORD (2 cards required, 1 Tommy + 1 Tuppence)
const validTwoBeresfordSet: GameCard[] = [cardTommy, cardTuppence];

// MR SATTERTHWAITE (2 cards required)
const validSatterthwaiteSet: GameCard[] = [
  cardSatterthwaite1,
  cardSatterthwaite2,
];
const validSatterthwaiteSetWithQuin: GameCard[] = [
  cardSatterthwaite1,
  cardQuin1,
];

// Sets Inválidos
const mixedSet: GameCard[] = [cardPoirot1, cardMarple1]; // Mixed detectives
const invalidBeresfordQuin: GameCard[] = [cardTommy, cardTuppence, cardQuin1]; // Beresford set cannot have Quin

describe("utils", () => {
  describe("isValidTwoBeresfordSetType", () => {
    it("should return true for a set with exactly one Tommy and one Tuppence Beresford", () => {
      expect(isValidTwoBeresfordSetType(validTwoBeresfordSet)).toBe(true);
    });

    it("should return false if the set includes a wildcard (Quin)", () => {
      expect(isValidTwoBeresfordSetType(invalidBeresfordQuin)).toBe(false);
    });

    it("should return false for a set of a single detective type", () => {
      const invalidSet = [cardTommy, cardTommy];
      expect(isValidTwoBeresfordSetType(invalidSet)).toBe(false);
    });
  });

  describe("cardsToSetTypeDetective", () => {
    it("should return 'TWO BERESFORD' for a valid Tommy/Tuppence set", () => {
      expect(cardsToSetTypeDetective(validTwoBeresfordSet)).toBe(
        "TWO BERESFORD",
      );
    });

    it("should return the correct SetType for a simple set (e.g.: HERCULE POIROT)", () => {
      expect(cardsToSetTypeDetective(validPoirotSet)).toBe("HERCULE POIROT");
    });

    it("should return the correct SetType for a set with wildcards (e.g.: HERCULE POIROT)", () => {
      expect(cardsToSetTypeDetective(validPoirotSetWithOneQuin)).toBe(
        "HERCULE POIROT",
      );
    });
  });

  describe("isCardsValidSet", () => {
    // Casos de límites de tamaño
    it("should return false for a set with less than 2 cards", () => {
      expect(isCardsValidSet([cardPoirot1])).toBe(false);
    });

    it("should return false for a set with more than 3 cards", () => {
      const tooManyCardsSet = [
        cardPoirot1,
        cardPoirot2,
        cardPoirot3,
        cardMarple1,
      ];
      expect(isCardsValidSet(tooManyCardsSet)).toBe(false);
    });

    // Casos de reglas de set
    it("should return false if the cards belong to different players", () => {
      const cardPoirot4 = createMockCard("HERCULE POIROT", "c100", {
        player_id: MOCK_OTHER_PLAYER_ID,
      });
      const mixedOwnerSet = [cardPoirot1, cardPoirot2, cardPoirot4];
      expect(isCardsValidSet(mixedOwnerSet)).toBe(false);
    });

    it("should return false for a set containing ARIADNE OLIVER", () => {
      expect(isCardsValidSet([cardPoirot1, cardOliver])).toBe(false);
    });

    it("should return false if the total number of cards does not match the set requirement (e.g.: Poirot needs 3, has 2)", () => {
      expect(isCardsValidSet(invalidPoirotSetShort)).toBe(false);
    });

    it("should return false if the Two Beresford set contains a wildcard", () => {
      // Un set Beresford solo puede tener 2 cartas (Tommy + Tuppence), un comodín lo haría de 3, lo cual es inválido para el set.
      expect(isCardsValidSet(invalidBeresfordQuin)).toBe(false);
    });

    it("should return false if it is a set composed of a mix of any card", () => {
      expect(isCardsValidSet(mixedSet)).toBe(false);
    });

    // Casos Válidos
    it("should return true for a valid HERCULE POIROT set (3 cards)", () => {
      expect(isCardsValidSet(validPoirotSet)).toBe(true);
    });

    it("should return true for a HERCULE POIROT set with 1 Quin (3 cards total)", () => {
      expect(isCardsValidSet(validPoirotSetWithOneQuin)).toBe(true);
    });

    it("should return true for a HERCULE POIROT set with 2 Quins (3 cards total)", () => {
      expect(isCardsValidSet(validPoirotSetWithTwoQuins)).toBe(true);
    });

    it("should return true for a valid TWO BERESFORD set (2 cards)", () => {
      expect(isCardsValidSet(validTwoBeresfordSet)).toBe(true);
    });

    it("should return true for a MR SATTERTHWAITE set with 1 Quin (2 cards total)", () => {
      expect(isCardsValidSet(validSatterthwaiteSetWithQuin)).toBe(true);
    });
  });

  describe("cardsToSet", () => {
    it("should create a correct SetCreationData object for a valid set", () => {
      const result = cardsToSet(validPoirotSet, MOCK_TARGET_PLAYER_ID);
      expect(result).toEqual({
        type: "HERCULE POIROT",
        player_id: MOCK_PLAYER_ID,
        card_ids: [cardPoirot1.id, cardPoirot2.id, cardPoirot3.id],
        target_player_id: MOCK_TARGET_PLAYER_ID,
      } as SetCreationData);
    });

    it("should include target_secret_id if provided", () => {
      const result = cardsToSet(
        validPoirotSet,
        MOCK_TARGET_PLAYER_ID,
        MOCK_TARGET_SECRET_ID,
      );
      expect(result.target_secret_id).toBe(MOCK_TARGET_SECRET_ID);
    });

    it("should throw an error for an invalid card set", () => {
      expect(() =>
        cardsToSet(invalidPoirotSetShort, MOCK_TARGET_PLAYER_ID),
      ).toThrow("The cards given are not a valid Set.");
    });
  });

  describe("isSetTargetOneSecret", () => {
    it("should return true for sets that target one secret (Poirot, Marple, Pyne)", () => {
      expect(isSetTargetOneSecret(validPoirotSet)).toBe(true);
      expect(isSetTargetOneSecret([cardMarple1, cardMarple2, cardQuin1])).toBe(
        true,
      );
      expect(isSetTargetOneSecret([cardPyne1, cardPyne2])).toBe(true);
    });

    it("should return false for sets that do not target one secret (Satterthwaite, Beresford, etc.)", () => {
      expect(isSetTargetOneSecret(validSatterthwaiteSet)).toBe(false);
      expect(isSetTargetOneSecret(validTwoBeresfordSet)).toBe(false);
    });
  });

  describe("isSetActionRevealSecret", () => {
    it("should return true for sets whose action is to reveal a secret (all except Parker Pyne)", () => {
      expect(isSetActionRevealSecret(validPoirotSet)).toBe(true);
      expect(isSetActionRevealSecret(validSatterthwaiteSet)).toBe(true);
    });

    it("should return false for PARKER PYNE", () => {
      expect(isSetActionRevealSecret([cardPyne1, cardPyne2])).toBe(false);
    });
  });

  describe("isSetWithQuin", () => {
    it("should return true if the set contains HARLEY QUIN WILDCARD", () => {
      expect(isSetWithQuin(validPoirotSetWithOneQuin)).toBe(true);
    });

    it("should return false if the set does not contain HARLEY QUIN WILDCARD", () => {
      expect(isSetWithQuin(validPoirotSet)).toBe(false);
    });
  });

  describe("isSetActionStolenSecret", () => {
    it("should return true for a MR SATTERTHWAITE set that includes a Quin wildcard", () => {
      expect(isSetActionStolenSecret(validSatterthwaiteSetWithQuin)).toBe(true);
    });

    it("should return false for a MR SATTERTHWAITE set without Quin", () => {
      expect(isSetActionStolenSecret(validSatterthwaiteSet)).toBe(false);
    });

    it("should return false for a set with Quin that is not MR SATTERTHWAITE", () => {
      expect(isSetActionStolenSecret(validPoirotSetWithOneQuin)).toBe(false);
    });
  });
});
