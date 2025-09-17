import CreatePlayerForm from './components/CreatePlayerForm';
import type { PlayerInput } from './components/CreatePlayerForm';
import { createHttpService } from '../../services/httpService';
// Agregar httpService 

const httpService = createHttpService();

const handleCreatePlayer = async (playerData: PlayerInput) => {
    try {
      const response = await httpService.createPlayer(playerData);

    }catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
};

const CreatePlayerContainer = () => {
  return (
    <CreatePlayerForm handleCreatePlayer={handleCreatePlayer} />
  );
};
export default CreatePlayerContainer;