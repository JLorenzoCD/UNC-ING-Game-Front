import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";
import { useHand } from "./hooks/useHand";
import { useSetEvent } from "./hooks/useSetEvent";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";
import type {
  RegularAndDiscardEventPayload,
  LookIntoTheAshesEventPayload,
  AndThenThereWasOneMoreEventPayload,
  CardsOffTheTableEventPayload,
  AnotherVictimEventPayload,
  CardTradeEventPayload,
} from "@/types/event";
import type { EventPayload } from "@/types/event";

import Hand from "./components/Hand";
import Sets from "./components/Sets";
import Table from "./components/Table";
import Draft from "./components/Draft";
import Result from "./components/Result";
import Secrets from "./components/Secrets";
import DrawPile from "./components/DrawPile";
import DiscardPile from "./components/DiscardPile";
import HandActions from "./components/HandActions";
import DiscardModal from "./components/DiscardModal";
import Logs from "./components/Logs";

import {
  GAME_EVENTS,
  EVENT_STEPS,
  GAME_RULES,
  type EventStep,
} from "@/constants/game";

import { handleApiError } from "@/utils/errorHandler";

export const DRAFT_SIZE = GAME_RULES.DRAFT_SIZE;

export default function GameContainer() {
  const { player } = usePlayer();

  const { httpService } = useHttpService();

  const {
    match,
    secrets,
    players,
    cards,
    result,
    sets,
    logs,
    hasFinishedAction,
    playerFinishActionTurn,
    playerSelectsOneOfHisSecrets,
    notSoFastEvent,
    clearNotSoFastEvent,
    pendingResponse,
    clearPendingResponse,
  } = useGame();

  const {
    clearSelectedCards,
    discardCards,
    getRandomCard,
    handCards,
    isCardSelected,
    isHandFull,
    isSelectingCards,
    selectCard,
    hasDiscardedCards,
    hasTakenCards,
    replaceCard,
    selectedCards,
    setHasDiscardedCards,
    setHasTakenCards,
    takeCards,
  } = useHand();

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

  const [discardModal, setDiscardModal] = useState({
    isOpen: false,
    isEventDiscard: false,
  });

  const canSelectMeAsPlayer =
    currentEventCard?.name === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
    currentEventStep === EVENT_STEPS.SELECT_PLAYER &&
    selectedTargetPlayer === null;

  const {
    playSet,
    addDetectiveCardToSet,
    playStolenSet,
    setEvent,
    isSetEventButtonDisabled,
    isSetEventSelectSetButtonDisabled,
    setTargetSet,
    setTargeSetToDown,
    executeSetActionToTarget,
    executeFinishTurnSetEvent,
    isPlayerSelectableForSetEvent,
    isOtherPlayerSecretSelectableForSetEvent,
    isCurrPlayerSecretSelectableForSetEvent,
    isSetSelectableForSetEvent,
    setEventToggleDisableButtonPlaySet,
    setEventToggleDisableButtonSelectSet,
    getTargetSetEvent,
    clearSetEvent,
  } = useSetEvent();

  // -- Utilidades --
  const handlePendingResponseSelectCard = async (card: GameCard) => {
    if (
      !pendingResponse.isPending ||
      !pendingResponse.eventId ||
      !httpService ||
      !player ||
      !match
    ) {
      return;
    }

    try {
      await httpService.postCardTrade(
        match.id,
        player.id,
        pendingResponse.eventId,
        card.id,
      );

      toast.success("Waiting for the other player to select one.");
      clearPendingResponse();
    } catch (error) {
      handleApiError(error, "Error responding to the event");
    }
  };

  const handlePlayNotSoFast = async (card: GameCard) => {
    if (!notSoFastEvent.isActivate) return;
    if (card.name !== "NOT SO FAST") return;
    if (!httpService || !player || !match || !notSoFastEvent.eventId) {
      return;
    }
    try {
      // que recibe el ID de la acción que está desafiando.
      await httpService.postPlayNotSoFast(
        match.id,
        player.id,
        card.id,
        notSoFastEvent.eventId,
        notSoFastEvent.nsfCount,
      );

      // Si tiene éxito, limpiamos el estado de desafío
      clearNotSoFastEvent();
      clearSelectedCards();
      toast.success("¡NOT SO FAST played!");
    } catch (error) {
      console.error("Failed to play NOT SO FAST:", error);
      toast.error("Failed to play NOT SO FAST.");
    }
  };

  const handleCardDoubleClick = async (card: GameCard) => {
    if (notSoFastEvent.isActivate) {
      await handlePlayNotSoFast(card);
    } else if (pendingResponse.isPending) {
      await handlePendingResponseSelectCard(card);
    }
  };

  const handleClickSetEvent = () => {
    if (isInSocialDisgrace) {
      toast.error("You can't play set cards while in social disgrace.");

      return;
    }

    playSet(Object.values(selectedCards));
  };

  const handleSelectTargetEvent = (
    target: GamePlayer | GameSecret | MatchSet,
  ) => {
    // Eventos de cartas
    if (currentEventCard?.name === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE) {
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
      currentEventCard?.name === GAME_EVENTS.CARDS_OFF_THE_TABLE &&
      "avatar" in target
    ) {
      setSelectedTargetPlayer(target as GamePlayer);
      return;
    }

    if (
      currentEventCard?.name === GAME_EVENTS.CARD_TRADE &&
      currentEventStep === EVENT_STEPS.SELECT_PLAYER &&
      "avatar" in target
    ) {
      setSelectedTargetPlayer(target as GamePlayer);
      return;
    }

    if (
      currentEventCard?.name === GAME_EVENTS.ANOTHER_VICTIM &&
      "quin_play" in target
    ) {
      setSelectedTargetSet(target as MatchSet);
      return;
    }

    if (setEvent.isSelectingSet) setTargeSetToDown(target);

    if (setEvent.isInEvent) setTargetSet(target);
  };

  const handleSelectedPlayer = async () => {
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

    if (setEvent.isInEvent) {
      const ok = await executeSetActionToTarget();
      if (!ok) return;

      playerFinishActionTurn();
    } else if (canSelectMeAsPlayer) {
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

  const handleSelectedSecret = async () => {
    if (
      currentEventCard?.name === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
      currentEventStep === EVENT_STEPS.SELECT_SECRET
    ) {
      if (selectedTargetSecret) {
        // ¡Avanzamos al siguiente paso!
        setCurrentEventStep(EVENT_STEPS.SELECT_PLAYER);
        toast.info("Now select a player.");
      } else {
        toast.error("You must select a secret first.");
      }
      return; // Salir para no ejecutar la lógica de set event
    }

    if (setEvent.isInEvent) {
      const ok = await executeSetActionToTarget();
      if (!ok) return;

      playerFinishActionTurn();
    }
  };

  const isSelectablePlayer = (checkPlayer: GamePlayer) => {
    //* Validacion por eventos
    if (
      currentEventCard?.name === GAME_EVENTS.CARDS_OFF_THE_TABLE ||
      (currentEventCard?.name === GAME_EVENTS.CARD_TRADE &&
        currentEventStep === EVENT_STEPS.SELECT_PLAYER)
    ) {
      return checkPlayer.id !== player?.id;
    }

    if (
      currentEventCard?.name === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
      currentEventStep === EVENT_STEPS.SELECT_PLAYER
    ) {
      return true;
    }

    // Se deben de poner todos los posibles eventos validos
    if (setEvent.isInEvent) return isPlayerSelectableForSetEvent(checkPlayer);

    return false;
  };

  const isSelectableSecret = (secret: GameSecret) => {
    if (
      currentEventCard?.name === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
      currentEventStep === EVENT_STEPS.SELECT_SECRET
    ) {
      return secret.is_revealed;
    } else if (setEvent.isInEvent) {
      return isOtherPlayersSecretSelectable(secret);
    }

    return false;
  };

  const isOtherPlayersSecretSelectable = (secret: GameSecret) => {
    if (setEvent.isInEvent)
      return isOtherPlayerSecretSelectableForSetEvent(secret);

    return false;
  };

  const isCurrPlayersSecretSelectable = (secret: GameSecret) => {
    if (setEvent.isInEvent || playerSelectsOneOfHisSecrets.isCurrPlayer)
      return isCurrPlayerSecretSelectableForSetEvent(secret);

    if (
      currentEventCard?.name === "AND THEN THERE WAS ONE MORE" &&
      currentEventStep === "select_secret"
    ) {
      return secret.is_revealed;
    }

    return false;
  };

  const isTargetPlayerEvent = () => {
    if (notSoFastEvent.isActivate) return false;

    if (setEvent.isTargetPlayer) return true;
    // Other events
    if (
      currentEventCard?.name === GAME_EVENTS.CARDS_OFF_THE_TABLE ||
      (currentEventCard?.name === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
        currentEventStep === EVENT_STEPS.SELECT_PLAYER) ||
      (currentEventCard?.name === GAME_EVENTS.CARD_TRADE &&
        currentEventStep === EVENT_STEPS.SELECT_PLAYER)
    ) {
      return true;
    }
    return false;
  };

  const isTargetSecretEvent = () => {
    if (notSoFastEvent.isActivate) return false;

    if (setEvent.isTargetSecret || playerSelectsOneOfHisSecrets.isCurrPlayer)
      return true;
    // Other events
    if (
      currentEventCard?.name === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE &&
      currentEventStep === EVENT_STEPS.SELECT_SECRET
    ) {
      return true;
    }

    return false;
  };

  const isSelectableSet = (set: MatchSet) => {
    if (
      currentEventCard?.name === GAME_EVENTS.ANOTHER_VICTIM &&
      currentEventStep === EVENT_STEPS.SELECT_SET
    ) {
      // No puedes seleccionar tus propios sets
      if (set.player_id === player?.id) return false;

      // Aquí puedes añadir más lógica si es necesario (ej. no seleccionar sets de HARLEY QUIN)
      return true;
    } else if (
      !setEvent.isInEvent &&
      !setEvent.isValidSet &&
      setEvent.canDownTheCardToASet &&
      setEvent.cards.length === 1 &&
      setEvent.isSelectingSet
    ) {
      return isSetSelectableForSetEvent(set);
    }

    return false;
  };
  // -- Valores memoizados --

  const isPlayerTurn = useMemo(() => {
    if (!match || !player) return false;

    const matchPlayer = players.find((p) => p.id === player.id);

    if (!matchPlayer) return false;

    return match.current_player_order === matchPlayer.order;
  }, [match, player, players]);

  const canTakeCards = useMemo(() => {
    // El jugador puede tomar cartas si está en su turno.
    // y su mano no está llena.
    return !hasTakenCards && !isHandFull && isPlayerTurn;
  }, [hasTakenCards, isHandFull, isPlayerTurn]);

  const canDiscardCards = useMemo(() => {
    // El jugador puede descartar cartas si está en su turno.
    return !hasDiscardedCards && isPlayerTurn;
  }, [hasDiscardedCards, isPlayerTurn]);

  const playerSecrets = useMemo(() => {
    if (!player) return [];

    return secrets.filter((secret) => secret.player_id === player.id);
  }, [secrets, player]);

  const isInSocialDisgrace = useMemo(() => {
    return playerSecrets.every((secret) => secret.is_revealed);
  }, [playerSecrets]);

  const playerSets = useMemo(() => {
    if (!player) return [];

    return sets.filter((set) => set.player_id === player.id);
  }, [sets, player]);

  const cardsInDiscardPile = useMemo(() => {
    return cards
      .filter((card) => card.is_discarded)
      .sort((a, b) => {
        if (a.discarded_at && b.discarded_at) {
          return b.discarded_at < a.discarded_at ? -1 : 1;
        } else if (a.discarded_at) {
          return -1;
        } else return 1;
      });
  }, [cards]);

  const cardsInDraft = useMemo(() => {
    return cards
      .filter((card) => card.player_id === null && !card.is_discarded)
      .slice(0, DRAFT_SIZE);
  }, [cards]);

  const drawableCards = useMemo(() => {
    return cards.filter((card) => {
      // Una carta es tomable si no pertenece a ningún jugador
      // y no está descartada.
      return card.player_id === null && !card.is_discarded;
    });
  }, [cards]);

  const isPlayable = useMemo(() => {
    const selectedCardsArray = Object.values(selectedCards);
    if (selectedCardsArray.length !== 1) return false;
    const nameCard = selectedCardsArray[0].name;
    const permittedCards = [
      GAME_EVENTS.CARDS_OFF_THE_TABLE,
      GAME_EVENTS.ANOTHER_VICTIM,
      GAME_EVENTS.LOOK_INTO_THE_ASHES,
      GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE,
      GAME_EVENTS.DELAY_THE_MURDERER_ESCAPE,
      GAME_EVENTS.EARLY_TRAIN_TO_PADDINGTON,
      GAME_EVENTS.CARD_TRADE,
    ];
    if (hasDiscardedCards || hasFinishedAction || currentEventCard !== null)
      return false;

    if (nameCard === GAME_EVENTS.ANOTHER_VICTIM) {
      const hasOtherPlayerSets = sets.some(
        (set) => set.player_id !== player?.id,
      );
      if (!hasOtherPlayerSets) return false;
    }
    if (
      (nameCard === GAME_EVENTS.LOOK_INTO_THE_ASHES ||
        nameCard === GAME_EVENTS.DELAY_THE_MURDERER_ESCAPE) &&
      cardsInDiscardPile.length === 0
    )
      return false;
    if (nameCard === GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE) {
      const hasRevealedSecret = secrets.some((secret) => secret.is_revealed);
      if (!hasRevealedSecret) return false;
    }
    return permittedCards.includes(nameCard);
  }, [
    selectedCards,
    hasDiscardedCards,
    currentEventCard,
    cardsInDiscardPile.length,
    secrets,
    sets,
    player,
    hasFinishedAction,
  ]);

  const handleSelectSet = async () => {
    if (isInSocialDisgrace) {
      toast.error("You can't select a set as you're in social disgrace.");

      return;
    }

    if (
      currentEventCard?.name === GAME_EVENTS.ANOTHER_VICTIM &&
      currentEventStep === EVENT_STEPS.SELECT_SET
    ) {
      // Comprobamos si el objetivo está seleccionado (handleEndEvent lo necesita)
      if (selectedTargetSet) {
        await handleEndEvent();
      } else {
        toast.error("You must select a set first.");
      }
    }
  };

  const handleAddDetectiveCardToSet = () => {
    if (isInSocialDisgrace) {
      toast.error("You can't add cards to sets as you're in social disgrace.");

      return;
    }

    const card = Object.values(selectedCards).at(0);

    if (
      !setEvent.isInEvent &&
      !setEvent.isValidSet &&
      setEvent.canDownTheCardToASet &&
      card !== undefined &&
      !setEvent.isSelectingSet
    ) {
      addDetectiveCardToSet(card);
    }
  };

  // -- Utilidades --

  const getTakeErrorMessage = () => {
    if (!isPlayerTurn) {
      return "You can't take cards right now.";
    }
    if (hasTakenCards) {
      return "You have already taken cards this turn.";
    }

    if (isHandFull) {
      return "Your hand is full.";
    }

    return "There was an error taking cards.";
  };

  const getDiscardErrorMessage = () => {
    if (hasDiscardedCards) {
      return "You have already discarded cards this turn.";
    }

    return "You can't discard cards right now.";
  };

  // -- Manejadores --

  const handleClickDiscardPile = () => {
    if (setEvent.isInEvent) return;

    if (cardsInDiscardPile.length === 0) return;

    setDiscardModal((prev) => ({ ...prev, isOpen: true }));
  };

  const onCloseDiscardModal = () => {
    if (discardModal.isOpen && discardModal.isEventDiscard) return;

    setDiscardModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleEventDiscard = () => {
    // Se realiza en otro ticket
    setDiscardModal({
      isOpen: true,
      isEventDiscard: true,
    });
  };

  // -- Llamadas a la API --

  const handleClickDraftCard = async (card: GameCard) => {
    if (!canTakeCards) {
      toast.error(getTakeErrorMessage());

      return;
    }

    try {
      await takeCards([card]);

      const emptySlots = handCards.filter((c) => c === null).length;

      if (
        // Si tomar una carta del draft llena la mano,
        // marcamos que el jugador ha tomado cartas.
        // Esto es relevante para permitirle
        // tomar cartas del draft sin impedir tomar de
        // la pila regular.
        emptySlots === 1 ||
        // Tomar una carta del draft
        // estando en desgracia social cuenta al lìmite
        // de tomar solo una carta por turno.
        isInSocialDisgrace
      ) {
        setHasTakenCards(true);
      }
    } catch (error) {
      handleApiError(error, "Failed to take card from draft");
    }
  };

  const handleClickDrawPile = async () => {
    if (!canTakeCards) {
      toast.error(getTakeErrorMessage());

      return;
    }

    const emptyHandPositions = handCards
      .map((card, index) => (card === null ? index : -1))
      .filter((index) => index !== -1);

    if (emptyHandPositions.length === 0) return;

    // En desgracia social, tomamos exactamente una carta.
    const cardsToTake = isInSocialDisgrace
      ? 1
      : Math.min(emptyHandPositions.length, drawableCards.length);

    // Tenemos que tomar los índices por detrás
    // de las cartas del draft (las que están en la pila).
    const cardsTaken = drawableCards.slice(
      DRAFT_SIZE,
      DRAFT_SIZE + cardsToTake,
    );

    try {
      await takeCards(cardsTaken);

      setHasTakenCards(true);
    } catch (error) {
      handleApiError(error, "Failed to take cards from draw pile");
    }
  };

  const handleSelectCard = (card: GameCard) => {
    if (discardModal.isOpen && !discardModal.isEventDiscard) return;

    if (setEvent.isInEvent || setEvent.isSelectingSet) return;

    selectCard(card);
  };

  const handleDiscardSelectedCards = async () => {
    if (!httpService || !player || !match) return;

    if (!canDiscardCards) {
      toast.error(getDiscardErrorMessage());

      return;
    }

    const cardIds = Object.keys(selectedCards);

    if (cardIds.length === 0) {
      toast.error("No cards selected to discard.");

      return;
    }

    if (isInSocialDisgrace && cardIds.length > 1) {
      toast.error("You can only discard one card while in social disgrace.");

      return;
    }

    try {
      await discardCards(Object.values(selectedCards));

      setHasDiscardedCards(true);

      clearSelectedCards();
      playerFinishActionTurn();
    } catch (error) {
      handleApiError(error, "Failed to discard selected cards");
      throw error;
    }
  };

  const mandatoryDiscard = async () => {
    if (!httpService || !player || !match) return;

    if (drawableCards.length <= DRAFT_SIZE) {
      toast.error("No cards available to take for mandatory discard");
      return;
    }

    try {
      const firstTakeableCard = drawableCards[DRAFT_SIZE];

      if (!firstTakeableCard) {
        toast.error("No cards available to take for mandatory discard.");
        console.error("No cards available to take from the draw pile.");
        return;
      }

      const randomDiscardableCard = getRandomCard();

      if (!randomDiscardableCard) {
        toast.error("No cards available to discard for mandatory discard.");
        console.error("No cards available to discard from the hand.");
        return;
      }

      await discardCards([randomDiscardableCard]);

      await takeCards([firstTakeableCard]);

      replaceCard(randomDiscardableCard, firstTakeableCard);

      setHasTakenCards(true);
      setHasDiscardedCards(true);
    } catch (error) {
      handleApiError(error, "Failed to perform mandatory discard");
      // Lanzamos el error de nuevo para que no pueda pasar el turno
      // si el descarte falló.
      throw error;
    }
  };

  const handleFinishTurn = async () => {
    if (!httpService || !player || !match) return;

    if (handCards.includes(null)) {
      toast.error("You must have a full hand to finish your turn.");

      return;
    }

    if (!isPlayerTurn) {
      toast.error("It's not your turn.");

      return;
    }

    try {
      // Si el jugador no ha descartado cartas o jugado un evento, se fuerza
      // el descarte obligatorio de una carta.
      if (
        !(hasDiscardedCards || hasFinishedAction) &&
        currentEventCard === null
      ) {
        await mandatoryDiscard();
      }

      if (setEvent.isStolenSecret) await executeFinishTurnSetEvent();

      await httpService.putPassTurn(match.id);

      // Reseteamos los estados relacionados con el descarte
      setHasTakenCards(false);
      setHasDiscardedCards(false);
      setCurrentEventStep(null);

      clearSelectedCards();
    } catch (error) {
      handleApiError(error, "Failed to finish turn");
    }

    clearSetEvent();
  };

  const handlePlayEvent = async () => {
    if (isInSocialDisgrace) {
      toast.error("You can't play event cards while in social disgrace.");

      return;
    }

    // OBTENER LA CARTA SELECCIONADA
    const selectedCardsArray = Object.values(selectedCards);

    if (selectedCardsArray.length !== 1) {
      console.warn("handlePlayEvent llamado sin una única carta válida.");
      return;
    }

    const cardEvent = selectedCardsArray[0];

    // 1. Lógica Local: Chequeamos el tipo de evento, para mostrarle al jugador que hacer
    const nameEvent = cardEvent.name;

    switch (nameEvent) {
      case GAME_EVENTS.DELAY_THE_MURDERER_ESCAPE: {
        setCurrentEventCard(cardEvent);
        handleEndEvent(cardEvent);
        break;
      }

      case GAME_EVENTS.LOOK_INTO_THE_ASHES: {
        setCurrentEventCard(cardEvent);
        handleEventDiscard();
        break;
      }

      case GAME_EVENTS.CARDS_OFF_THE_TABLE: {
        setCurrentEventCard(cardEvent);
        setCurrentEventStep(EVENT_STEPS.SELECT_PLAYER);
        break;
      }

      case GAME_EVENTS.AND_THEN_THERE_WAS_ONE_MORE: {
        setCurrentEventCard(cardEvent);
        setCurrentEventStep(EVENT_STEPS.SELECT_SECRET);
        break;
      }

      case GAME_EVENTS.EARLY_TRAIN_TO_PADDINGTON: {
        setCurrentEventCard(cardEvent);
        handleEndEvent(cardEvent);
        break;
      }

      case GAME_EVENTS.ANOTHER_VICTIM: {
        setCurrentEventCard(cardEvent);
        setCurrentEventStep(EVENT_STEPS.SELECT_SET);
        break;
      }

      case GAME_EVENTS.CARD_TRADE: {
        setCurrentEventCard(cardEvent);
        setCurrentEventStep(EVENT_STEPS.SELECT_PLAYER);
        break;
      }
    }
  };

  const handleEndEvent = async (eventCard?: GameCard) => {
    const cardToUse = currentEventCard || eventCard;
    if (!httpService || !player || !match || !cardToUse) {
      console.error("Faltan datos necesarios para completar el evento");
      return;
    }

    const nameEvent = cardToUse.name;
    let eventPayload: EventPayload | undefined;

    switch (nameEvent) {
      case GAME_EVENTS.LOOK_INTO_THE_ASHES: {
        // Validamos que haya una carta seleccionada del descarte
        const selectedDiscardedCardsArray = Object.values(selectedCards);

        if (selectedDiscardedCardsArray.length !== 2) {
          console.warn("Debe seleccionar exactamente una carta del descarte");
          return;
        }

        const selectedDiscardedCard = selectedDiscardedCardsArray[1];

        // Construimos el payload para el evento
        eventPayload = {
          target_card_id: selectedDiscardedCard.id,
        } as LookIntoTheAshesEventPayload;

        // Cerramos el modal
        setDiscardModal({
          isOpen: false,
          isEventDiscard: false,
        });

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

  // -- Effects --
  // Al seleccionar cartas de mano, se revisa si son un set de detectives validos
  useEffect(() => {
    if (discardModal.isOpen || discardModal.isEventDiscard) return;

    setEventToggleDisableButtonPlaySet(Object.values(selectedCards));
    setEventToggleDisableButtonSelectSet(Object.values(selectedCards));
  }, [
    discardModal,
    selectedCards,
    setEventToggleDisableButtonPlaySet,
    setEventToggleDisableButtonSelectSet,
  ]);

  const isSelectPlayerButtonEnabled = isTargetPlayerEvent();

  const isSelectSecretButtonEnabled = isTargetSecretEvent();

  return (
    <>
      <div
        data-testid="game-container"
        className="h-screen overflow-y-hidden relative bg-[url('/src/assets/background.png')] bg-cover bg-center"
      >
        <Logs logs={logs} />

        {/* Formamos una grilla de 3x3 para posicionar los elementos de la partida. */}
        <div className="h-full w-full grid grid-cols-3 grid-rows-3">
          {/* Las primeras 6 casillas ubican a los jugadores, sus elementos y las pilas del juego. */}
          <Table
            draft={
              <Draft
                cards={cardsInDraft}
                onClick={handleClickDraftCard}
                isDisabled={!canTakeCards}
              />
            }
            drawPile={
              <DrawPile
                onClick={handleClickDrawPile}
                cardCount={drawableCards.length}
              />
            }
            discardPile={
              <DiscardPile
                onClick={handleClickDiscardPile}
                topCard={cardsInDiscardPile[0]}
              />
            }
            onSelectTargetEvent={handleSelectTargetEvent}
            isSelectablePlayer={isSelectablePlayer}
            isSelectableSecret={isSelectableSecret}
            isSelectableSet={isSelectableSet}
            isEvent={
              setEvent.isInEvent ||
              currentEventCard !== null ||
              setEvent.isSelectingSet
            }
            isTargetPlayer={isTargetPlayerEvent()}
            isTargetSecret={isTargetSecretEvent()}
            isTargetSet={
              (currentEventCard?.name === GAME_EVENTS.ANOTHER_VICTIM &&
                currentEventStep === EVENT_STEPS.SELECT_SET) ||
              setEvent.isSelectingSet
            }
            target={
              getTargetSetEvent() ||
              selectedTargetPlayer ||
              selectedTargetSecret ||
              selectedTargetSet ||
              setEvent.set
            }
          />

          <div className="col-start-1 col-span-3 row-start-3 w-full flex items-center justify-around">
            <div className="flex flex-col gap-y-3">
              <p className="text-white">
                {isInSocialDisgrace ? "DESGRACIA SOCIAL" : "SIN DESGRACIA"}
              </p>
              <Secrets
                secrets={playerSecrets}
                isSelectableSecret={isCurrPlayersSecretSelectable}
                isTargetSecret={isTargetSecretEvent()}
                onSelectTargetEvent={handleSelectTargetEvent}
                target={getTargetSetEvent() || selectedTargetSecret}
              />

              <Sets
                sets={playerSets}
                onSelectTargetEvent={handleSelectTargetEvent}
                isSelectableSet={isSelectableSet}
                isTargetSet={setEvent.isSelectingSet}
                target={setEvent.set}
              />
            </div>

            <Hand
              cards={handCards}
              onSelect={handleSelectCard}
              isSelected={isCardSelected}
              isSelecting={isSelectingCards}
              isDisabled={!isPlayerTurn}
              isActivateNSF={notSoFastEvent.isActivate}
              onDoubleClickCard={handleCardDoubleClick}
              isPendingResponse={pendingResponse.isPending}
            />

            <HandActions
              onFinish={handleFinishTurn}
              onDiscard={handleDiscardSelectedCards}
              onPlayEvent={handlePlayEvent}
              onPlaySet={handleClickSetEvent}
              onSelectPlayer={handleSelectedPlayer}
              onSelectSecret={handleSelectedSecret}
              onSelectSet={handleSelectSet}
              canSelectMeAsPlayer={canSelectMeAsPlayer}
              onAddDetectiveCardToSet={handleAddDetectiveCardToSet}
              isDisabled={
                !isPlayerTurn ||
                notSoFastEvent.isActivate ||
                pendingResponse.isPending
              }
              isDisabledEvent={!isPlayable}
              isSelectionSetEvent={
                currentEventCard?.name === GAME_EVENTS.ANOTHER_VICTIM &&
                currentEventStep === EVENT_STEPS.SELECT_SET
              }
              isAddingCardToSet={setEvent.isSelectingSet}
              isSetButtonDisabled={isSetEventButtonDisabled}
              isSetEventSelectSetButtonDisabled={
                isSetEventSelectSetButtonDisabled
              }
              isSelectionPlayerEvent={isSelectPlayerButtonEnabled}
              isSelectionSecretEvent={isSelectSecretButtonEnabled}
            />
          </div>
        </div>
      </div>

      <DiscardModal
        isOpen={discardModal.isOpen}
        onClose={onCloseDiscardModal}
        onSelect={selectCard}
        isSelected={isCardSelected}
        onEndEvent={handleEndEvent}
        isEventDiscard={discardModal.isEventDiscard}
        discardedCards={cardsInDiscardPile}
      />

      <Result result={result} />
    </>
  );
}
