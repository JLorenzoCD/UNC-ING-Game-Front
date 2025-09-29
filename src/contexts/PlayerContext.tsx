import {
  createContext,
  type Dispatch,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { Player } from "../types/player";

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
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const storedPlayer = localStorage.getItem("player");
    if (storedPlayer) {
      setPlayer(JSON.parse(storedPlayer));
    }
  }, []);

  useEffect(() => {
    if (player) {
      localStorage.setItem("player", JSON.stringify(player));
    }
  }, [player]);

  return (
    <PlayerContext.Provider value={{ player, setPlayer }}>
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
