import { Outlet } from "react-router";

import BasicGameContextProvider from "@/contexts/BasicGameContext";

import TimerTurn from "./components/TimerTurn";

export default function GameLayout() {
  return (
    <BasicGameContextProvider>
      <main className="relative">
        <TimerTurn />
        <Outlet />
      </main>
    </BasicGameContextProvider>
  );
}
