import type { Player } from "@/types/player";

interface PlayerCardProps {
  player: Player;
  isOwner?: boolean;
  isMe?: boolean;
}

export function EmptyPlayerPosition() {
  return (
    <div className="w-40 h-40 border-2 border-gray-200 border-dashed flex items-center justify-center select-none">
      <div className="text-center text-gray-200 italic p-4">
        Space for another player
      </div>
    </div>
  );
}

export default function PlayerCard({
  player,
  isOwner = false,
  isMe = false,
}: PlayerCardProps) {
  const borderColor = isOwner ? "border-[#feebbd]" : "border-[#810a0c]";

  return (
    <article
      className={`border-2 ${borderColor} rounded-lg w-40 h-40 p-4 flex flex-col items-center gap-2 relative text-white bg-black bg-opacity-40 backdrop-blur-sm`}
    >
      {isOwner && (
        <span className="absolute top-[-10px] left-[-10px] bg-[#feebbd] text-black text-sm px-3 py-1 rounded-full select-none">
          Owner
        </span>
      )}
      {isMe && (
        <span className="absolute bottom-[-10px] right-[-10px] bg-white text-black text-sm px-3 py-1 rounded-full select-none">
          Me
        </span>
      )}

      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-500">
        <img
          src={player.avatar}
          alt={player.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="text-center mt-2">
        <p className="text-lg font-bold">{player.name}</p>
      </div>
    </article>
  );
}
