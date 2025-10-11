import type { ReactNode } from "react";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";

import Player from "./Player";

interface TableProps {
  drawPile: ReactNode;
  discardPile: ReactNode;
}

export default function Table({ drawPile, discardPile }: TableProps) {
  const { players, match, secrets } = useGame();
  const { player } = usePlayer();

  const getVisiblePlayersWithGridPositions = () => {
    const visiblePlayers = players.filter((p) => p.id !== player?.id);

    const sortedPlayers = [...visiblePlayers].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );

    const totalPlayers = players.length;
    const playerTurn = match?.current_player_order;

    // Las posiciones de la grilla para diferentes cantidades de jugadores (posiciones 1-9)
    // La posición del medio (5) está reservada para las pilas del juego
    // Las posiciones 7-9 (fila inferior) están reservadas para el jugador actual
    // Distribución:
    //   1 (arriba-izquierda)    2 (arriba-centro)    3 (arriba-derecha)
    //   4 (medio-izquierda)     5 (PILAS)            6 (medio-derecha)
    //   7 (JUGADOR ACTUAL)      8 (JUGADOR ACTUAL)   9 (JUGADOR ACTUAL)
    const getGridPositionsForPlayerCount = (count: number): string[] => {
      switch (count) {
        case 2:
          // 1 jugador: posición 2 (arriba-centro)
          return ["col-start-2 row-start-1"];
        case 3:
          // 2 jugadores: posiciones 2, 6
          // (arriba-centro, medio-derecha)
          return ["col-start-2 row-start-1", "col-start-3 row-start-2"];
        case 4:
          // 3 jugadores: posiciones 1, 2, 6
          // (arriba-izquierda, arriba-centro, medio-derecha)
          return [
            "col-start-2 row-start-1",
            "col-start-1 row-start-2",
            "col-start-3 row-start-2",
          ];
        case 5:
          // 4 jugadores: posiciones 1, 2, 3, 6
          // (arriba-izquierda, arriba-centro, arriba-derecha, medio-derecha)
          return [
            "col-start-2 row-start-1",
            "col-start-3 row-start-1",
            "col-start-1 row-start-2",
            "col-start-3 row-start-2",
          ];
        case 6:
          // 5 jugadores: posiciones 1, 2, 3, 4, 6
          // (arriba-izquierda, arriba-centro, arriba-derecha, medio-izquierda, medio-derecha)
          return [
            "col-start-1 row-start-1",
            "col-start-2 row-start-1",
            "col-start-3 row-start-1",
            "col-start-1 row-start-2",
            "col-start-3 row-start-2",
          ];
        default:
          return [];
      }
    };

    const gridPositions = getGridPositionsForPlayerCount(totalPlayers);
    const result = [];

    for (let i = 0; i < sortedPlayers.length; i++) {
      const playerData = sortedPlayers[i];
      const turn = playerTurn === playerData.order;
      const gridPosition = gridPositions[i] || "";

      const playerSecrets =
        secrets?.filter((secret) => secret.player_id === playerData.id) || [];

      result.push({
        player: playerData,
        turn,
        gridPosition,
        secrets: playerSecrets,
      });
    }

    return result;
  };

  const visiblePlayers = getVisiblePlayersWithGridPositions();

  return (
    <>
      {/* Opponents in positions 1-4 and 6 */}
      {visiblePlayers.map(({ player: playerData, turn, gridPosition, secrets: playerSecrets }) => (
        <div
          key={playerData.id}
          className={`${gridPosition} flex items-center justify-center`}
        >
          <Player
            player={playerData}
            hasCurrentTurn={turn}
            secrets={playerSecrets}
          />
        </div>
      ))}

      {/* Position 5: Game Piles (center) */}
      <div className="col-start-2 row-start-2 flex justify-center items-center gap-x-3">
        {discardPile}
        {drawPile}
      </div>
    </>
  );
}