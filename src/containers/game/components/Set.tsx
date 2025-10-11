import { RiVipCrown2Fill } from "@remixicon/react";

import cardPoirot from "@/assets/07-detective_poirot.png";
import cardMarple from "@/assets/08-detective_marple.png";
import cardSatterhwaite from "@/assets/09-detective_satterthwaite.png";
import cardPyne from "@/assets/10-detective_pyne.png";
import cardBrent from "@/assets/11-detective_brent.png";
import cardTommy from "@/assets/12-detective_tommyberesford.png";
import cardTuppence from "@/assets/13-detective_tuppenceberesford.png";

import type { SetType } from "@/types/set";

const SET_IMAGE_PATHS: Record<SetType, string> = {
  Hercule_Poirot: cardPoirot,
  Miss_Marple: cardMarple,
  Lady_Eileen: cardBrent,
  Mr_Satterthwaite: cardSatterhwaite,
  Parker_Pyner: cardPyne,
  Tommy_Beresford: cardTommy,
  Tuppence_Beresford: cardTuppence,
  Two_Beresford: cardTommy,
};

interface Props {
  type: SetType;
  quin_play: boolean;
  isSessionPlayer: boolean;
}

export default function Set({ type, quin_play, isSessionPlayer }: Props) {
  const cardSize = !isSessionPlayer ? "w-15 h-22.5" : "w-20 h-30";

  const isTwoBeresford = type === "Two_Beresford";
  const containerSize = isTwoBeresford ? "mr-4" : "";
  const imgTitle = isTwoBeresford ? "Tommy_Beresford" : type;

  return (
    <div className={`relative ${containerSize}`}>
      {quin_play && (
        <RiVipCrown2Fill
          color="yellow"
          size={30}
          className="absolute -top-3 -left-3 -rotate-[20deg] z-2"
        />
      )}
      <div className={`rounded-lg overflow-hidden ${cardSize}`}>
        <img
          title={imgTitle}
          draggable="false"
          data-testid="set"
          src={SET_IMAGE_PATHS[type]}
          alt={`set-type-${imgTitle}`}
          className={`object-cover select-none ${cardSize} absolute hover:z-1`}
        />
      </div>
      {isTwoBeresford && (
        <div
          className={`rounded-lg overflow-hidden ${cardSize} absolute top-0 -right-5 rotate-[5deg]`}
        >
          <img
            title="Tuppence_Beresford"
            draggable="false"
            data-testid="set"
            src={cardTuppence}
            alt="set-type-Tuppence_Beresford"
            className={`object-cover select-none ${cardSize}`}
          />
        </div>
      )}
    </div>
  );
}
