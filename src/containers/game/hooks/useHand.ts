// NOTAS:
// - En el método `selectCard`, hay que tomar en cuenta el modal de descarte
//   para el evento "Look Into The Ashes".

import { useEffect, useRef, useState } from "react";

import type { GameCard } from "@/types/card";

import { useBasicGame } from "@/contexts/BasicGameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";
import { GAME_RULES } from "@/constants/game";
import { logError } from "@/utils/errorHandler";

type HandCardList = Array<GameCard | null>;
type GameCardMap = Record<string, GameCard>;

const HAND_SIZE = GAME_RULES.HAND_SIZE;

export function useHand() {
  const { httpService } = useHttpService();
  const { cards, match, playerFinishActionTurn } = useBasicGame();
  const { player } = usePlayer();

  /* -- Estado y referencias --  */

  const [handCards, setHandCards] = useState<HandCardList>(
    new Array(HAND_SIZE).fill(null),
  );
  const [selectedCards, setSelectedCards] = useState<GameCardMap>({});

  const [hasTakenCards, setHasTakenCards] = useState<boolean>(false);
  const [hasDiscardedCards, setHasDiscardedCards] = useState<boolean>(false);

  const handCardsRef = useRef(handCards);
  handCardsRef.current = handCards;

  /* -- Variables -- */

  const isSelectingCards = Object.keys(selectedCards).length > 0;

  const isHandFull = handCards.filter((c) => c !== null).length === HAND_SIZE;

  /* -- Acciones sobre la mano -- */

  const selectCard = (card: GameCard) => {
    setSelectedCards((current) => {
      if (current[card.id]) {
        const updated = { ...current };
        delete updated[card.id];
        return updated;
      }

      return {
        ...current,
        [card.id]: card,
      };
    });
  };

  const replaceCard = (oldCard: GameCard, newCard: GameCard) => {
    setHandCards((current) =>
      current.map((c) => (c && c.id === oldCard.id ? newCard : c)),
    );
  };

  /* -- Llamadas a la API -- */

  const takeCards = async (cards: GameCard[]) => {
    if (!httpService || !player || !match) return;

    try {
      const cardIds = cards.map((card) => card.id);
      await httpService.putTakeCards(match.id, player.id, cardIds);
    } catch (error) {
      logError(error, "Failed to take card");

      throw error;
    }
  };

  const discardCards = async (cards: GameCard[]) => {
    if (!httpService || !player || !match) return;

    try {
      const cardIds = cards.map((card) => card.id);
      await httpService.putDiscardCards(match.id, player.id, cardIds);
    } catch (error) {
      logError(error, "Failed to discard card");

      throw error;
    }
  };

  /* -- Utilidades -- */

  const isCardSelected = (card: GameCard) => {
    return Boolean(selectedCards[card.id]);
  };

  const updateAndFillHandWithNulls = (
    currHandCards: HandCardList,
    newHandCards: GameCard[],
  ): HandCardList => {
    const newHandCardsIds = new Set(newHandCards.map((c) => c.id));

    // Mantener cartas con el mismo id en el mismo orden, pero se actualizan
    const newHand: HandCardList = currHandCards.map((card) => {
      if (card && newHandCardsIds.has(card.id)) {
        const newCard = newHandCards.find((c) => c.id === card.id) as GameCard;

        newHandCardsIds.delete(card.id);
        return newCard;
      }

      return null;
    });

    // Todas las nuevas cartas de mano ya estaban en las cartas actuales, y se
    // actualizaron
    if (newHandCardsIds.size === 0) return newHand;

    // Se tienen que añadir las nuevas cartas en los espacios vacíos (nulls)
    for (let i = 0; i < newHand.length && newHandCardsIds.size > 0; i++) {
      const card = newHand[i];

      if (card === null) {
        const newCardId = Array.from(newHandCardsIds)[0];

        const newCard = newHandCards.find(
          (c) => c.id === newCardId,
        ) as GameCard;
        newHand[i] = newCard;

        newHandCardsIds.delete(newCardId);
      }
    }

    return newHand;
  };

  // PRE:
  //    currHandCards.every((card) => card.player_id === player.id && !card.is_discarded )
  //    newCards.every((card) => card.player_id === player.id && !card.is_discarded )
  const isValidCurrHand = (
    currHandCards: HandCardList,
    newCards: GameCard[],
  ) => {
    const currCardIds = new Set(
      currHandCards.filter((card) => card !== null).map((card) => card.id),
    );
    const newCardIds = new Set(newCards.map((card) => card.id));

    if (currCardIds.size !== newCardIds.size) return false;

    // Se elimino alguna carta de mano
    for (const cardId of currCardIds) {
      if (!newCardIds.has(cardId)) return false;
    }

    // Se añadió alguna carta a la mano
    for (const cardId of newCardIds) {
      if (!currCardIds.has(cardId)) return false;
    }

    // Faltaría verificar que las cartas no tengan algún campo modificado, pero
    // en este caso los únicos que cambian son el player_id y is_discarded/discarded_at
    // los cuales satisfacen PRE.

    return true;
  };

  const getRandomCard = (): GameCard | null => {
    const nonEmptyIndices = handCards
      .map((card, index) => (card !== null ? index : -1))
      .filter((index) => index !== -1);

    if (nonEmptyIndices.length === 0) return null;

    const randomIndex =
      nonEmptyIndices[Math.floor(Math.random() * nonEmptyIndices.length)];

    return handCards[randomIndex];
  };

  const clearSelectedCards = () => {
    setSelectedCards({});
  };

  /* -- Efectos -- */

  // Inicialmente, cargamos manualmente las cartas que pertenezcan al jugador
  // y no se hayan descartado. Luego, se actualizarán por WebSocket.
  useEffect(() => {
    // Evitamos generar la mano del jugador si todavía hay datos cargando
    // o si ya tiene cartas en su mano
    if (cards.length === 0 || player === null) return;

    const playerValidCards = cards.filter(
      (card) => card.player_id === player.id && !card.is_discarded,
    );

    if (isValidCurrHand(handCardsRef.current, playerValidCards)) return;

    setHandCards(
      updateAndFillHandWithNulls(handCardsRef.current, playerValidCards),
    );
  }, [cards, player]);

  useEffect(() => {
    if (hasTakenCards) playerFinishActionTurn();
  }, [hasTakenCards, playerFinishActionTurn]);

  return {
    clearSelectedCards,
    discardCards,
    getRandomCard,
    handCards,
    hasDiscardedCards,
    hasTakenCards,
    isCardSelected,
    isHandFull,
    isSelectingCards,
    replaceCard,
    selectCard,
    selectedCards,
    setHasDiscardedCards,
    setHasTakenCards,
    takeCards,
  };
}
