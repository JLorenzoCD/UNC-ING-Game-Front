import type { CardName, Card as CardSchema } from "@/types/card";

// Imports de las imágenes de las cartas.
// Estos son manejados por Vite y, dependiendo del entorno,
// se resuelven al URL correcto.
import cardPoirot from "@/assets/07-detective_poirot.png";
import cardMarple from "@/assets/08-detective_marple.png";
import cardSatterhwaite from "@/assets/09-detective_satterthwaite.png";
import cardPyne from "@/assets/10-detective_pyne.png";
import cardBrent from "@/assets/11-detective_brent.png";
import cardTommy from "@/assets/12-detective_tommyberesford.png";
import cardTuppence from "@/assets/13-detective_tuppenceberesford.png";
import cardQuin from "@/assets/14-detective_quin.png";
import cardOliver from "@/assets/15-detective_oliver.png";
import cardNotSoFast from "@/assets/16-Instant_notsofast.png";
import cardCardsOffTheTable from "@/assets/17-event_cardsoffthetable.png";
import cardAnotherVictim from "@/assets/18-event_anothervictim.png";
import cardDeadCardFolly from "@/assets/19-event_deadcardfolly.png";
import cardLookAshes from "@/assets/20-event_lookashes.png";
import cardCardTrade from "@/assets/21-event_cardtrade.png";
import cardOneMore from "@/assets/22-event_onemore.png";
import cardDelayEscape from "@/assets/23-event_delayescape.png";
import cardEarlyTrain from "@/assets/24-event_earlytrain.png";
import cardPointSuspicions from "@/assets/25-event_pointsuspicions.png";
import cardBlackMailed from "@/assets/26-devious_blackmailed.png";
import cardFauxPas from "@/assets/27-devious_fauxpas.png";

const CARD_IMAGE_PATHS: Record<CardName, string> = {
  "HERCULE POIROT": cardPoirot,
  "MISS MARPLE": cardMarple,
  "MR SATTERTHWAITE": cardSatterhwaite,
  "PARKER PYNE": cardPyne,
  "LADY EILEEN": cardBrent,
  "TOMMY BERESFORD": cardTommy,
  "TUPPENCE BERESFORD": cardTuppence,
  "HARLEY QUIN WILDCARD": cardQuin,
  "ARIADNE OLIVER": cardOliver,
  "NOT SO FAST": cardNotSoFast,
  "CARDS OFF THE TABLE": cardCardsOffTheTable,
  "ANOTHER VICTIM": cardAnotherVictim,
  "DEAD CARD FOLLY": cardDeadCardFolly,
  "LOOK INTO THE ASHES": cardLookAshes,
  "CARD TRADE": cardCardTrade,
  "AND THEN THERE WAS ONE MORE": cardOneMore,
  "DELAY THE MURDERER ESCAPE": cardDelayEscape,
  "EARLY TRAIN TO PADDINGTON": cardEarlyTrain,
  "POINT YOUR SUSPICIONS": cardPointSuspicions,
  BLACKMAILED: cardBlackMailed,
  "SOCIAL FAUX PAS": cardFauxPas,
};

type CardSize = "icon" | "xsmall" | "small" | "default";

export const CARD_SIZES: Record<CardSize, string> = {
  icon: "w-16 h-24",
  xsmall: "w-20 h-28",
  small: "w-32 h-48",
  default: "w-40 h-60",
} as const;

type CardProps = Pick<CardSchema, "name" | "description"> & {
  size?: CardSize;
};

export default function Card({
  name,
  description,
  size = "default",
}: CardProps) {
  const imagePath = CARD_IMAGE_PATHS[name];

  return (
    <img
      data-testid="card"
      src={imagePath}
      alt={description}
      className={`${CARD_SIZES[size]} rounded-lg object-cover`}
    />
  );
}
