import { useState } from "react";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import Table from "./components/Table";
import Hand from "./components/Hand";
import Secrets from "./components/Secrets";
import DrawPile from "./components/DrawPile";
import DiscardPile from "./components/DiscardPile";
import HandActions from "./components/HandActions";

export default function GameContainer() {
  const { player } = usePlayer();
  const { httpService } = useHttpService();
  const { match, secrets, cards } = useGame();

  const [selectedCards, setSelectedCards] = useState<Record<UUID, GameCard>>(
    {},
  );

  const [discardedCards, setDiscardedCards] = useState<Record<UUID, GameCard>>(
    {},
  );

  const isCardSelected = (card: GameCard) => {
    return !!selectedCards[card.id];
  };

  const isCardDiscarded = (card: GameCard) => {
    return !!discardedCards[card.id];
  };

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

  const handleDiscardSelectedCards = () => {
    setDiscardedCards(selectedCards);
    setSelectedCards({});
  };

  const handlePutCards = async () => {
    if (!httpService || !player || !match) return;

    if (Object.keys(discardedCards).length === 0) return;

    // TODO: corregir esto con la lógica de tomar cartas
    const cardIdsToTake = cards
      .filter((card) => {
        return card.player_id === null && !card.is_discarded;
      })
      .slice(0, Object.keys(discardedCards).length)
      .map((card) => card.id);

    const cardIdsToDiscard = Object.keys(discardedCards);

    try {
      await httpService.putMatchCards(
        match.id,
        player.id,
        cardIdsToTake,
        cardIdsToDiscard,
      );

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

  return (
    <div data-testid="game-container" className="h-screen p-4 flex flex-col">
      <div className="position absolute top-170 left-10">
        <Table />

        <Secrets secrets={secrets} />

        <div className="position absolute left-140 bottom-0 flex items-center">
          <Hand
            cards={cards.filter((card) => card.player_id === player?.id)}
            onSelect={handleSelectCard}
            isSelected={isCardSelected}
            isDiscarded={isCardDiscarded}
          />

          <HandActions
            onDiscard={handleDiscardSelectedCards}
            onFinish={handleFinishTurn}
          />
        </div>

        <div className="absolute bottom-75 left-185">
          <DiscardPile topCard={null} />
        </div>

        <div className="absolute bottom-75 left-235">
          <DrawPile
            cardCount={cards.filter((card) => !card.player_id).length}
          />
        </div>
      </div>
    </div>
  );
}
