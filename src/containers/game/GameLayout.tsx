import { Outlet } from "react-router";

import BasicGameContextProvider from "@/contexts/BasicGameContext";
import LogicGameContextProvider from "@/contexts/LogicGameContext";

import TimerTurn from "./components/TimerTurn";

export default function GameLayout() {
  return (
    <BasicGameContextProvider>
      <LogicGameContextProvider>
        <main className="relative">
          <TimerTurn />
          <Outlet />
        </main>
      </LogicGameContextProvider>
    </BasicGameContextProvider>
  );
}
