import {
  createContext,
  type Dispatch,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type SetStateAction,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router";
import { useHttpService } from "./HttpServiceContext";

import { FRONTEND_PATHS } from "@/constants/frontend";

import type { Player } from "@/types/player";
import { isUUID } from "@/utils";

interface PlayerContextType {
  player: Player | null;
  setPlayer: Dispatch<SetStateAction<Player | null>>;
}

const PlayerContext = createContext<PlayerContextType>({
  player: null,
  setPlayer: () => {},
});

interface PlayerProviderProps {
  children: ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const { httpService } = useHttpService();
  const location = useLocation();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (httpService === null) return;

    const initFunc = async () => {
      try {
        const storedPlayer = localStorage.getItem("player");
        if (!storedPlayer)
          throw new Error(
            "La entidad player almacenada en el localStorage es invalida",
          );

        const player = JSON.parse(storedPlayer) as Player;
        if (!player.id && isUUID(player.id))
          throw new Error(
            "La entidad Player almacenada en el localStorage es invalida",
          );

        const validatePlayer = await httpService?.validatePlayer(player.id);
        setPlayer(validatePlayer);
      } catch (error) {
        console.error(
          "Error al cargar datos del jugador desde localStorage:",
          error,
        );
        // Limpiamos datos corruptos
        localStorage.removeItem("player");
      } finally {
        setIsLoading(false);
      }
    };

    initFunc();
  }, [httpService]);

  useEffect(() => {
    if (player) {
      try {
        localStorage.setItem("player", JSON.stringify(player));
      } catch (error) {
        console.error(
          "Error al guardar datos del jugador en localStorage:",
          error,
        );
      }
    }
  }, [player]);

  useEffect(() => {
    if (isLoading) return;

    // Si el usuario no ha creado su perfil y quiere
    // acceder a una ruta protegida, se le redirige a crear perfil.
    if (
      (location.pathname === "/" || location.pathname.includes("match")) &&
      !player
    ) {
      navigate(FRONTEND_PATHS.PLAYER_CREATE);

      // Si el usuario ya tiene perfil y quiere acceder a crear perfil,
      // se le redirige a la lista de partidas.
    } else if (location.pathname.includes("player") && player) {
      navigate(FRONTEND_PATHS.MATCH_LIST);
    }
  }, [player, isLoading, location, navigate]);

  const contextValue: PlayerContextType = useMemo(
    () => ({ player, setPlayer }),
    [player, setPlayer],
  );

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
