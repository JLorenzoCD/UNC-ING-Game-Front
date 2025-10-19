import Secrets from "./Secrets";
import Sets from "./Sets";

import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";
import { twJoin } from "tailwind-merge";

const truncateName = (name: string, maxLength = 15) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

function getBoderPlayer(
  hasCurrentTurn: boolean,
  isActivePlayerSelection: boolean,
  isSelectable: boolean,
  isTarget: boolean,
  isSelectingTarget: boolean,
) {
  let borderClass = "border-transparent";

  if (isActivePlayerSelection) {
    // Modo Selección de Jugador

    if (isSelectable) {
      if (isTarget) {
        // Es el objetivo ya seleccionado (Borde fijo)
        borderClass =
          "border-red-400 border-10 shadow-lg shadow-red-400/50 animate-none";
      } else if (isSelectingTarget) {
        // Es una opción válida y se está esperando la selección (Pulso)
        borderClass =
          "border-blue-400 border-10 shadow-lg shadow-blue-400/50 animate-pulse cursor-pointer";
      }
    } else {
      // NO Seleccionable (Atenuado)
      borderClass =
        "border-4 border-transparent shadow-none brightness-50 cursor-default";
    }
  } else if (hasCurrentTurn) {
    borderClass =
      "border-green-400 shadow-lg shadow-green-400/50 animate-pulse";
  }

  return borderClass;
}

interface PlayerProps {
  onSelectTargetEvent: (target: GamePlayer | GameSecret) => void;
  isSelectablePlayer: (player: GamePlayer) => boolean;
  isSelectableSecret: (secret: GameSecret) => boolean;

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
  isSelectablePlayer,
  isSelectableSecret,

  player,
  secrets,
  sets,
  hasCurrentTurn,

  isPlayerEvent,
  isTargetSecret,
  target,
}: PlayerProps) {
  const handleClickPlayer = () => {
    onSelectTargetEvent(player);
  };

  const isTarget = player.id === target?.id;
  const isSelectingTarget = target === null;
  const isSelectable = isSelectablePlayer(player);

  const isActivePlayerSelection = isPlayerEvent && !hasCurrentTurn;

  const baseClasses =
    "w-20 h-20 rounded-full border-4 transition-all duration-200";
  const borderClass = getBoderPlayer(
    hasCurrentTurn,
    isActivePlayerSelection,
    isSelectable,
    isTarget,
    isSelectingTarget,
  );

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-2 items-center">
        <div
          onClick={handleClickPlayer}
          className={twJoin(baseClasses, borderClass)}
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
          isSelectableSecret={isSelectableSecret}
          isTargetSecret={isTargetSecret}
          target={target}
        />
        <Sets sets={sets} />
      </div>
    </div>
  );
}
