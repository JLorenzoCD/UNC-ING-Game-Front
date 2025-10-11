import { useEffect, useState } from "react";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";

import DiscardModal from "./components/DiscardModal";
import Table from "./components/Table";
import DiscardPile from "./components/DiscardPile";
import DrawPile from "./components/DrawPile";
import Sets from "./components/Sets";
import Secrets from "./components/Secrets";
import Hand from "./components/Hand";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";
import type { Player } from "@/types/player";

export default function GameContainer() {
  const { player } = usePlayer();
  const { secrets, cards, sets } = useGame();

  const playerSets = sets.filter((set) => set.player_id === player?.id);

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
    <div
      data-testid="game-container"
      className="w-full h-full grid grid-cols-5 grid-rows-3 px-10"
    >
      <DiscardModal
        isOpen={discardModal.isOpen}
        discartedCards={discartedCards}
        onClose={onCloseDiscardModal}
        onSelect={handleSelectCard}
        isSelected={isCardSelected}
        isEventDiscard={discardModal.isEventDiscard}
        onEndEvent={handleEventDicard}
      />

      <Table player={player as Player} />

      <div className="col-start-3 row-start-2 flex justify-center items-center gap-5">
        <DiscardPile
          topCard={topCardDiscardPile}
          onClick={handleClickDiscardPile}
        />
        <DrawPile cardCount={cards.filter((card) => !card.player_id).length} />
      </div>

      <div className="col-start-1 row-start-3 flex flex-col justify-center items-center">
        <Sets sets={playerSets} />
        <Secrets secrets={playerSecrets} />
      </div>

      <div className="col-start-2 row-start-3 col-span-3 flex justify-center items-center">
        <Hand
          cards={cards.filter((card) => card.player_id === player?.id)}
          onSelect={handleSelectCard}
          isSelected={isCardSelected}
        />
      </div>
    </div>
  );
}
