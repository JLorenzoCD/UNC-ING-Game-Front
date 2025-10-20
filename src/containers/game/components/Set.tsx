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
}

export default function Set({ type, quin_play, quin_count }: Props) {
  const cardSize = "w-15 h-22.5";

  const isTwoBeresford = type === "TWO BERESFORD";
  const containerSize = isTwoBeresford ? "mr-4" : "";
  const imgTitle = isTwoBeresford ? "TOMMY BERESFORD" : type;

  return (
    <div className={`relative ${containerSize}`}>
      {quin_play && (
        <RiVipCrown2Fill
          color={quin_count === 1 ? "peru" : "gold"}
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
            title="TUPPENCE BERESFORD"
            draggable="false"
            data-testid="set"
            src={cardTuppence}
            alt="set-type-TUPPENCE BERESFORD"
            className={`object-cover select-none ${cardSize}`}
          />
        </div>
      )}
    </div>
  );
}
