import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useBasicGame } from "@/contexts/BasicGameContext";
import { useLogicGame } from "@/contexts/LogicGameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";
import { useHand } from "./hooks/useHand";

import type { GameCard } from "@/types/card";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";

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

import { GAME_EVENTS, EVENT_STEPS, GAME_RULES } from "@/constants/game";

import { handleApiError } from "@/utils/errorHandler";

export const DRAFT_SIZE = GAME_RULES.DRAFT_SIZE;

export default function GameContainer() {
  const { player } = usePlayer();

  const { httpService } = useHttpService();

  const {
    match,
    secrets,
    result,
    sets,

    hasFinishedAction,
    playerFinishActionTurn,

    notSoFastEvent,
    clearNotSoFastEvent,
    pendingResponse,
    clearPendingResponse,
  } = useBasicGame();

  const {
    isPlayerTurn,

    cardsInDiscardPile,
    cardsInDraft,
    drawableCards,

    playerSets,
    playerSecrets,
    isInSocialDisgrace,

    hookSetEvent: {
      setEvent,
      clearSetEvent,

      playSet,
      addDetectiveCardToSet,
      playStolenSet,

      executeSetActionToTarget,
      executeFinishTurnSetEvent,

      setTargetSet,
      setTargeSetToDown,

      setEventToggleDisableButtonPlaySet,
      setEventToggleDisableButtonSelectSet,

      isSetEventPlaySetButtonDisabled,
      isSetEventSelectSetButtonDisabled,
    },

    hookCardEvent: {
      currentEventCard,
      selectedTargetSet,
      currentEventStep,
      canSelectMeAsPlayer,

      playEvent,
      setTargetCardEvent,
      executeCardEventActionToTarget,
      executeCardEventActionToPlayerTarget,
      cardEventSelectSecret,
      clearCardEventStep,

      ...cardEvent
    },

    getTarget,
  } = useLogicGame();

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

  const [discardModal, setDiscardModal] = useState({
    isOpen: false,
    isEventDiscard: false,
  });

  // -- Utilidades --
  const handleSelectDirection = (direction: "LEFT" | "RIGHT") => {
    handleEndEvent(undefined, direction);
  };

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
    if (pendingResponse.eventType === GAME_EVENTS.CARD_TRADE) {
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
    } else if (pendingResponse.eventType === GAME_EVENTS.DEAD_CARD_FOLLY) {
      try {
        await httpService.postDeadCardFolly(
          match.id,
          player.id,
          pendingResponse.eventId,
          card.id,
        );

        toast.success("Waiting for the others players to select one.");
        clearPendingResponse();
      } catch (error) {
        handleApiError(error, "Error responding to the event");
      }
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
    if (cardEvent.isInEvent || pendingResponse.isPending)
      setTargetCardEvent(target);

    if (setEvent.isSelectingSet) setTargeSetToDown(target);

    if (setEvent.isInEvent) setTargetSet(target);
  };

  const handleSelectedPlayer = async () => {
    if (setEvent.isInEvent) {
      const ok = await executeSetActionToTarget();
      if (!ok) return;

      playerFinishActionTurn();
      return;
    }

    await executeCardEventActionToPlayerTarget(
      handleEndEvent,
      clearSelectedCards,
    );
  };

  const handleSelectedSecret = async () => {
    if (setEvent.isInEvent) {
      const ok = await executeSetActionToTarget();
      if (!ok) return;

      playerFinishActionTurn();
      return;
    }

    cardEventSelectSecret();
  };

  // -- Valores memoizados --

  const canTakeCards = useMemo(() => {
    // El jugador puede tomar cartas si está en su turno.
    // y su mano no está llena.
    return !hasTakenCards && !isHandFull && isPlayerTurn;
  }, [hasTakenCards, isHandFull, isPlayerTurn]);

  const canDiscardCards = useMemo(() => {
    // El jugador puede descartar cartas si está en su turno.
    return !hasDiscardedCards && isPlayerTurn;
  }, [hasDiscardedCards, isPlayerTurn]);

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
      GAME_EVENTS.POINT_YOUR_SUSPICIONS,
      GAME_EVENTS.DEAD_CARD_FOLLY,
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

  const clearDiscardModal = () => {
    setDiscardModal({ isOpen: false, isEventDiscard: false });
  };

  const handleEventDiscard = () => {
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

      clearCardEventStep();
      clearSelectedCards();
      clearSetEvent();
    } catch (error) {
      handleApiError(error, "Failed to finish turn");
    }
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

    playEvent(selectedCardsArray, handleEventDiscard, handleEndEvent);
  };

  const handleEndEvent = async (
    eventCard?: GameCard,
    direction?: "LEFT" | "RIGHT",
  ) => {
    const cardToUse = currentEventCard || eventCard;
    if (!cardToUse) {
      console.error("Faltan datos necesarios para completar el evento");
      return;
    }

    const selectedCardsArr = Object.values(selectedCards);

    await executeCardEventActionToTarget(
      cardToUse,
      selectedCardsArr,
      cardsInDiscardPile,
      drawableCards,
      clearDiscardModal,
      clearSelectedCards,
      playStolenSet,
      direction,
    );
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

  const isSelectDirectionEvent =
    currentEventCard?.name === GAME_EVENTS.DEAD_CARD_FOLLY &&
    currentEventStep === EVENT_STEPS.SELECT_DIRECTION;

  const target = useMemo(() => getTarget(), [getTarget]);

  return (
    <>
      <div
        data-testid="game-container"
        className="h-screen overflow-y-hidden relative bg-[url('/src/assets/background.png')] bg-cover bg-center"
      >
        <Logs />

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
          />

          <div className="col-start-1 col-span-3 row-start-3 w-full flex items-center justify-around">
            <div className="flex flex-col items-center gap-y-3">
              {isInSocialDisgrace && (
                <p className="text-center text-white">
                  You are in Social Disgrace!
                </p>
              )}

              <Secrets
                secrets={playerSecrets}
                onSelectTargetEvent={handleSelectTargetEvent}
                target={target}
              />

              <Sets
                sets={playerSets}
                onSelectTargetEvent={handleSelectTargetEvent}
                target={target}
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
              isPendingResponse={
                pendingResponse.isPending &&
                (pendingResponse.eventType === GAME_EVENTS.CARD_TRADE ||
                  pendingResponse.eventType === GAME_EVENTS.DEAD_CARD_FOLLY)
              }
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
              isDisabled={
                !isPlayerTurn ||
                (notSoFastEvent.isActivate && !isSelectDirectionEvent)
              }
              onAddDetectiveCardToSet={handleAddDetectiveCardToSet}
              isDisabledEvent={!isPlayable}
              isSelectionSetEvent={
                currentEventCard?.name === GAME_EVENTS.ANOTHER_VICTIM &&
                currentEventStep === EVENT_STEPS.SELECT_SET
              }
              isAddingCardToSet={setEvent.isSelectingSet}
              isSetButtonDisabled={isSetEventPlaySetButtonDisabled}
              isSetEventSelectSetButtonDisabled={
                isSetEventSelectSetButtonDisabled
              }
              isSelectDirectionEvent={isSelectDirectionEvent}
              onSelectDirection={handleSelectDirection}
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
