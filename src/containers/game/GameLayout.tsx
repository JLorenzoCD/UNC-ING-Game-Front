import { Outlet } from "react-router";

import GameContextProvider from "@/contexts/GameContext";

import logoGame from "@/assets/logo.png";
import backgroundGame from "@/assets/background.png";

export default function GameLayout() {
  return (
    <GameContextProvider>
      <div className="flex flex-col relative h-screen">
        <div className="h-20 bg-gradient-to-b from-red-800 to-red-900 shadow-lg z-30">
          <img
            src={logoGame}
            alt="AGATHA CHRISTIE'S - DEATH ON THE CARDS"
            className="h-15 mx-auto my-2"
          />
        </div>
        <div
          data-testid="background-table"
          className="w-full h-full bg-cover"
          style={{ backgroundImage: `url(${backgroundGame})` }}
        >
          <Outlet />
        </div>
      </div>
    </GameContextProvider>
  );
}
