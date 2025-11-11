import { Outlet } from "react-router";

import GameContextProvider from "@/contexts/GameContext";

import TimerTurn from "./components/TimerTurn";

export default function GameLayout() {
  return (
    <GameContextProvider>
      <main className="relative">
        <TimerTurn />
        <Outlet />
      </main>
    </GameContextProvider>
  );
}
