import Secrets from "./Secrets";
import Sets from "./Sets";

import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";

const truncateName = (name: string, maxLength = 15) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

interface PlayerProps {
  player: GamePlayer;
  positionClassName: string;
  hasCurrentTurn: boolean;
  secrets: GameSecret[];
  sets: MatchSet[];
}

export default function Player({
  player,
  positionClassName,
  hasCurrentTurn,
  secrets,
  sets,
}: PlayerProps) {
  const currentTurnClass = hasCurrentTurn
    ? "border-green-400 shadow-lg shadow-green-400/50 animate-pulse"
    : "";

  return (
    <div className={`flex-col ${positionClassName}`}>
      <div className="flex justify-center items-center">
        {player.avatar ? (
          <img
            src={player.avatar}
            alt={`Avatar de ${player.name}`}
            className={`w-15 h-15 rounded-full border-4 object-cover ${currentTurnClass}`}
          />
        ) : (
          <div className="w-15 h-15 rounded-full border-4 bg-gray-400 flex items-center justify-center" />
        )}

        <div className="flex justify-center ml-2">
          <div
            title={player.name}
            className="px-2 py-1 rounded-full text-white font-semibold bg-black/80 shadow-lg border border-white/30 backdrop-blur-sm cursor-default"
          >
            {truncateName(player.name, 10)}
          </div>
        </div>
      </div>
      <div className="ml-7 mt-2 flex flex-col gap-1 items-center">
        {secrets.length && <Secrets secrets={secrets} />}
        {sets.length && <Sets sets={sets} />}
      </div>
    </div>
  );
}
