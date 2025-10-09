import { useState, useEffect } from "react";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";

import Player from "./Player";

export default function Table() {
  const { players, match, secrets } = useGame();
  const { player } = usePlayer();

  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getVisiblePlayersWithPositions = () => {
    const sortedPlayers = [...players].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const currentPlayerIndex = sortedPlayers.findIndex(
      (p) => p.id === player?.id,
    );
    const totalPlayers = players.length;

    const marginX = 150;
    const marginY = -500;

    const centerX = dimensions.width / 2 - 45;
    const centerY = dimensions.height / 2;

    const getPositionForPlayer = (orderIndex: number, totalCount: number) => {
      if (totalCount === 2) {
        return { x: centerX, y: marginY };
      }

      if (totalCount === 3) {
        const positions = [
          { x: marginX, y: centerY - 650 },
          { x: dimensions.width - marginX, y: centerY - 650 },
        ];
        return positions[orderIndex] || positions[0];
      }

      if (totalCount === 4) {
        const positions = [
          { x: marginX, y: centerY - 650 },
          { x: centerX, y: marginY },
          { x: dimensions.width - marginX, y: centerY - 650 },
        ];
        return positions[orderIndex] || positions[0];
      }

      if (totalCount === 5) {
        const positions = [
          { x: marginX, y: centerY - 650 },
          { x: centerX - 300, y: marginY },
          { x: centerX + 300, y: marginY },
          { x: dimensions.width - marginX, y: centerY - 650 },
        ];
        return positions[orderIndex] || positions[0];
      }

      if (totalCount === 6) {
        const positions = [
          { x: marginX, y: centerY - 650 },
          { x: centerX - 400, y: marginY },
          { x: centerX, y: marginY },
          { x: centerX + 400, y: marginY },
          { x: dimensions.width - marginX, y: centerY - 650 },
        ];
        return positions[orderIndex] || positions[0];
      }
      return { x: centerX, y: marginY };
    };

    let visibleIndex = 0;

    const result = [];
    const playerTurn = match?.current_player_order;

    for (let i = 1; i < totalPlayers; i++) {
      const globalIndex = (currentPlayerIndex + i) % totalPlayers;
      const currentPlayer = sortedPlayers[globalIndex];
      const turn = playerTurn === currentPlayer.order ? true : false;

      const playerSecrets =
        secrets?.filter((secret) => secret.player_id === currentPlayer.id) ||
        [];

      const position = getPositionForPlayer(visibleIndex, totalPlayers);
      result.push({
        player: currentPlayer,
        position,
        turn,
        secrets: playerSecrets,
      });
      visibleIndex++;
    }

    return result;
  };

  const visiblePlayersWithPositions = getVisiblePlayersWithPositions();

  return (
    <div data-testid="table">
      {visiblePlayersWithPositions.map(
        ({ player, position, turn, secrets }) => (
          <Player
            key={player.id}
            player={player}
            position={position}
            hasCurrentTurn={turn}
            secrets={secrets}
          />
        ),
      )}
    </div>
  );
}
