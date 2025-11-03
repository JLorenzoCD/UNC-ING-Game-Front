import { twJoin } from "tailwind-merge";

import Secrets from "./Secrets";
import Sets from "./Sets";

import { getBoderPlayer, truncateName } from "../utils/player";

import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";

interface PlayerProps {
  onSelectTargetEvent: (target: GamePlayer | GameSecret | MatchSet) => void;
  isSelectablePlayer: (player: GamePlayer) => boolean;
  isSelectableSecret: (secret: GameSecret) => boolean;
  isSelectableSet: (set: MatchSet) => boolean;

  player: GamePlayer;
  secrets: GameSecret[];
  sets: MatchSet[];
  hasCurrentTurn: boolean;

  isPlayerEvent: boolean;
  isTargetSecret: boolean;
  isTargetSet: boolean;
  target: GamePlayer | GameSecret | MatchSet | null;
}

export default function Player({
  onSelectTargetEvent,
  isSelectablePlayer,
  isSelectableSecret,
  isSelectableSet,

  player,
  secrets,
  sets,
  hasCurrentTurn,

  isPlayerEvent,
  isTargetSecret,
  isTargetSet,
  target,
}: PlayerProps) {
  const handleClickPlayer = () => {
    onSelectTargetEvent(player);
  };

  const isTargetPlayer = target !== null && "avatar" in target;
  const isTarget = isTargetPlayer && player.id === target?.id;
  const isSelectingTarget = target === null || !isTargetPlayer;
  const isSelectable = isSelectablePlayer(player);

  const isActivePlayerSelection = isPlayerEvent;

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
        <Sets
          sets={sets}
          onSelectTargetEvent={onSelectTargetEvent}
          isSelectableSet={isSelectableSet}
          isTargetSet={isTargetSet}
          target={target}
        />
      </div>
    </div>
  );
}
