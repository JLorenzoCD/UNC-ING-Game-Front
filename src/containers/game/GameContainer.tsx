import { useEffect, useState } from "react";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";

import Table from "./components/Table";
import Hand from "./components/Hand";
import Secrets from "./components/Secrets";
import DrawPile from "./components/DrawPile";
import DiscardPile from "./components/DiscardPile";
import DiscardModal from "./components/DiscardModal";

export default function GameContainer() {
  const { player } = usePlayer();
  const { secrets, cards } = useGame();

  const [selectedCards, setSelectedCards] = useState<Record<UUID, GameCard>>(
    {},
  );
  const [discartedCards] = useState<GameCard[]>([]);
  const [discardModal, setDiscardModal] = useState({
    isOpen: false,
    isEventDiscard: false,
  });

  useEffect(() => {
    // Para reutilizar el 'selectedCards', se vacía el mismo si se abre el modal
    // para ver las ultimas 5 cartas descartadas y se vacía al cerrar el modal.
    setSelectedCards({});
  }, [discardModal.isOpen]);

  const isCardSelected = (card: GameCard) => {
    return !!selectedCards[card.id];
  };

  const handleSelectCard = (card: GameCard) => {
    if (discardModal.isOpen && !discardModal.isEventDiscard) {
      // Si no hay evento no se puede seleccionar cartas en el modal que
      // muestra las ultimas 5 cartas descartadas.
      return;
    }
    // También se puede añadir lógica para ver cuantas cartas se pueden
    // seleccionar en el modal de cartas descartadas.

    if (!selectedCards[card.id]) {
      setSelectedCards({ ...selectedCards, [card.id]: card });
    } else {
      const updatedSelectedCards = { ...selectedCards };
      delete updatedSelectedCards[card.id];
      setSelectedCards(updatedSelectedCards);
    }
  };

  const playerSecrets = secrets.filter(
    (secret) => secret.player_id === player?.id,
  );

  const handleClickDiscardPile = () => {
    if (discartedCards.length === 0) return;

    setDiscardModal((prev) => ({ ...prev, isOpen: true }));
  };

  const onCloseDiscardModal = () => {
    if (discardModal.isOpen && discardModal.isEventDiscard) return;

    setDiscardModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleEventDicard = () => {
    //* Se realiza en otro ticket
    setDiscardModal({ isOpen: false, isEventDiscard: false });
  };

  const topCardDiscardPile = discartedCards.length ? discartedCards[0] : null;
  return (
    <div data-testid="game-container" className="h-screen p-4 flex flex-col">
      <DiscardModal
        isOpen={discardModal.isOpen}
        discartedCards={discartedCards}
        onClose={onCloseDiscardModal}
        onSelect={handleSelectCard}
        isSelected={isCardSelected}
        isEventDiscard={discardModal.isEventDiscard}
        onEndEvent={handleEventDicard}
      />

      <div className="position absolute top-170 left-10">
        <Table />

        <Secrets secrets={playerSecrets} />

        <div className="position absolute left-140 bottom-0">
          <Hand
            cards={cards.filter((card) => card.player_id === player?.id)}
            onSelect={handleSelectCard}
            isSelected={isCardSelected}
          />
        </div>

        <div className="absolute bottom-75 left-185 cursor-pointer">
          <DiscardPile
            topCard={topCardDiscardPile}
            onClick={handleClickDiscardPile}
          />
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
