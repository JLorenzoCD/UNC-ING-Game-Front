import { useState } from "react";

import type { UUID } from "@/types/common";
import type { MatchCard } from "@/types/card";

export default function GameContainer() {
  const [selectedCards, setSelectedCards] = useState<Record<UUID, MatchCard>>(
    {},
  );

  const isCardSelected = (card: MatchCard) => {
    return !!selectedCards[card.id];
  };

  const handleSelectCard = (card: MatchCard) => {
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
      {/* Componentes de mano, tablero, etc. */}

      <div className="mt-auto self-center">
        {/* Componente de mano del jugador */}
      </div>
    </div>
  );
}
