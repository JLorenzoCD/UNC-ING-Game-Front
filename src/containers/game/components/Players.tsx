import type { GamePlayer } from "@/types/player"


type PlayersProps = {
  player: GamePlayer;
  position: { x: number; y: number };
}

const truncateName = (name : String, maxLength = 15) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

export default function Players({ player, position }: PlayersProps) {

  return (
    <div
      key={player.id}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={{
      left: `${position.x}px`,
      top: `${position.y}px`,
      }}
    >
      <div className="relative w-20 h-20 rounded-full border-4">
        {player.avatar ? (
          <img
          src={player.avatar}
          alt={`Avatar de ${player.name}`}
          className="w-full h-full rounded-full object-cover"
          />
        ) : (
        <div className="w-full h-full rounded-full bg-gray-400 flex items-center justify-center">
        </div>
        )}
        <div className="mt-2 flex justify-center">
          <div 
            className="px-3 py-1 rounded-full text-white font-semibold bg-black/80 shadow-lg border border-white/30 backdrop-blur-sm cursor-default"
            title={player.name} 
          >
            {truncateName(player.name, 10)}
          </div>
        </div>
      </div>
    </div>
  );
}