import { RiCloseLargeFill, RiVipCrown2Fill } from "@remixicon/react";
import { twJoin } from "tailwind-merge";

import cardPoirot from "@/assets/07-detective_poirot.png";
import cardMarple from "@/assets/08-detective_marple.png";
import cardSatterhwaite from "@/assets/09-detective_satterthwaite.png";
import cardPyne from "@/assets/10-detective_pyne.png";
import cardBrent from "@/assets/11-detective_brent.png";
import cardTommy from "@/assets/12-detective_tommyberesford.png";
import cardTuppence from "@/assets/13-detective_tuppenceberesford.png";

import type { MatchSet, SetType } from "@/types/set";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import { useLogicGame } from "@/contexts/LogicGameContext";

const SET_IMAGE_PATHS: Record<SetType, string> = {
  "HERCULE POIROT": cardPoirot,
  "MISS MARPLE": cardMarple,
  "LADY EILEEN": cardBrent,
  "MR SATTERTHWAITE": cardSatterhwaite,
  "PARKER PYNE": cardPyne,
  "TOMMY BERESFORD": cardTommy,
  "TUPPENCE BERESFORD": cardTuppence,
  "TWO BERESFORD": cardTommy,
};

function getBoderClass(
  isSelectionMode: boolean,
  isSelectable: boolean,
  isTarget: boolean,
  isSelectingTarget: boolean,
) {
  let borderClass = "border-2 border-transparent";
  if (isSelectionMode) {
    if (isSelectable) {
      if (isTarget) {
        // Set seleccionado
        borderClass =
          "border-2 border-blue-400 shadow-lg shadow-blue-400/50 animate-none";
      } else if (isSelectingTarget) {
        // Aún no se ha seleccionado y es una opción válida
        borderClass =
          "border-2 border-red-400 shadow-lg shadow-red-400/50 animate-pulse cursor-pointer";
      } else {
        borderClass = "border-2 border-transparent shadow-none brightness-50";
      }
    } else {
      // NO Seleccionable (Atenuado)
      borderClass = "border-2 border-transparent shadow-none brightness-50";
    }
  }

  return borderClass;
}

interface Props {
  set: MatchSet | null;
  target?: GamePlayer | GameSecret | MatchSet | null;
  onSelectTargetEvent?: (target: GamePlayer | GameSecret | MatchSet) => void;
}

export default function Set({
  set = null,
  target = null,
  onSelectTargetEvent,
}: Props) {
  const { isSelectableSet, isTargetSetEvent } = useLogicGame();

  const cardSize = "w-15 h-22.5";

  if (!set) {
    return <EmptySet />;
  }

  const isTwoBeresford = set.type === "TWO BERESFORD";
  const containerSize = isTwoBeresford ? "mr-4" : "";
  const imgTitle = isTwoBeresford ? "TOMMY BERESFORD" : set.type;

  const handleClickSet = () => {
    if (typeof onSelectTargetEvent !== "function" || !isSelectable) return;
    onSelectTargetEvent(set);
  };

  const isTarget = target?.id === set.id;
  const isSelectingTarget = target === null;
  const isSelectable = isSelectableSet ? isSelectableSet(set) : false;

  const isSelectionMode = isTargetSetEvent();

  const baseClasses = "rounded-lg overflow-hidden transition-all duration-200";
  const boderClass = getBoderClass(
    isSelectionMode,
    isSelectable,
    isTarget,
    isSelectingTarget,
  );

  return (
    <div className={`relative ${containerSize}`} onClick={handleClickSet}>
      {set.quin_play && (
        <RiVipCrown2Fill
          color={set.quin_count === 1 ? "peru" : "gold"}
          size={30}
          className="absolute -top-3 -left-3 -rotate-[20deg] z-2"
        />
      )}
      <div className={twJoin(baseClasses, cardSize, boderClass)}>
        <img
          title={imgTitle}
          draggable="false"
          data-testid="set"
          src={SET_IMAGE_PATHS[set.type]}
          alt={`set-type-${imgTitle}`}
          className={twJoin(
            "object-cover select-none w-full h-full hover:z-1",
            isSelectionMode && !isSelectable && "brightness-50",
          )}
        />
      </div>
      {isTwoBeresford && (
        <div
          className={twJoin(
            baseClasses,
            cardSize,
            boderClass,
            "absolute top-0 -right-5 rotate-[5deg]",
          )}
        >
          <img
            title="TUPPENCE BERESFORD"
            draggable="false"
            data-testid="set"
            src={cardTuppence}
            alt="set-type-TUPPENCE BERESFORD"
            className={twJoin(
              "object-cover select-none w-full h-full",
              isSelectionMode && !isSelectable && "brightness-50",
            )}
          />
        </div>
      )}
    </div>
  );
}

function EmptySet() {
  return (
    <div
      data-testid="empty-set"
      className="w-15 h-22.5 flex items-center justify-center border-2 border-dashed border-gray-400 text-gray-400 rounded-lg"
    >
      <RiCloseLargeFill />
    </div>
  );
}
