import { useState } from "react";

import { EVENT_STEPS, GAME_EVENTS, type EventStep } from "@/constants/game";

import type { GameCard } from "@/types/card";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";

export function useCardEvent() {
  // Estados para eventos de cartas
  const [currentEventCard, setCurrentEventCard] = useState<GameCard | null>(
    null,
  );
  const [selectedTargetPlayer, setSelectedTargetPlayer] =
    useState<GamePlayer | null>(null);
  const [selectedTargetSecret, setSelectedTargetSecret] =
    useState<GameSecret | null>(null);
  const [selectedTargetSet, setSelectedTargetSet] = useState<MatchSet | null>(
    null,
  );
  const [currentEventStep, setCurrentEventStep] = useState<EventStep>(null);

  const canSelectMeAsPlayer =
    currentEventCard?.name === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
    currentEventStep === EVENT_STEPS.SELECT_PLAYER &&
    selectedTargetPlayer === null;

  return {
    currentEventCard,
    setCurrentEventCard,
    selectedTargetPlayer,
    setSelectedTargetPlayer,
    selectedTargetSecret,
    setSelectedTargetSecret,
    selectedTargetSet,
    setSelectedTargetSet,
    currentEventStep,
    setCurrentEventStep,
    canSelectMeAsPlayer,
  };
}
