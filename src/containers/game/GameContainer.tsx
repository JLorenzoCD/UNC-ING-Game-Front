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
import Modal from "@/components/Modal";
import Button from "@/components/Button";

//! Luego eliminar
const MOCK_CARD_ID_1 = crypto.randomUUID();
const MOCK_CARD_ID_2 = crypto.randomUUID();
const MOCK_MATCH_ID = crypto.randomUUID();

const mockCards: GameCard[] = [
  {
    id: MOCK_CARD_ID_1,
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
    id: MOCK_CARD_ID_2,
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
  const [openModal, setOpenModal] = useState(true);

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

  return (
    <div data-testid="game-container" className="h-screen p-4 flex flex-col">
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        header={<h3>Cartas descartadas</h3>}
        footer={
          <>
            <Button type="button">I accept</Button>
            <Button type="button" onClick={() => setOpenModal(false)}>
              Decline
            </Button>
          </>
        }
      >
        Modal
      </Modal>
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

        <div className="absolute bottom-75 left-185">
          <DiscardPile topCard={discartedCards[0]} />
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
