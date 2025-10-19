// NOTAS:
// - En el método `selectCard`, hay que tomar en cuenta el modal de descarte
//   para el evento "Look Into The Ashes".

import { useEffect, useRef, useState } from "react";

import type { GameCard } from "@/types/card";
import type { UUID } from "@/types/common";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

type HandCardList = Array<GameCard | null>;
type GameCardMap = Record<string, GameCard>;

const HAND_SIZE = 6;

export function useHand() {
  const { httpService } = useHttpService();
  const { cards, match } = useGame();
  const { player } = usePlayer();

  /* -- Estado y referencias --  */

  const [handCards, setHandCards] = useState<HandCardList>([]);
  const [selectedCards, setSelectedCards] = useState<GameCardMap>({});

  const [hasTakenCards, setHasTakenCards] = useState<boolean>(false);
  const [hasDiscardedCards, setHasDiscardedCards] = useState<boolean>(false);

  // Determina si es la primera vez que se carga el componente.
  // Se usa para cargar la mano del jugador solo una vez.
  // Luego, las actualizaciones de cartas se harán por WebSocket.
  const initialLoadRef = useRef<boolean>(true);

  /* -- Variables -- */

  const isSelectingCards = Object.keys(selectedCards).length > 0;

  const isHandFull = handCards.filter((c) => c !== null).length === HAND_SIZE;

  /* -- Acciones sobre la mano -- */

  const addCard = (card: GameCard) => {
    setHandCards((current) => {
      const emptyIndex = current.findIndex((c) => c === null);

      if (emptyIndex !== -1) {
        // Si hay una posición vacía, colocamos la carta allí
        const updated = [...current];
        card.player_id = player?.id as UUID;

        updated[emptyIndex] = card;
        return updated;
      }

      // Si no hay posiciones vacías, agregamos la carta al final
      return [...current, card];
    });
  };

  const removeCard = (card: GameCard) => {
    // Removemos la carta de la mano.
    // La reemplazamos con `null` para mantener la posición.
    setHandCards((current) =>
      current.map((c) => (c && c.id === card.id ? null : c)),
    );

    // La de-seleccionamos si estaba seleccionada.
    setSelectedCards((current) => {
      if (!current[card.id]) return current;

      const updated = { ...current };
      delete updated[card.id];
      return updated;
    });
  };

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

      for (const card of cards) addCard(card);
    } catch (error) {
      console.error("Failed to take card:", error);

      throw error;
    }
  };

  const discardCards = async (cards: GameCard[]) => {
    if (!httpService || !player || !match) return;

    try {
      const cardIds = cards.map((card) => card.id);
      await httpService.putDiscardCards(match.id, player.id, cardIds);

      for (const card of cards) removeCard(card);
    } catch (error) {
      console.error("Failed to discard card:", error);

      throw error;
    }
  };

  /* -- Utilidades -- */

  const isCardSelected = (card: GameCard) => {
    return Boolean(selectedCards[card.id]);
  };

  const fillHandWithNulls = (cards: GameCard[]): HandCardList => {
    const filledHand: HandCardList = [...cards];

    while (filledHand.length < HAND_SIZE) {
      filledHand.push(null);
    }

    return filledHand;
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

    if (!initialLoadRef.current) return;

    initialLoadRef.current = false;

    setHandCards(
      fillHandWithNulls(
        cards.filter(
          (card) => card.player_id === player.id && !card.is_discarded,
        ),
      ),
    );
  }, [cards, player]);

  return {
    addCard,
    clearSelectedCards,
    discardCards,
    getRandomCard,
    handCards,
    hasDiscardedCards,
    hasTakenCards,
    isCardSelected,
    isHandFull,
    isSelectingCards,
    removeCard,
    replaceCard,
    selectCard,
    selectedCards,
    setHasDiscardedCards,
    setHasTakenCards,
    takeCards,
  };
}
