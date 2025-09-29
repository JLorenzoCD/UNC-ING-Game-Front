import { Outlet } from "react-router";

import GameContextProvider from "@/contexts/GameContext";

export default function GameLayout() {
  return (
    <GameContextProvider>
      <Outlet />
    </GameContextProvider>
  )
}