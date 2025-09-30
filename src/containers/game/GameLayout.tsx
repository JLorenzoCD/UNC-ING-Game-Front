import { Outlet } from "react-router";

import GameContextProvider from "@/contexts/GameContext";

import logoGame from "@/assets/logo.png";
import backgroundGame from "@/assets/background.png";

export default function GameLayout() {
  return (
    <GameContextProvider>
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-red-800 to-red-900 shadow-lg z-30">
        <img
          src={logoGame}
          alt="AGATHA CHRISTIE'S - DEATH ON THE CARDS"
          className="h-15 mx-auto my-2"
        />
      </div>

      <img
        src={backgroundGame}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <Outlet />
    </GameContextProvider>
  );
}
