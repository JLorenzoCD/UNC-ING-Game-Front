import { useState, useEffect } from 'react';
import Players from './Players';
import { usePlayer } from '@/contexts/PlayerContext';
import { useGame } from '@/contexts/GameContext';

export default function Table() {
  const { players }  = useGame();
  const { player } = usePlayer();

  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

   const getVisiblePlayersWithPositions = () => {
    // Ordenar jugadores por orden de juego para posicionamiento correcto
    const sortedPlayers = [...players].sort((a, b) => (a.order ?? 0) + (b.order ?? 0));
    const currentPlayerIndex = sortedPlayers.findIndex(p => p.id === player?.id);
    const totalPlayers = players.length;
    
    const marginX = +150;
    const marginY = -500;
    
    const centerX = (dimensions.width / 2) - 45;
    const centerY = dimensions.height / 2;
    
    const getPositionForPlayer = (orderIndex: number, totalCount: number) => {
      
      if (totalCount === 2) {
        return { x: centerX, y: marginY };
      }
      
      if (totalCount === 3) {
        const positions = [
          { x: marginX, y: centerY - 650},
          { x: dimensions.width - marginX, y: centerY - 650} 
        ];
        return positions[orderIndex] || positions[0];
      }
      
      if (totalCount === 4) {
        const positions = [
          { x: marginX, y: centerY - 650}, 
          { x: centerX, y: marginY }, 
          { x: dimensions.width - marginX, y: centerY - 650}, 
        ];
        return positions[orderIndex] || positions[0];
      }
      
      if (totalCount === 5) {
        const positions = [
          { x: marginX, y: centerY - 650}, 
          { x: centerX - 300, y: marginY },
          { x: centerX + 300, y: marginY }, 
          { x: dimensions.width - marginX, y: centerY - 650},
        ];
        return positions[orderIndex] || positions[0];
      }
      
      if (totalCount === 6) {
        const positions = [
          { x: marginX, y: centerY - 650},
          { x: centerX - 400, y: marginY },
          { x: centerX, y: marginY }, 
          { x: centerX + 400, y: marginY },
          { x: dimensions.width - marginX, y: centerY - 650}
        ];
        return positions[orderIndex] || positions[0];
      }
      return { x: centerX, y: marginY };
    }
    const result = [];
    let visibleIndex = 0;
    
    for (let i = 1; i < totalPlayers; i++) {
      const globalIndex = (currentPlayerIndex + i) % totalPlayers;
      const player = sortedPlayers[globalIndex];
      
      const position = getPositionForPlayer(visibleIndex, totalPlayers);
      result.push({ player, position });
      visibleIndex++;
    }
    
    return result;
  };

  const visiblePlayersWithPositions = getVisiblePlayersWithPositions();
  return (
    <div>
      {visiblePlayersWithPositions.map(({ player, position }) => (
        <Players player={player} key={player.id} position={position} />
      ))}
    </div>
  );
};