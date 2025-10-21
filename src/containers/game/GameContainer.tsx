import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { GameCard } from "@/types/card";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";
import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import type {
  RegularAndDiscardEventPayload,
  LookIntoTheAshesEventPayload,
  AndThenThereWasOneMoreEventPayload,
  CardsOffTheTableEventPayload,
  AnotherVictimEventPayload,
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

import { useHand } from "./hooks/useHand";
import { useSetEvent } from "./hooks/useSetEvent";

type EventStep = "select_secret" | "select_player" | "select_set" | null;

export const DRAFT_SIZE = 3;

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
    isPlayerFinishAction,
    playerFinishActionTurn,
    playerSelectsOneOfHisSecrets,
  } = useGame();

  const {
    clearSelectedCards,
    discardCards,
    getRandomCard,
    removeCard,
    addCard,
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
    currentEventCard?.name === "AND THEN THERE WAS ONE MORE" &&
    currentEventStep === "select_player" &&
    selectedTargetPlayer === null;

  const {
    playSet,
    isSetEvent,
    isTargetPlayerSetEvent,
    isTargetSecretSetEvent,
    isSetEventButtonDisabled,
    isStolenSecretSetEvent,
    setTargetSet,
    executeSetActionToTarget,
    executeFinishTurnSetEvent,
    isPlayerSelectableForSetEvent,
    isOtherPlayerSecretSelectableForSetEvent,
    isCurrPlayerSecretSelectableForSetEvent,
    setEventToggleDisableButtonPlaySet,
    getTargetSetEvent,
    getSetCards,
    clearSetEvent,
  } = useSetEvent();

  const isEndEventDisabled = useMemo(() => {
    if (!currentEventCard) return true;

    switch (currentEventCard.name) {
      case "CARDS OFF THE TABLE":
        return selectedTargetPlayer === null;

      case "LOOK INTO THE ASHES":
        // Deshabilitar el botón porque se usa el botón del modal
        return true;

      case "DELAY THE MURDERER ESCAPE":
        return true;

      case "EARLY TRAIN TO PADDINGTON":
        return true;

      case "AND THEN THERE WAS ONE MORE":
        return selectedTargetSecret === null || selectedTargetPlayer === null;

      case "ANOTHER VICTIM":
        return selectedTargetSet === null;

      default:
        return false;
    }
  }, [
    currentEventCard,
    selectedTargetPlayer,
    selectedTargetSecret,
    selectedTargetSet,
  ]);

  // -- Utilidades --
  const handleClickSetEvent = () => {
    playSet(Object.values(selectedCards));
  };

  const handleSelectTargetEvent = (
    target: GamePlayer | GameSecret | MatchSet,
  ) => {
    // Eventos de cartas
    if (currentEventCard?.name === "AND THEN THERE WAS ONE MORE") {
      if (currentEventStep === "select_secret" && "secret_id" in target) {
        setSelectedTargetSecret(target as GameSecret);
        setCurrentEventStep("select_player");
        return;
      } else if (currentEventStep === "select_player" && "avatar" in target) {
        setSelectedTargetPlayer(target as GamePlayer);
        return;
      }
    }

    if (
      currentEventCard?.name === "CARDS OFF THE TABLE" &&
      "avatar" in target
    ) {
      setSelectedTargetPlayer(target as GamePlayer);
      return;
    }

    if (currentEventCard?.name === "ANOTHER VICTIM" && "quin_play" in target) {
      setSelectedTargetSet(target as MatchSet);
      return;
    }
    if (isSetEvent) setTargetSet(target as GamePlayer | GameSecret);
  };

  const handleSelectedPlayer = async () => {
    if (isSetEvent) {
      const ok = await executeSetActionToTarget();
      if (!ok) return;

      const setCards = getSetCards();
      for (const card of setCards) removeCard(card);
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

        removeCard(cardToUse);
        clearSelectedCards();
      } catch (error) {
        console.error("Error al ejecutar el evento", error);
      }
    }
  };

  const handleSelectedSecret = async () => {
    if (isSetEvent) {
      const ok = await executeSetActionToTarget();
      if (!ok) return;

      const setCards = getSetCards();
      for (const card of setCards) removeCard(card);
      playerFinishActionTurn();
    }
  };

  const isSelectablePlayer = (checkPlayer: GamePlayer) => {
    //* Validacion por eventos
    if (currentEventCard?.name === "CARDS OFF THE TABLE") {
      return checkPlayer.id !== player?.id;
    }

    if (
      currentEventCard?.name === "AND THEN THERE WAS ONE MORE" &&
      currentEventStep === "select_player"
    ) {
      return true;
    }

    // Se deben de poner todos los posibles eventos validos
    if (isSetEvent) return isPlayerSelectableForSetEvent(checkPlayer);

    return false;
  };

  const isSelectableSecret = (secret: GameSecret) => {
    if (
      currentEventCard?.name === "AND THEN THERE WAS ONE MORE" &&
      currentEventStep === "select_secret"
    ) {
      return secret.is_revealed;
    } else if (isSetEvent) {
      return isOtherPlayersSecretSelectable(secret);
    }

    return false;
  };

  const isOtherPlayersSecretSelectable = (secret: GameSecret) => {
    if (isSetEvent) return isOtherPlayerSecretSelectableForSetEvent(secret);

    return false;
  };

  const isCurrPlayersSecretSelectable = (secret: GameSecret) => {
    if (isSetEvent || playerSelectsOneOfHisSecrets.isCurrPlayer)
      return isCurrPlayerSecretSelectableForSetEvent(secret);

    return false;
  };

  const isTargetPlayerEvent = () => {
    if (isTargetPlayerSetEvent) return true;
    // Other events
    if (
      currentEventCard?.name === "CARDS OFF THE TABLE" ||
      (currentEventCard?.name === "AND THEN THERE WAS ONE MORE" &&
        currentEventStep === "select_player")
    ) {
      return true;
    }
    return false;
  };

  const isTargetSecretEvent = () => {
    if (isTargetSecretSetEvent || playerSelectsOneOfHisSecrets.isCurrPlayer)
      return true;
    // Other events
    if (
      currentEventCard?.name === "AND THEN THERE WAS ONE MORE" &&
      currentEventStep === "select_secret"
    ) {
      return true;
    }

    return false;
  };

  const isSelectableSet = (set: MatchSet) => {
    if (
      currentEventCard?.name === "ANOTHER VICTIM" &&
      currentEventStep === "select_set"
    ) {
      // No puedes seleccionar tus propios sets
      if (set.player_id === player?.id) return false;

      // Aquí puedes añadir más lógica si es necesario (ej. no seleccionar sets de HARLEY QUIN)
      return true;
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
      "CARDS OFF THE TABLE",
      "ANOTHER VICTIM",
      "LOOK INTO THE ASHES",
      "AND THEN THERE WAS ONE MORE",
      "DELAY THE MURDERER ESCAPE",
      "EARLY TRAIN TO PADDINGTON",
    ];
    if (hasDiscardedCards) return false;
    if (isPlayerFinishAction == true) return false;
    if (currentEventCard !== null) return false;
    if (nameCard === "ANOTHER VICTIM") {
      const hasOtherPlayerSets = sets.some(
        (set) => set.player_id !== player?.id,
      );
      if (!hasOtherPlayerSets) return false;
    }
    if (
      (nameCard === "LOOK INTO THE ASHES" ||
        nameCard === "DELAY THE MURDERER ESCAPE") &&
      cardsInDiscardPile.length === 0
    )
      return false;
    if (nameCard === "AND THEN THERE WAS ONE MORE") {
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
    isPlayerFinishAction,
  ]);

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
    if (isSetEvent) return;

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

      // Si tomar una carta del draft llena la mano,
      // marcamos que el jugador ha tomado cartas.
      // Esto es relevante para permitirle
      // tomar cartas del draft sin impedir tomar de
      // la pila regular.
      if (emptySlots === 1) {
        setHasTakenCards(true);
      }
    } catch (error) {
      console.error("Failed to take card from draft:", error);
      toast.error("Failed to take card from draft.");
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

    // Tenemos que tomar los índices por detrás
    // de las cartas del draft (las que están en la pila).
    const cardsTaken = drawableCards.slice(
      DRAFT_SIZE,
      DRAFT_SIZE + Math.min(emptyHandPositions.length, drawableCards.length),
    );

    try {
      await takeCards(cardsTaken);

      setHasTakenCards(true);
    } catch (error) {
      console.error("Failed to take cards from draw pile:", error);

      toast.error("Failed to take cards from draw pile.");
    }
  };

  const handleSelectCard = (card: GameCard) => {
    if (discardModal.isOpen && !discardModal.isEventDiscard) return;

    if (isSetEvent) return;

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

    try {
      await discardCards(Object.values(selectedCards));

      setHasDiscardedCards(true);

      clearSelectedCards();
      playerFinishActionTurn();
    } catch (error) {
      console.error("Failed to discard selected cards:", error);

      toast.error("Failed to discard selected cards.");

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
      console.error("Failed to perform mandatory discard:", error);

      toast.error("Failed to perform mandatory discard.");

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
        !(hasDiscardedCards || isPlayerFinishAction) &&
        currentEventCard === null
      ) {
        await mandatoryDiscard();
      }

      if (isStolenSecretSetEvent) await executeFinishTurnSetEvent();

      await httpService.putPassTurn(match.id);

      // Reseteamos los estados relacionados con el descarte
      setHasTakenCards(false);
      setHasDiscardedCards(false);
      setCurrentEventCard(null);
      setCurrentEventStep(null);

      clearSelectedCards();
    } catch (error) {
      console.error("Failed to finish turn:", error);
    }

    clearSetEvent();
  };

  const handlePlayEvent = async () => {
    // OBTENER LA CARTA SELECCIONADA
    const selectedCardsArray = Object.values(selectedCards);

    if (selectedCardsArray.length !== 1) {
      console.warn("handlePlayEvent llamado sin una única carta válida.");
      return;
    }

    const cardEvent = selectedCardsArray[0];

    // 1. Lógica Local: Chequeamos el tipo de evento, para mostrarle al jugador que hacer
    const nameEvent = cardEvent.name;
    console.log(`Se jugará la carta: ${nameEvent}`);

    switch (nameEvent) {
      case "DELAY THE MURDERER ESCAPE": {
        setCurrentEventCard(cardEvent);
        handleEndEvent(cardEvent);
        break;
      }

      case "LOOK INTO THE ASHES": {
        setCurrentEventCard(cardEvent);
        handleEventDiscard();
        break;
      }

      case "CARDS OFF THE TABLE": {
        setCurrentEventCard(cardEvent);
        setCurrentEventStep("select_player");
        break;
      }

      case "AND THEN THERE WAS ONE MORE": {
        setCurrentEventCard(cardEvent);
        setCurrentEventStep("select_secret");
        break;
      }

      case "EARLY TRAIN TO PADDINGTON": {
        setCurrentEventCard(cardEvent);
        handleEndEvent(cardEvent);
        break;
      }

      case "ANOTHER VICTIM": {
        setCurrentEventCard(cardEvent);
        setCurrentEventStep("select_set");
        break;
      }
    }
  };

  const handleEndEvent = async (eventCard?: GameCard) => {
    console.log(currentEventCard);
    const cardToUse = currentEventCard || eventCard;
    if (!httpService || !player || !match || !cardToUse) {
      console.error("Faltan datos necesarios para completar el evento");
      return;
    }

    const nameEvent = cardToUse.name;
    let eventPayload: EventPayload | undefined;

    switch (nameEvent) {
      case "LOOK INTO THE ASHES": {
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

      case "DELAY THE MURDERER ESCAPE": {
        const idsInDiscardPile = cardsInDiscardPile.map((card) => card.id);
        const latestFive = idsInDiscardPile.slice(0, 5);

        eventPayload = {
          cards_ids: latestFive,
        } as RegularAndDiscardEventPayload;
        break;
      }

      case "CARDS OFF THE TABLE": {
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

      case "AND THEN THERE WAS ONE MORE": {
        if (!selectedTargetPlayer || !selectedTargetSecret) {
          console.warn("Debe seleccionar un jugador objetivo y un secreto");
          return;
        }
        console.log(selectedTargetPlayer, selectedTargetSecret);
        eventPayload = {
          target_secret_id: selectedTargetSecret.id,
          target_player_id: selectedTargetPlayer.id,
        } as AndThenThereWasOneMoreEventPayload;

        setSelectedTargetPlayer(null);
        setSelectedTargetSecret(null);
        setCurrentEventStep(null);
        break;
      }

      case "EARLY TRAIN TO PADDINGTON": {
        // Saltar las primeras 3 cartas y tomar las siguientes 6
        const cardsToReveal = drawableCards.slice(3, 9);

        // Construir el payload con los IDs de las 6 cartas
        eventPayload = {
          cards_ids: cardsToReveal.map((card) => card.id),
        } as RegularAndDiscardEventPayload;
        break;
      }

      case "ANOTHER VICTIM": {
        if (!selectedTargetSet) {
          console.warn("Set no seleccionado");
        }
        eventPayload = {
          target_set_id: selectedTargetSet?.id,
        } as AnotherVictimEventPayload;
        setSelectedTargetSet(null);
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

      removeCard(cardToUse);
      if (currentEventCard?.name === "LOOK INTO THE ASHES") {
        const selectedCardsArray = Object.values(selectedCards);
        addCard(selectedCardsArray[1]);
      }
      clearSelectedCards();
      playerFinishActionTurn();

      console.log("Evento completado exitosamente");
    } catch (error) {
      console.error("Error al ejecutar el evento", error);
    }
  };

  // -- Effects --
  // Al seleccionar cartas de mano, se revisa si son un set de detectives validos
  useEffect(() => {
    if (discardModal.isOpen || discardModal.isEventDiscard) return;

    setEventToggleDisableButtonPlaySet(Object.values(selectedCards));
  }, [discardModal, selectedCards, setEventToggleDisableButtonPlaySet]);

  return (
    <>
      <div
        data-testid="game-container"
        className="h-screen overflow-y-hidden relative bg-[url('/src/assets/background.png')] bg-cover bg-center"
      >
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
            isEvent={isSetEvent || currentEventCard !== null}
            isTargetPlayer={isTargetPlayerEvent()}
            isTargetSecret={isTargetSecretEvent()}
            isTargetSet={
              currentEventCard?.name === "ANOTHER VICTIM" &&
              currentEventStep === "select_set"
            }
            target={
              getTargetSetEvent() ||
              selectedTargetPlayer ||
              selectedTargetSecret ||
              selectedTargetSet
            }
          />

          <div className="col-start-1 col-span-3 row-start-3 w-full flex items-center justify-around">
            <div className="flex flex-col gap-y-3">
              <Secrets
                secrets={playerSecrets}
                isSelectableSecret={isCurrPlayersSecretSelectable}
                isTargetSecret={isTargetSecretEvent()}
                onSelectTargetEvent={handleSelectTargetEvent}
                target={getTargetSetEvent()}
              />
              <Sets sets={playerSets} />
            </div>

            <Hand
              cards={handCards}
              onSelect={handleSelectCard}
              isSelected={isCardSelected}
              isSelecting={isSelectingCards}
              isDisabled={!isPlayerTurn}
            />

            <HandActions
              onFinish={handleFinishTurn}
              onDiscard={handleDiscardSelectedCards}
              onPlayEvent={handlePlayEvent}
              onPlaySet={handleClickSetEvent}
              onSelectPlayer={handleSelectedPlayer}
              onSelectSecret={handleSelectedSecret}
              onEndEvent={handleEndEvent}
              canSelectMeAsPlayer={canSelectMeAsPlayer}
              isDisabled={!isPlayerTurn}
              isDisabledEvent={!isPlayable}
              isDisabledEndEvent={isEndEventDisabled}
              isSelectionSetEvent={
                currentEventCard?.name === "ANOTHER VICTIM" &&
                currentEventStep === "select_set"
              }
              isSetButtonDisabled={isSetEventButtonDisabled}
              isSelectionPlayerEvent={isTargetPlayerEvent()}
              isSelectionSecretEvent={isTargetSecretEvent()}
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
