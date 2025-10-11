import { useEffect, useMemo, useRef, useState } from "react";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import Hand from "./components/Hand";
import Table from "./components/Table";
import Secrets from "./components/Secrets";
import DrawPile from "./components/DrawPile";
import DiscardPile from "./components/DiscardPile";
import HandActions from "./components/HandActions";

export default function GameContainer() {
  const { player } = usePlayer();
  const { httpService } = useHttpService();
  const { match, secrets, cards } = useGame();

  const initialLoadRef = useRef<boolean>(true);

  const [handCards, setHandCards] = useState<Array<GameCard | null>>([]);

  const [selectedCards, setSelectedCards] = useState<Record<UUID, GameCard>>(
    {},
  );

  const [discardedCards, setDiscardedCards] = useState<Record<UUID, GameCard>>(
    {},
  );

  // -- Valores memoizados --

  const lastDiscardedCard = useMemo(() => {
    // TODO: ordenar por momento de descarte.
    const lastDiscardedCard = cards.find((card) => card.is_discarded);

    return lastDiscardedCard ?? null;
  }, [cards]);

  const drawableCards = useMemo(() => {
    return cards.filter((card) => {
      // Una carta es tomable si no pertenece a ningún jugador
      // y no está descartada.
      return card.player_id === null && !card.is_discarded;
    });
  }, [cards]);

  // -- Utilidades --

  const isCardSelected = (card: GameCard) => {
    return !!selectedCards[card.id];
  };

  const isCardDiscarded = (card: GameCard) => {
    return !!discardedCards[card.id];
  };

  // -- Manejadores --

  /**
   * Si una carta no ha sido marcada como "descartada",
   * entonces la seleccionamos.
   */
  const handleSelectCard = (card: GameCard) => {
    // No se pueden seleccionar cartas que
    // ya están marcadas para descartar
    if (isCardDiscarded(card)) return;

    if (!selectedCards[card.id]) {
      setSelectedCards({ ...selectedCards, [card.id]: card });
    } else {
      const updatedSelectedCards = { ...selectedCards };
      delete updatedSelectedCards[card.id];

      setSelectedCards(updatedSelectedCards);
    }
  };

  /**
   * Marcamos las cartas seleccionadas como "descartadas" localmente,
   * para posteriormente realizar la operación real.
   */
  const handleDiscardSelectedCards = () => {
    setDiscardedCards(selectedCards);
    setSelectedCards({});
  };

  /**
   * Descarta las cartas que localmente se marcaron como descartadas,
   * tomando igual cantidad de cartas del mazo regular y reordenándolas
   * en la mano del jugador.
   *
   * TODO: permitir tomar cartas del draft.
   */
  const handlePutCards = async () => {
    if (!httpService || !player || !match) return;

    const discardedCardsAmount = Object.keys(discardedCards).length;

    // Si no se han marcado cartas como descartadas,
    // cancelamos la operación.
    if (discardedCardsAmount === 0) return;

    // TODO: corregir esto con la lógica de tomar cartas
    const takenCardIds = cards
      .filter((card) => {
        return card.player_id === null && !card.is_discarded;
      })
      // Tenemos que tomar la misma cantidad que descartamos.
      .slice(0, discardedCardsAmount)
      .map((card) => card.id);

    const discardedCardIds = Object.keys(discardedCards);

    try {
      await httpService.putMatchCards(
        match.id,
        player.id,
        takenCardIds,
        discardedCardIds,
      );

      setHandCards((prevHandCards) => {
        // Calculamos que índices de la mano pertenecen
        // a cartas que serán descartadas.
        const discardedHandCardsIndexes = prevHandCards
          .map((card, index) => {
            if (card === null) return -1;

            return discardedCardIds.includes(card.id) ? index : -1;
          })
          .filter((index) => index !== -1);

        const newHandCards = [...prevHandCards];

        for (const index of discardedHandCardsIndexes) {
          // Dejamos vacío el espacio en la mano que pertenecía
          // a una carta que fue descartada.
          newHandCards[index] = null;
        }

        const takenCards = cards.filter((card) =>
          takenCardIds.includes(card.id),
        );

        let takenCardsIndex = 0;

        // Agregamos a los espacios vacíos de la mano, de izquierda a derecha,
        // las cartas que han sido tomadas.
        for (let i = 0; i < newHandCards.length; i++) {
          if (newHandCards[i] === null && takenCardsIndex < takenCards.length) {
            newHandCards[i] = takenCards[takenCardsIndex];
            takenCardsIndex++;
          }
        }

        // La mano ahora tiene las cartas originales y las nuevas
        // en los lugares de las que fueron descartadas.
        return newHandCards;
      });

      setDiscardedCards({});
    } catch (error) {
      console.error("Failed to put cards:", error);
    }
  };

  const handleFinishTurn = async () => {
    if (!httpService || !player || !match) return;

    // TODO: completar esto con la lógica de finalizar el turno
    await handlePutCards();
  };

  // Inicialmente, cargamos manualmente las cartas que pertenezcan al jugador
  // y no se hayan descartado. Luego, se actualizarán por WebSocket.
  useEffect(() => {
    // Evitamos generar la mano del jugador si todavía hay datos cargando
    // o si ya tiene cartas en su mano
    if (cards.length === 0 || player === null) return;

    if (initialLoadRef.current) {
      setHandCards(
        cards.filter(
          (card) => card.player_id === player?.id && !card.is_discarded,
        ),
      );

      initialLoadRef.current = false;
    }
  }, [cards, player]);

  return (
    <div
      data-testid="game-container"
      className="min-h-screen h-full p-4 relative flex flex-col justify-evenly bg-[url('/src/assets/background.png')] bg-cover bg-center"
    >
      {/* <div className="position absolute top-170 left-10"> */}
      <Table />

      {/* <div className="absolute bottom-75 left-185"> */}
      {/* <div className="absolute bottom-75 left-235"> */}

      <div className="flex flex-row gap-x-4 items-center justify-center">
        <DiscardPile topCard={lastDiscardedCard} />

        <DrawPile cardCount={drawableCards.length} />
      </div>

      <div className="flex flex-row items-center justify-between">
        <Secrets secrets={secrets} />

        <Hand
          cards={handCards}
          onSelect={handleSelectCard}
          isSelected={isCardSelected}
          isDiscarded={isCardDiscarded}
        />

        <HandActions
          onDiscard={handleDiscardSelectedCards}
          onFinish={handleFinishTurn}
        />
      </div>
    </div>
  );
}
