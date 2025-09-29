import { useState } from "react"

import type { UUID } from "@/types/common"
import type { GameCard } from "@/types/card"

import { useGame } from "@/contexts/GameContext"

export default function GameContainer() {
  const { match } = useGame();

  const [selectedCards, setSelectedCards] = useState<Record<UUID, GameCard>>({})

  const isCardSelected = (card: GameCard) => {
    return !!selectedCards[card.id]
  }

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
      {match && <p>match: {JSON.stringify(match)}</p>}
      {/* Componentes de mano, tablero, etc. */}

      <div className="mt-auto self-center">
        {/* Componente de mano del jugador */}
      </div>
    </div>
  );
}
