import { RiVipCrown2Fill } from "@remixicon/react";
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

interface Props {
  type: SetType;
  quin_play: boolean;
  quin_count: number;
  set_object: MatchSet;
  onSelectTargetEvent?: (target: GamePlayer | GameSecret | MatchSet) => void;
  isSelectableSet?: (set: MatchSet) => boolean;
  isTargetSet?: boolean;
  target?: GamePlayer | GameSecret | MatchSet | null;
}

function getBoderClass(
  isSelectionMode: boolean,
  isSelectable: boolean,
  isTarget: boolean,
  isSelectingTarget: boolean,
) {
  let borderClass = "";
  if (isSelectionMode) {
    if (isSelectable) {
      if (isTarget) {
        // Set seleccionado
        borderClass =
          "outline outline-2 outline-blue-400 shadow-lg shadow-blue-400/50 animate-none";
      } else if (isSelectingTarget) {
        // Aún no se ha seleccionado y es una opción válida
        borderClass =
          "outline outline-2 outline-red-400 shadow-lg shadow-red-400/50 animate-pulse cursor-pointer";
      } else {
        borderClass =
          "outline outline-2 outline-transparent shadow-none brightness-50";
      }
    } else {
      // NO Seleccionable (Atenuado)
      borderClass =
        "outline outline-2 outline-transparent shadow-none brightness-50";
    }
  }

  return borderClass;
}

export default function Set({
  type,
  quin_play,
  quin_count,
  set_object,
  onSelectTargetEvent,
  isSelectableSet,
  isTargetSet = false,
  target = null,
}: Props) {
  const cardSize = "w-15 h-22.5";

  const isTwoBeresford = type === "TWO BERESFORD";
  const containerSize = isTwoBeresford ? "mr-4" : "";
  const imgTitle = isTwoBeresford ? "TOMMY BERESFORD" : type;

  const handleClickSet = () => {
    if (typeof onSelectTargetEvent !== "function" || !isSelectable) return;
    onSelectTargetEvent(set_object);
  };

  const isTarget = target?.id === set_object.id;
  const isSelectingTarget = target === null;
  const isSelectable = isSelectableSet ? isSelectableSet(set_object) : false;

  const isSelectionMode = isTargetSet;

  const baseClasses = "rounded-lg overflow-hidden transition-all duration-200";
  const boderClass = getBoderClass(
    isSelectionMode,
    isSelectable,
    isTarget,
    isSelectingTarget,
  );

  return (
    <div className={`relative ${containerSize}`} onClick={handleClickSet}>
      {quin_play && (
        <RiVipCrown2Fill
          color={quin_count === 1 ? "peru" : "gold"}
          size={30}
          className="absolute -top-3 -left-3 -rotate-[20deg] z-2"
        />
      )}
      <div className={twJoin(baseClasses, cardSize, boderClass)}>
        <img
          title={imgTitle}
          draggable="false"
          data-testid="set"
          src={SET_IMAGE_PATHS[type]}
          alt={`set-type-${imgTitle}`}
          className={twJoin(
            "object-cover select-none w-full h-full absolute hover:z-1",
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
