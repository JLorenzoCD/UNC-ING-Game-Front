import { useMemo, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";
import { useBasicGame } from "@/contexts/BasicGameContext";

import { toast } from "sonner";

import { EVENT_STEPS, GAME_EVENTS, type EventStep } from "@/constants/game";
import { handleApiError } from "@/utils/errorHandler";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";
import type {
  AndThenThereWasOneMoreEventPayload,
  AnotherVictimEventPayload,
  CardsOffTheTableEventPayload,
  CardTradeEventPayload,
  DeadCardFollyEventPayload,
  EventPayload,
  LookIntoTheAshesEventPayload,
  RegularAndDiscardEventPayload,
} from "@/types/event";

export function useCardEvent() {
  const {
    match,
    pendingResponse,
    clearPendingResponse,
    playerFinishActionTurn,
  } = useBasicGame();
  const { player } = usePlayer();
  const { httpService } = useHttpService();

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

  const canSelectMeAsPlayer = useMemo(() => {
    return (
      currentEventCard?.name === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
      currentEventStep === EVENT_STEPS.SELECT_PLAYER &&
      selectedTargetPlayer === null
    );
  }, [currentEventCard, currentEventStep, selectedTargetPlayer]);

  const isInEvent = useMemo(
    () => currentEventCard !== null,
    [currentEventCard],
  );

  const playEvent = (
    selectedCards: GameCard[],
    handleEventDiscard: () => void,
    handleEndEvent: (eventCard: GameCard) => Promise<void>,
  ) => {
    if (selectedCards.length !== 1) return;
    const cardEvent = selectedCards[0];

    // Chequeamos el tipo de evento, para mostrarle al jugador que hacer
    const nameEvent = cardEvent.name;
    switch (nameEvent) {
      case GAME_EVENTS.DELAY_THE_MURDERER_ESCAPE:
      case GAME_EVENTS.POINT_YOUR_SUSPICIONS:
      case GAME_EVENTS.EARLY_TRAIN_TO_PADDINGTON: {
        handleEndEvent(cardEvent);
        break;
      }

      case GAME_EVENTS.LOOK_INTO_THE_ASHES: {
        handleEventDiscard();
        break;
      }

      case GAME_EVENTS.CARDS_OFF_THE_TABLE:
      case GAME_EVENTS.CARD_TRADE: {
        setCurrentEventStep(EVENT_STEPS.SELECT_PLAYER);
        break;
      }

      case GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE: {
        setCurrentEventStep(EVENT_STEPS.SELECT_SECRET);
        break;
      }

      case GAME_EVENTS.ANOTHER_VICTIM: {
        setCurrentEventStep(EVENT_STEPS.SELECT_SET);
        break;
      }

      case GAME_EVENTS.DEAD_CARD_FOLLY: {
        setCurrentEventStep(EVENT_STEPS.SELECT_DIRECTION);
        break;
      }

      default:
        return;
    }

    setCurrentEventCard(cardEvent);
  };

  const executeCardEventActionToTarget = async (
    cardToUse: GameCard,
    selectedCards: GameCard[],
    cardsInDiscardPile: GameCard[],
    drawableCards: GameCard[],
    clearDiscardModal: () => void,
    clearSelectedCards: () => void,
    playStolenSet: (setId: UUID) => void,
    direction?: "LEFT" | "RIGHT",
  ) => {
    if (httpService === null || match == null || player === null) return;

    const nameEvent = cardToUse.name;
    let eventPayload: EventPayload | undefined;

    switch (nameEvent) {
      case GAME_EVENTS.LOOK_INTO_THE_ASHES: {
        // Validamos que haya una carta seleccionada del descarte
        if (selectedCards.length !== 2) {
          console.warn("Debe seleccionar exactamente una carta del descarte");
          return;
        }

        const selectedDiscardedCard = selectedCards[1];

        // Construimos el payload para el evento
        eventPayload = {
          target_card_id: selectedDiscardedCard.id,
        } as LookIntoTheAshesEventPayload;

        // Cerramos el modal
        clearDiscardModal();

        break;
      }

      case GAME_EVENTS.DELAY_THE_MURDERER_ESCAPE: {
        const idsInDiscardPile = cardsInDiscardPile.map((card) => card.id);
        const latestFive = idsInDiscardPile.slice(0, 5);

        eventPayload = {
          cards_ids: latestFive,
        } as RegularAndDiscardEventPayload;
        break;
      }

      case GAME_EVENTS.CARDS_OFF_THE_TABLE: {
        if (!selectedTargetPlayer) {
          console.warn("Debe seleccionar un jugador objetivo");
          return;
        }

        eventPayload = {
          target_player_id: selectedTargetPlayer.id,
        } as CardsOffTheTableEventPayload;

        setSelectedTargetPlayer(null);
        setCurrentEventStep(null);
        break;
      }

      case GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE: {
        if (!selectedTargetPlayer || !selectedTargetSecret) {
          console.warn("Debe seleccionar un jugador objetivo y un secreto");
          return;
        }
        eventPayload = {
          target_secret_id: selectedTargetSecret.id,
          target_player_id: selectedTargetPlayer.id,
        } as AndThenThereWasOneMoreEventPayload;

        setSelectedTargetPlayer(null);
        setSelectedTargetSecret(null);
        setCurrentEventStep(null);
        break;
      }

      case GAME_EVENTS.EARLY_TRAIN_TO_PADDINGTON: {
        // Saltar las primeras 3 cartas y tomar las siguientes 6
        const cardsToReveal = drawableCards.slice(3, 9);

        // Construir el payload con los IDs de las 6 cartas
        eventPayload = {
          cards_ids: cardsToReveal.map((card) => card.id),
        } as RegularAndDiscardEventPayload;
        break;
      }

      case GAME_EVENTS.ANOTHER_VICTIM: {
        if (!selectedTargetSet) {
          console.warn("Set no seleccionado");
        }
        eventPayload = {
          target_set_id: selectedTargetSet?.id,
        } as AnotherVictimEventPayload;
        break;
      }

      case GAME_EVENTS.CARD_TRADE: {
        if (!selectedTargetPlayer) {
          toast.error("Player not selected");
        }
        eventPayload = {
          target_player_id: selectedTargetPlayer?.id,
        } as CardTradeEventPayload;
        setSelectedTargetPlayer(null);
        setCurrentEventStep(null);
        break;
      }

      case GAME_EVENTS.POINT_YOUR_SUSPICIONS: {
        eventPayload = {
          cards_ids: [],
        } as RegularAndDiscardEventPayload;
        break;
      }

      case GAME_EVENTS.DEAD_CARD_FOLLY: {
        if (!direction) {
          toast.error("You must select a direction first.");
          return;
        }
        eventPayload = {
          direction: direction,
        } as DeadCardFollyEventPayload;
        setCurrentEventStep(null);
        break;
      }

      default:
        console.warn(`Evento no manejado: ${nameEvent}`);
        return;
    }
    // Llamada a la API
    try {
      // Llamada a la API para jugar el evento
      await httpService.postEvent(
        match.id,
        player.id,
        cardToUse.id,
        eventPayload,
      );

      if (nameEvent === GAME_EVENTS.ANOTHER_VICTIM) {
        // Se establece los valores del setEvent
        const setId = selectedTargetSet?.id as UUID;
        playStolenSet(setId);

        // Se limpia el evento Another_victim
        setSelectedTargetSet(null);
        setCurrentEventStep(null);
      } else {
        // Los otros eventos ya terminaron y no se puede continuar.
        playerFinishActionTurn();
      }

      setCurrentEventCard(null);
      clearSelectedCards();
    } catch (error) {
      handleApiError(error, "Error al ejecutar el evento");
    }
  };

  const executeCardEventActionToPlayerTarget = async (
    handleEndEvent: () => Promise<void>,
    clearSelectedCards: () => void,
  ) => {
    if (
      (currentEventCard?.name === GAME_EVENTS.CARDS_OFF_THE_TABLE ||
        currentEventCard?.name === GAME_EVENTS.CARD_TRADE) &&
      currentEventStep === EVENT_STEPS.SELECT_PLAYER
    ) {
      if (selectedTargetPlayer) {
        await handleEndEvent();
      } else {
        toast.error("You must select a player first.");
      }
      return; // Importante: Salir después de manejar el evento de carta
    }

    if (
      pendingResponse.isPending &&
      pendingResponse.eventType === GAME_EVENTS.POINT_YOUR_SUSPICIONS
    ) {
      if (
        !selectedTargetPlayer ||
        !httpService ||
        !player ||
        !match ||
        !pendingResponse.eventId
      ) {
        toast.error("You must select a player first.");
        return;
      }

      try {
        await httpService.postPointYourSuspicions(
          match.id,
          player.id,
          pendingResponse.eventId,
          selectedTargetPlayer.id,
        );

        toast.success("Your suspicion has been recorded.");
        clearPendingResponse();
        setSelectedTargetPlayer(null);
      } catch (error) {
        handleApiError(error, "Error registering suspicion");
      }
      return;
    }

    if (canSelectMeAsPlayer && selectedTargetPlayer === null) {
      const cardToUse = currentEventCard;

      if (
        !httpService ||
        !player ||
        !match ||
        !cardToUse ||
        !selectedTargetSecret
      ) {
        return;
      }

      const eventPayload = {
        target_secret_id: selectedTargetSecret.id,
        target_player_id: player.id,
      } as AndThenThereWasOneMoreEventPayload;

      setSelectedTargetSecret(null);
      setCurrentEventStep(null);

      try {
        // Llamada a la API para jugar el evento
        await httpService.postEvent(
          match.id,
          player.id,
          cardToUse.id,
          eventPayload,
        );

        clearSelectedCards();
        setCurrentEventCard(null);
        playerFinishActionTurn();
      } catch (error) {
        handleApiError(error, "Error al ejecutar el evento");
      }
    }

    if (
      currentEventCard?.name === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
      currentEventStep === EVENT_STEPS.SELECT_PLAYER
    ) {
      if (
        (selectedTargetPlayer || canSelectMeAsPlayer) &&
        selectedTargetSecret
      ) {
        await handleEndEvent();
      } else {
        toast.error("You must select a secret and a player first.");
      }
      return;
    }
  };

  const cardEventSelectSecret = () => {
    if (
      currentEventCard?.name === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
      currentEventStep === EVENT_STEPS.SELECT_SECRET
    ) {
      if (selectedTargetSecret) {
        setCurrentEventStep(EVENT_STEPS.SELECT_PLAYER);
        toast.info("Now select a player.");
      } else {
        toast.error("You must select a secret first.");
      }
      return;
    }
  };

  const setTargetCardEvent = (target: GamePlayer | GameSecret | MatchSet) => {
    if (
      pendingResponse.isPending &&
      pendingResponse.eventType === GAME_EVENTS.POINT_YOUR_SUSPICIONS &&
      "avatar" in target
    ) {
      setSelectedTargetPlayer(target as GamePlayer);
      return;
    }

    if (currentEventCard === null) return;
    const eventCardName = currentEventCard.name;

    if (eventCardName === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE) {
      if (
        currentEventStep === EVENT_STEPS.SELECT_SECRET &&
        "secret_id" in target
      ) {
        setSelectedTargetSecret(target as GameSecret);
        setCurrentEventStep(EVENT_STEPS.SELECT_PLAYER);
        return;
      } else if (
        currentEventStep === EVENT_STEPS.SELECT_PLAYER &&
        "avatar" in target
      ) {
        setSelectedTargetPlayer(target as GamePlayer);
        return;
      }
    }

    if (
      eventCardName === GAME_EVENTS.CARDS_OFF_THE_TABLE &&
      "avatar" in target
    ) {
      setSelectedTargetPlayer(target as GamePlayer);
      return;
    }

    if (
      eventCardName === GAME_EVENTS.CARD_TRADE &&
      currentEventStep === EVENT_STEPS.SELECT_PLAYER &&
      "avatar" in target
    ) {
      setSelectedTargetPlayer(target as GamePlayer);
      return;
    }

    if (eventCardName === GAME_EVENTS.ANOTHER_VICTIM && "quin_play" in target) {
      setSelectedTargetSet(target as MatchSet);
      return;
    }
  };

  const clearCardEventStep = () => {
    setCurrentEventStep(null);
  };

  return {
    currentEventCard,
    selectedTargetPlayer,
    selectedTargetSecret,
    selectedTargetSet,
    currentEventStep,
    canSelectMeAsPlayer,

    isInEvent,

    playEvent,
    setTargetCardEvent,
    executeCardEventActionToTarget,
    executeCardEventActionToPlayerTarget,
    cardEventSelectSecret,
    clearCardEventStep,
  };
}
