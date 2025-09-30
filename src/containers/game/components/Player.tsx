import type { GamePlayer } from "@/types/player";

const truncateName = (name: string, maxLength = 15) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

interface PlayerProps {
  player: GamePlayer;
  position: { x: number; y: number };
  hasCurrentTurn: boolean;
};

export default function Player({
  player,
  position,
  hasCurrentTurn,
}: PlayerProps) {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className={`relative w-20 h-20 rounded-full border-4 ${
          hasCurrentTurn
            ? "border-green-400 shadow-lg shadow-green-400/50 animate-pulse"
            : ""
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

        <div className="mt-2 flex justify-center">
          <div 
            title={player.name}
            className="px-3 py-1 rounded-full text-white font-semibold bg-black/80 shadow-lg border border-white/30 backdrop-blur-sm cursor-default"
          >
            {truncateName(player.name, 10)}
          </div>
        </div>
      </div>
    </div>
  );
}
