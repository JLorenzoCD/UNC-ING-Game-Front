import type { Card as CardSchema } from "@/types/card"

// Imports de las imágenes de las cartas.
// Estos son manejados por Vite y, dependiendo del entorno,
// se resuelven al URL correcto.
import cardPoirot from "@/assets/07-detective_poirot.png"
import cardMarple from "@/assets/08-detective_marple.png"
import cardSatterhwaite from "@/assets/09-detective_satterthwaite.png"
import cardPyne from "@/assets/10-detective_pyne.png"
import cardBrent from "@/assets/11-detective_brent.png"
import cardTommy from "@/assets/12-detective_tommyberesford.png"
import cardTuppence from "@/assets/13-detective_tuppenceberesford.png"
import cardQuin from "@/assets/14-detective_quin.png"
import cardOliver from "@/assets/15-detective_oliver.png"
import cardNotSoFast from "@/assets/16-Instant_notsofast.png"
import cardCardsOffTheTable from "@/assets/17-event_cardsoffthetable.png"
import cardAnotherVictim from "@/assets/18-event_anothervictim.png"
import cardDeadCardFolly from "@/assets/19-event_deadcardfolly.png"
import cardLookAshes from "@/assets/20-event_lookashes.png"
import cardCardTrade from "@/assets/21-event_cardtrade.png"
import cardOneMore from "@/assets/22-event_onemore.png"
import cardDelayEscape from "@/assets/23-event_delayescape.png"
import cardEarlyTrain from "@/assets/24-event_earlytrain.png"
import cardPointSuspicions from "@/assets/25-event_pointsuspicions.png"
import cardBlackMailed from "@/assets/26-devious_blackmailed.png"
import cardFauxPas from "@/assets/27-devious_fauxpas.png"

const CARD_IMAGE_PATHS: Record<string, string> = {
  "POIROT": cardPoirot,
  "MARPLE": cardMarple,
  "SATTERTHWAITE": cardSatterhwaite,
  "PYNE": cardPyne,
  "BRENT": cardBrent,
  "TOMMY": cardTommy,
  "TUPPENCE": cardTuppence,
  "QUIN": cardQuin,
  "OLIVER": cardOliver,
  "NOT SO FAST": cardNotSoFast,
  "CARDS OFF THE TABLE": cardCardsOffTheTable,
  "ANOTHER VICTIM": cardAnotherVictim,
  "DEAD CARD FOLLY": cardDeadCardFolly,
  "LOOK ASHES": cardLookAshes,
  "CARD TRADE": cardCardTrade,
  "ONE MORE": cardOneMore,
  "DELAY ESCAPE": cardDelayEscape,
  "EARLY TRAIN": cardEarlyTrain,
  "POINT SUSPICIONS": cardPointSuspicions,
  "BLACK MAILED": cardBlackMailed,
  "FAUX PAS": cardFauxPas
}

type CardProps = Pick<CardSchema, "name" | "description" >

function EmptyCard() {
  return (
    <div className="w-40 border-2 border-gray-400 border-dashed">
      <div className="text-center text-gray-400 italic p-4">
        No image available
      </div>
    </div>
  )
}

export default function Card({ name, description }: CardProps) {
  const imagePath = CARD_IMAGE_PATHS[name] || "";

  if (!imagePath) {
    console.warn(`No image found for card: ${name}`);

    return <EmptyCard />;
  }

  return (
    <img src={imagePath} alt={description} className="w-40" />
  )
}