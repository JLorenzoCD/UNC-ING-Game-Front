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

import type { Player } from "@/types/player";
import { FRONTEND_PATHS } from "@/constants/frontend";

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
  const location = useLocation();
  const navigate = useNavigate();

  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedPlayer = localStorage.getItem("player");
    
    if (storedPlayer) {
      setPlayer(JSON.parse(storedPlayer));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (player) {
      localStorage.setItem("player", JSON.stringify(player));
    }
  }, [player]);

  useEffect(() => {
    if (isLoading) return;

    // Si el usuario no ha creado su perfil y quiere
    // acceder a una ruta protegida, se le redirige a crear perfil.
    if (
      (location.pathname === "/" || location.pathname.includes("match"))
      && !player
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
    [player, isLoading, setPlayer]
  );

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }

  return context;
}
