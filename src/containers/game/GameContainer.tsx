import { useState } from "react";

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

//! Luego eliminar
const MOCK_MATCH_ID = crypto.randomUUID();

const mockCards: GameCard[] = [
  {
    id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    player_id: null,
    card_id: crypto.randomUUID(),
    name: "HERCULE POIROT",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: true,
    discarded_at: new Date(),
  },
  {
    id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    player_id: null,
    card_id: crypto.randomUUID(),
    name: "MISS MARPLE",
    description: "Some description",
    type: "DETECTIVE",
    is_discarded: true,
    discarded_at: new Date(),
  },
];
//! Fin eliminar

export default function GameContainer() {
  const { player } = usePlayer();
  const { secrets, cards } = useGame();

  const [selectedCards, setSelectedCards] = useState<Record<UUID, GameCard>>(
    {},
  );
  const [discartedCards] = useState<GameCard[]>(mockCards);
  const [openModal, setOpenModal] = useState(false);

  const isCardSelected = (card: GameCard) => {
    return !!selectedCards[card.id];
  };

  const handleSelectCard = (card: GameCard) => {
    if (!selectedCards[card.id]) {
      setSelectedCards({ ...selectedCards, [card.id]: card });
    } else {
      const updatedSelectedCards = { ...selectedCards };
      delete updatedSelectedCards[card.id];
      setSelectedCards(updatedSelectedCards);
    }
  };

  const handleClickDiscardPile = () => {
    if (discartedCards.length === 0) return;

    setOpenModal(true);
  };

  const onCloseDiscardModal = () => {
    setOpenModal(false);
  };

  return (
    <div data-testid="game-container" className="h-screen p-4 flex flex-col">
      <DiscardModal
        isOpen={openModal}
        discartedCards={discartedCards}
        onClose={onCloseDiscardModal}
        onSelect={handleSelectCard}
        isSelected={isCardSelected}
      />
      <div className="position absolute top-170 left-10">
        <Table />

        <Secrets secrets={secrets} />

        <div className="position absolute left-140 bottom-0">
          <Hand
            cards={cards.filter((card) => card.player_id === player?.id)}
            onSelect={handleSelectCard}
            isSelected={isCardSelected}
          />
        </div>

        <div className="absolute bottom-75 left-185 cursor-pointer">
          <DiscardPile
            topCard={discartedCards[0]}
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
