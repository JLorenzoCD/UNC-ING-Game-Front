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
  hasCurrentTurn: boolean;
  secrets: GameSecret[];
  sets: MatchSet[];
}

export default function Player({
  player,
  hasCurrentTurn,
  secrets,
  sets,
}: PlayerProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-2 items-center">
        <div
          className={`w-20 h-20 rounded-full border-4 ${
            hasCurrentTurn
              ? "border-green-400 shadow-lg shadow-green-400/50 animate-pulse"
              : "border-transparent"
          }`}
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
        <Secrets secrets={secrets} />
        <Sets sets={sets} />
      </div>
    </div>
  );
}
