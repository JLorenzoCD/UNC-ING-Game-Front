import type { GamePlayer } from "@/types/player";

const truncateName = (name: string, maxLength = 15) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

interface PlayerProps {
  player: GamePlayer;
  hasCurrentTurn: boolean;
}

export default function Player({ player, hasCurrentTurn }: PlayerProps) {
  return (
    <div className="flex flex-col items-center gap-2">
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
  );
}
