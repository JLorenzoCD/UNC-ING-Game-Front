import { useNavigate } from "react-router";

import type { Player, PlayerInput } from "@/types/player";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";
import { FRONTEND_PATHS } from "@/constants/frontend";

import CreatePlayerForm from "./components/CreatePlayerForm";

export default function CreatePlayerContainer() {
  const navigate = useNavigate();

  const { setPlayer } = usePlayer();
  const { httpService } = useHttpService();

  const handleCreatePlayer = async (playerData: PlayerInput) => {
    try {
      if (!httpService) {
        throw new Error("HTTP Service is not available.");
      }

      const newPlayer: Player = await httpService.createPlayer(playerData);

      setPlayer(newPlayer);

      navigate(FRONTEND_PATHS.MATCH_LIST);
    } catch (error) {
      console.error("Error creating player:", error);

      alert("Could not create player, try again.");
    }
  };

  return <CreatePlayerForm handleCreatePlayer={handleCreatePlayer} />;
}
