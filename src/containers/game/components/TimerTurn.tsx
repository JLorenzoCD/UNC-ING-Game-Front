import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";

import { twJoin } from "tailwind-merge";

import type { GamePlayer } from "@/types/player";

export function getTimerColor(timer: number, isCurrPlayerTurn: boolean) {
  const defaultColor = "bg-[#535353] border-[#313030]";

  if (!isCurrPlayerTurn) return defaultColor;

  switch (true) {
    case timer > 20:
      return "bg-[#359b21] border-[#277c16]";
    case timer > 15:
      return "bg-[#e2c62a] border-[#978215]";
    case timer > 10:
      return "bg-[#c08630] border-[#885b17]";
    default:
      return "bg-[#810a0c] border-[#64090a]";
  }
}

export default function TimerTurn() {
  const { match, players } = useGame();
  const { player } = usePlayer();

  const [timer, setTimer] = useState(60);

  const currPlayerMatch = useMemo(() => {
    return players.find((p) => p.id === player?.id) as GamePlayer;
  }, [players, player]);

  useEffect(() => {
    if (timer === 0 && match?.status !== "COMPLETED") {
      return;
    }

    const intervalId = setInterval(() => {
      setTimer((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timer, match]);

  useEffect(() => {
    setTimer(60);
  }, [match]);

  if (match === null || player === null) return;

  const isCurrPlayerTurn = match.current_player_order === currPlayerMatch.order;

  return (
    <header
      className={twJoin(
        "absolute top-0 left-1/2 z-10 px-6 py-1 text-white text-2xl font-bold transform -translate-x-1/2 rounded-b-2xl border-5 text-center select-none transition-colors duration-1000 ease-in-out",
        getTimerColor(timer, isCurrPlayerTurn),
      )}
    >
      {timer.toString().padStart(2, "0")}
    </header>
  );
}
