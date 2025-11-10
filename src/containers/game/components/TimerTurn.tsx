import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";

import { twJoin } from "tailwind-merge";

import type { GamePlayer } from "@/types/player";
import type { Match } from "@/types/match";
import type { MatchLog } from "@/types/log";
import { GAME_RULES } from "@/constants/game";

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

export function isTimerExecuted(match: Match, logs: MatchLog[]) {
  const logsCopy = [...logs];
  logsCopy.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (logsCopy.length === 0) return false;

  const lastLog = logsCopy[0];

  if (lastLog.event_type !== "Turn") return false;

  const turnTime = new Date(match.timer_turn as Date);
  turnTime.setSeconds(turnTime.getSeconds() + GAME_RULES.TIME_TURN);

  if (turnTime.getTime() > Date.now()) return true;

  return false;
}

export default function TimerTurn() {
  const { match, players, logs, hasFinishedAction } = useGame();
  const { player } = usePlayer();

  const [timer, setTimer] = useState<number>(-1);
  const [shouldTimerBeRun, setShouldTimerBeRun] = useState<boolean>(false);

  const currPlayerMatch = useMemo(() => {
    return players.find((p) => p.id === player?.id) as GamePlayer;
  }, [players, player]);

  useEffect(() => {
    if (
      match === null ||
      match.timer_turn === null ||
      match.status.toUpperCase() !== "IN_PROGRESS" ||
      logs.length === 0 ||
      !isTimerExecuted(match, logs)
    ) {
      setShouldTimerBeRun(false);
      return;
    }
    setShouldTimerBeRun(true);

    const turn_time = new Date(match.timer_turn);
    const logStartTime = turn_time.getTime();

    // Calcular el momento final: logStartTime + 60 segundos (en ms)
    const endTime = logStartTime + GAME_RULES.TIME_TURN * 1000;

    const timerInterval = setInterval(() => {
      const now = Date.now();
      const timeRemainingMs = endTime - now;

      if (timeRemainingMs <= 0) {
        setTimer(0);
        clearInterval(timerInterval); // Detenemos el temporizador

        // TIMEOUT
        console.log("timeout");
      } else {
        // Calcular los segundos restantes y actualizar el estado
        const seconds = Math.ceil(timeRemainingMs / 1000);
        setTimer(seconds);
      }
    }, 1000); // Actualizar cada 1 segundo

    return () => clearInterval(timerInterval);
  }, [match, logs]);

  // Si cambia el match, es porque se cambio de turno o el status paso a "COMPLETE"
  // Si cambio el hasFinishedAction, entonces ya se ejecuto una acción.
  useEffect(() => {
    setTimer(-1);
  }, [hasFinishedAction, match]);

  if (
    match === null ||
    player === null ||
    match.timer_turn === null ||
    match.timer_turn === undefined ||
    !shouldTimerBeRun ||
    timer === -1
  )
    return null;

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
