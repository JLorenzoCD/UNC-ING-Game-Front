import { Outlet } from "react-router";

import GameContextProvider from "@/contexts/GameContext";

import logoGame from "@/assets/logo.png";

export default function GameLayout() {
  return (
    <GameContextProvider>
      <div className="h-20 bg-gradient-to-b from-red-800 to-red-900 shadow-lg z-30">
        <img
          src={logoGame}
          alt="AGATHA CHRISTIE'S - DEATH ON THE CARDS"
          className="h-full mx-auto object-contain"
        />
      </div>

      <Outlet />
    </GameContextProvider>
  );
}
