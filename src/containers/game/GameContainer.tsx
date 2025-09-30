import DiscardPile from "./components/DiscardPile";
import DrawPile from "./components/DrawPile";
import Hand from "./components/Hand";
import Secrets from "./components/Secrets";
import Table from "./components/Table";
import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import type { GameCard } from "@/types/card";
import type { Player } from "@/types/player";
import { useState } from "react";

function cardsPlayer(gameCards: GameCard[], player: Player) {
  return gameCards.filter((card) => card.player_id === player.id);
}

export default function Game() {
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const { secrets, cards } = useGame();
  const { player } = usePlayer();
  let handPlayer: GameCard[] = [];
  if (player) {
    handPlayer = cardsPlayer(cards, player);
  }

  function handleCardSelect(card: GameCard) {
    setSelectedCard(card);
  }

  return (
    <div className="position absolute top-170 left-10">
      <Table />
      <Secrets secrets={secrets} />
      <div className="position absolute left-140 bottom-0">
        <Hand
          cards={handPlayer}
          onSelect={handleCardSelect}
          isSelected={(card) =>
            selectedCard ? card.id === selectedCard.id : false
          }
        />
      </div>
      <div className="absolute bottom-75 left-185">
        <DiscardPile topCard={null} />
      </div>
      <div className="absolute bottom-75 left-235">
        <DrawPile cardCount={43} />
      </div>
    </div>
  );
}
