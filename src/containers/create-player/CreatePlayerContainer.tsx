import CreatePlayerForm from './components/CreatePlayerForm';
import type { PlayerInput } from './components/CreatePlayerForm';
// Agregar httpService 

const handleCreatePlayer = async (playerData: PlayerInput) => {
    try {
      const response = await httpService.createPlayer(playerData);

      const newPlayer= await httpService.getPlayer(response.id);
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