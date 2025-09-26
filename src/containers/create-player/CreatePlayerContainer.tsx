import CreatePlayerForm from './components/CreatePlayerForm';
import type { PlayerInput } from './../../types/player';
import { usePlayer } from '../../contexts/PlayerContext';
import type { Player } from '../../types/player';
import { useNavigate } from 'react-router';
import { useHttpService } from '../../contexts/HttpServiceContext';

export default function CreatePlayerContainer() {
  const { setPlayer } = usePlayer();
  const { httpService } = useHttpService();
  const navigate = useNavigate();

  const handleCreatePlayer = async (playerData: PlayerInput) => {
    if (!httpService) {
      throw new Error("HTTP Service is not available");
    }
    try {
      const newPlayer: Player = await httpService.createPlayer(playerData);

      setPlayer(newPlayer);

      navigate('/match');

    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  };

  return (
    <CreatePlayerForm handleCreatePlayer={handleCreatePlayer} />
  );
};