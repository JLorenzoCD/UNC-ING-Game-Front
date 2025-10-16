import Secrets from "./Secrets";
import Sets from "./Sets";

import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";
import { twMerge } from "tailwind-merge";

const truncateName = (name: string, maxLength = 15) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

interface PlayerProps {
  onSelectTargetEvent: (target: GamePlayer | GameSecret) => void;

  player: GamePlayer;
  secrets: GameSecret[];
  sets: MatchSet[];
  hasCurrentTurn: boolean;

  isPlayerEvent: boolean;
  isTargetSecret: boolean;
  target: GamePlayer | GameSecret | null;
}

export default function Player({
  onSelectTargetEvent,

  player,
  secrets,
  sets,
  hasCurrentTurn,

  isPlayerEvent,
  isTargetSecret,
  target,
}: PlayerProps) {
  const selelectingTarget = target === null;
  const isTarget = player.id === target?.id;

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-2 items-center">
        <div
          onClick={() => onSelectTargetEvent(player)}
          className={twMerge(
            "w-20 h-20 rounded-full border-4",
            hasCurrentTurn
              ? "border-green-400 shadow-lg shadow-green-400/50 animate-pulse"
              : "border-transparent",
            isPlayerEvent &&
              selelectingTarget &&
              "border-red-400 border-10 shadow-lg shadow-red-400/50 animate-pulse",
            isPlayerEvent &&
              selelectingTarget &&
              isTarget &&
              "border-blue-400 border-10 shadow-lg shadow-blue-400/50 animate-none",
            isPlayerEvent &&
              !selelectingTarget &&
              !isTarget &&
              "border-4 border-transparent shadow-none animate-none brightness-50",
          )}
        >
          {player.avatar ? (
            <img
              src={player.avatar}
              alt={`Avatar de ${player.name}`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-400 flex items-center justify-center" />
          )}
        </div>

        <div
          title={player.name}
          className="px-3 py-1 rounded-full text-white font-semibold bg-black/80 shadow-lg border border-white/30 backdrop-blur-sm cursor-default"
        >
          {truncateName(player.name, 10)}
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <Secrets
          secrets={secrets}
          onSelectTargetEvent={onSelectTargetEvent}
          isTargetSecret={isTargetSecret}
          target={target}
        />
        <Sets sets={sets} />
      </div>
    </div>
  );
}
