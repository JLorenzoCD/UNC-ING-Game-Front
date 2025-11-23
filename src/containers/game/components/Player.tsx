import { useMemo } from "react";
import { twJoin } from "tailwind-merge";
import { RiGhostLine, RiSliceLine } from "@remixicon/react";
import { useLogicGame } from "@/contexts/LogicGameContext";

import Secrets from "./Secrets";
import Sets from "./Sets";

import { getPlayerBorderClass, truncateName } from "../utils/player";

import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";

interface PlayerProps {
  onSelectTargetEvent: (target: GamePlayer | GameSecret | MatchSet) => void;

  player: GamePlayer;
  secrets: GameSecret[];
  sets: MatchSet[];
  hasCurrentTurn: boolean;

  /**
   * Indica si se debe resaltar el rol del jugador (por ejemplo, el Asesino).
   * Esto aplica solo para el asesino y el cómplice, por lo que otros roles
   * no podrán saber quienes son los jugadores con roles especiales.
   */
  shouldHighlightRole?: boolean;
}

export default function Player({
  onSelectTargetEvent,

  player,
  secrets,
  sets,
  hasCurrentTurn,

  shouldHighlightRole = false,
}: PlayerProps) {
  const { getTarget, isSelectablePlayer, isEvent, isTargetPlayerEvent } =
    useLogicGame();

  const handleClickPlayer = () => {
    onSelectTargetEvent(player);
  };

  const target = useMemo(() => getTarget(), [getTarget]);

  const isTargetPlayer = target !== null && "avatar" in target;
  const isTarget = isTargetPlayer && player.id === target?.id;
  const isSelectingTarget = target === null || !isTargetPlayer;
  const isSelectable = isSelectablePlayer(player);

  const isActivePlayerSelection = isEvent && isTargetPlayerEvent();

  const baseClasses =
    "w-20 h-20 rounded-full border-4 transition-all duration-200";

  const borderClass = getPlayerBorderClass(
    isTarget,
    isSelectable,
    isSelectingTarget,
    hasCurrentTurn,
    shouldHighlightRole,
    isActivePlayerSelection,
  );

  const shouldShowRoleIcon = shouldHighlightRole && player.role !== "INNOCENT";

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
          className="px-3 py-1 flex items-center gap-x-1 rounded-full text-white font-semibold bg-black/80 shadow-lg border border-white/30 backdrop-blur-sm cursor-default"
        >
          {truncateName(player.name, 10)}

          {shouldShowRoleIcon &&
            (player.role === "MURDERER" ? <RiSliceLine /> : <RiGhostLine />)}
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <Secrets
          secrets={secrets}
          onSelectTargetEvent={onSelectTargetEvent}
          target={target}
        />
        <Sets
          sets={sets}
          onSelectTargetEvent={onSelectTargetEvent}
          target={target}
        />
      </div>
    </div>
  );
}
