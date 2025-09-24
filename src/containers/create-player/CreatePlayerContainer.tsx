import CreatePlayerForm from './components/CreatePlayerForm';
import type { PlayerInput } from './components/CreatePlayerForm';
import { createHttpService } from '../../services/httpService';
import { usePlayer } from '../../contexts/PlayerContext';
import type { Player } from '../../types/player';
import { useNavigate } from 'react-router';

const httpService = createHttpService();

const CreatePlayerContainer = () => {
  const { setPlayer } = usePlayer();
  const navigate = useNavigate();

  const handleCreatePlayer = async (playerData: PlayerInput) => {
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
export default CreatePlayerContainer;