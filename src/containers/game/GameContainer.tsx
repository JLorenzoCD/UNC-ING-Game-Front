import { useEffect, useMemo, useRef, useState } from "react";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import Hand from "./components/Hand";
import Table from "./components/Table";
import Sets from "./components/Sets";
import Secrets from "./components/Secrets";
import DrawPile from "./components/DrawPile";
import DiscardPile from "./components/DiscardPile";
import HandActions from "./components/HandActions";
import DiscardModal from "./components/DiscardModal";

import {
  isCardsValidSet,
  isSetActionRevealSecret,
  isSetTargetOneSecret,
} from "./components/utils";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";
import type {
  RegularAndDiscardEventPayload,
  LookIntoTheAshesEventPayload,
  AndThenThereWasOneMoreEventPayload,
  CardsOffTheTableEventPayload,
} from "@/types/event";
import type { EventPayload } from "@/types/event";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";

type GameCardMap = Record<UUID, GameCard>;
type HandCardList = Array<GameCard | null>;
type EventStep = "select_secret" | "select_player" | null;

interface SetEvent {
  isSetEvent: boolean;
  isValidSet: boolean;
  isTargetPlayer: boolean;
  isSelectedTargetSet: boolean;
  target: GamePlayer | GameSecret | null;
}

const defaultStateSetEvent: SetEvent = {
  isSetEvent: false,
  isValidSet: false,
  isTargetPlayer: true,
  isSelectedTargetSet: false,
  target: null,
};

export default function GameContainer() {
  const { player } = usePlayer();

  const { httpService } = useHttpService();

  const { match, secrets, players, cards, sets } = useGame();

  const [handCards, setHandCards] = useState<HandCardList>([]);
  const [selectedCards, setSelectedCards] = useState<GameCardMap>({});
  const [discardedCards, setDiscardedCards] = useState<GameCardMap>({});
  const [hasDiscardedCards, setHasDiscardedCards] = useState<boolean>(false);

  // Estados para eventos de cartas
  const [currentEventCard, setCurrentEventCard] = useState<GameCard | null>(
    null,
  );
  const [selectedTargetPlayer, setSelectedTargetPlayer] =
    useState<GamePlayer | null>(null);
  const [selectedTargetSecret, setSelectedTargetSecret] =
    useState<GameSecret | null>(null);
  const [currentEventStep, setCurrentEventStep] = useState<EventStep>(null);

  const [discardModal, setDiscardModal] = useState({
    isOpen: false,
    isEventDiscard: false,
  });

  const [setEvent, setSetEvent] = useState<SetEvent>(defaultStateSetEvent);

  const isEndEventDisabled = useMemo(() => {
    if (!currentEventCard) return true;

    switch (currentEventCard.name) {
      case "CARDS OFF THE TABLE":
        return selectedTargetPlayer === null;

      case "LOOK INTO THE ASHES":
        return Object.keys(selectedCards).length !== 1;

      case "AND THEN THERE WAS ONE MORE":
        return selectedTargetSecret === null || selectedTargetPlayer === null;

      default:
        return false;
    }
  }, [
    currentEventCard,
    selectedTargetPlayer,
    selectedCards,
    selectedTargetSecret,
  ]);

  // -- Utilidades --
  const handleClickSetEvent = () => {
    if (!setEvent.isValidSet && !setEvent.isSetEvent) return;
    else if (setEvent.isValidSet && !setEvent.isSetEvent) {
      const isTargetPlayer = !isSetTargetOneSecret(
        Object.values(selectedCards),
      );

      setSetEvent((prev) => ({
        ...prev,
        isValidSet: false,
        isSetEvent: true,
        isSelectedTargetSet: false,
        target: null,
        isTargetPlayer,
      }));
      return;
    }
  };

  const handleSelectTargetEvent = (target: GamePlayer | GameSecret) => {
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

    // Eventos de sets
    const isSetEventPlayerTarget =
      setEvent.isSetEvent && setEvent.isTargetPlayer && "avatar" in target;
    const isSetEventSecretTarget =
      setEvent.isSetEvent && !setEvent.isTargetPlayer && "secret_id" in target;

    if (isSetEventPlayerTarget || isSetEventSecretTarget) {
      setSetEvent((prev) => ({
        ...prev,
        target: target,
        isSelectedTargetSet: true,
      }));
    }
  };

  const handleSelectedPlayer = () => {
    if (
      !setEvent.isSetEvent ||
      !setEvent.isTargetPlayer ||
      setEvent.target === null ||
      !("avatar" in setEvent.target)
    )
      return;

    alert(
      "El jugador " +
        setEvent.target.name +
        " fue seleccionado para revelar su secreto",
    );

    setSetEvent({ ...defaultStateSetEvent, isValidSet: true });
  };

  const handleSelectedSecret = () => {
    if (
      !setEvent.isSetEvent ||
      setEvent.isTargetPlayer ||
      setEvent.target === null ||
      !("secret_id" in setEvent.target)
    )
      return;

    alert(
      "Se selecciono el secreto con id: " +
        setEvent.target.id +
        ", fue seleccionado para revelar su secreto. Este es " +
        setEvent.target.type,
    );

    setSetEvent({ ...defaultStateSetEvent, isValidSet: true });
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
    if (!setEvent.isSetEvent && setEvent.isTargetPlayer) return false;

    const secretsPlayer = secrets.filter((s) => s.player_id === checkPlayer.id);
    const isAllSecretsReveled = secretsPlayer.every((s) => s.is_revealed);

    // Eventos de seleccionar jugador por set para revelar secreto
    if (setEvent.isSetEvent && setEvent.isTargetPlayer && !isAllSecretsReveled)
      return true;

    return false;
  };

  const isSelectableSecret = (secret: GameSecret) => {
    if (
      currentEventCard?.name === "AND THEN THERE WAS ONE MORE" &&
      currentEventStep === "select_secret"
    ) {
      return secret.is_revealed;
    }
    // Se deben de poner todos los posibles eventos validos
    if (!setEvent.isSetEvent || setEvent.isTargetPlayer) return false;

    if (secret.player_id === player?.id) return false;

    try {
      const isActionRevealSecret = isSetActionRevealSecret(
        Object.values(selectedCards),
      );

      // Eventos de seleccionar secreto a revelarlo por jugar set
      if (
        setEvent.isSetEvent &&
        !setEvent.isTargetPlayer &&
        isActionRevealSecret &&
        !secret.is_revealed
      )
        return true;

      // Eventos de seleccionar secreto a des-revelar por jugar set (Pyne)
      if (
        setEvent.isSetEvent &&
        !setEvent.isTargetPlayer &&
        !isActionRevealSecret &&
        secret.is_revealed
      )
        return true;
    } catch (error) {
      console.error(error);
    }

    return false;
  };

  // Determina si es la primera vez que se carga el componente.
  // Se usa para cargar la mano del jugador solo una vez.
  // Luego, las actualizaciones de cartas se harán por WebSocket.
  const initialLoadRef = useRef<boolean>(true);

  // -- Valores memoizados --

  const isPlayerTurn = useMemo(() => {
    if (!match || !player) return false;

    const matchPlayer = players.find((p) => p.id === player.id);

    if (!matchPlayer) return false;

    return match.current_player_order === matchPlayer.order;
  }, [match, player, players]);

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
    return permittedCards.includes(nameCard);
  }, [selectedCards]);

  const isSelectingCards = Object.keys(selectedCards).length > 0;

  const isDiscardingCards = Object.keys(discardedCards).length > 0;

  // -- Utilidades --

  const isCardSelected = (card: GameCard) => {
    return !!selectedCards[card.id];
  };

  const isCardDiscarded = (card: GameCard) => {
    return !!discardedCards[card.id];
  };

  // -- Manejadores --

  /**
   * Si una carta no ha sido marcada como "descartada",
   * entonces la seleccionamos.
   */
  const handleSelectCard = (card: GameCard) => {
    // No se pueden seleccionar cartas que
    // ya están marcadas para descartar
    if (isCardDiscarded(card)) return;

    if (setEvent.isSetEvent) return;

    if (discardModal.isOpen && !discardModal.isEventDiscard) {
      // Si no hay evento no se puede seleccionar cartas en el modal que
      // muestra las ultimas 5 cartas descartadas.
      return;
    }

    // También se puede añadir lógica para ver cuantas cartas se pueden
    // seleccionar en el modal de cartas descartadas.

    if (!selectedCards[card.id]) {
      setSelectedCards({ ...selectedCards, [card.id]: card });
    } else {
      const updatedSelectedCards = { ...selectedCards };
      delete updatedSelectedCards[card.id];

      setSelectedCards(updatedSelectedCards);
    }
  };

  const handleDiscardSelectedCards = () => {
    if (isDiscardingCards) {
      // Si ya hay cartas marcadas para descartar,
      // se desmarca todo.
      setDiscardedCards({});
      setHasDiscardedCards(false);
    } else if (isSelectingCards) {
      setDiscardedCards(selectedCards);
      setHasDiscardedCards(true);
    }

    setSelectedCards({});
  };

  const handleClickDiscardPile = () => {
    if (setEvent.isSetEvent) return;

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

  /**
   * Descarta las cartas que localmente se marcaron como descartadas,
   * tomando igual cantidad de cartas del mazo regular y reordenándolas
   * en la mano del jugador.
   *
   * TODO: permitir tomar cartas del draft.
   */
  const handleDiscardCards = async () => {
    if (!httpService || !player || !match) return;

    const discardedCardsAmount = Object.keys(discardedCards).length;

    if (discardedCardsAmount === 0) return;

    // TODO: corregir esto con la lógica de tomar cartas
    const takenCardIds = cards
      .filter((card) => {
        return card.player_id === null && !card.is_discarded;
      })
      // Tenemos que tomar la misma cantidad que descartamos.
      .slice(0, discardedCardsAmount)
      .map((card) => card.id);

    const discardedCardIds = Object.keys(discardedCards);

    try {
      await httpService.putMatchCards(
        match.id,
        player.id,
        takenCardIds,
        discardedCardIds,
      );

      setHandCards((prevHandCards) => {
        // Calculamos que índices de la mano pertenecen
        // a cartas que serán descartadas.
        const discardedHandCardsIndexes = prevHandCards
          .map((card, index) => {
            if (card === null) return -1;

            return discardedCardIds.includes(card.id) ? index : -1;
          })
          .filter((index) => index !== -1);

        const newHandCards = [...prevHandCards];

        for (const index of discardedHandCardsIndexes) {
          // Dejamos vacío el espacio en la mano que pertenecía
          // a una carta que fue descartada.
          newHandCards[index] = null;
        }

        const takenCards = cards.filter((card) =>
          takenCardIds.includes(card.id),
        );

        let takenCardsIndex = 0;

        // Agregamos a los espacios vacíos de la mano, de izquierda a derecha,
        // las cartas que han sido tomadas.
        for (let i = 0; i < newHandCards.length; i++) {
          if (newHandCards[i] === null && takenCardsIndex < takenCards.length) {
            newHandCards[i] = takenCards[takenCardsIndex];
            takenCardsIndex++;
          }
        }

        // La mano ahora tiene las cartas originales y las nuevas
        // en los lugares de las que fueron descartadas.
        return newHandCards;
      });
    } catch (error) {
      console.error("Failed to put cards:", error);

      // Lanzamos el error de nuevo para que no pueda pasar el turno
      // si el descarte falló.
      throw error;
    }
  };

  /**
   * Ejecuta el descarte obligatorio (y reposición) de una carta.
   * Esto sucede cuando el jugador quiere finalizar su turno sin haber
   * descartado cartas de forma manual.
   */
  const handleMandatoryDiscard = async () => {
    if (!httpService || !player || !match) return;

    const firstTakeableCard = cards.find((card) => {
      return card.player_id === null && !card.is_discarded;
    });

    if (!firstTakeableCard) {
      throw new Error("No cards available to take from the draw pile.");
    }

    const nonNullHandCards = handCards.filter(
      (card) => card !== null,
    ) as GameCard[];

    const randomIndex = Math.floor(Math.random() * nonNullHandCards.length);

    const randomDiscardableCard = nonNullHandCards[randomIndex];

    if (!randomDiscardableCard) {
      throw new Error("No cards available to discard from the hand.");
    }

    try {
      await httpService.putMatchCards(
        match.id,
        player.id,
        [firstTakeableCard.id],
        [randomDiscardableCard.id],
      );

      setHandCards((prevHandCards) => {
        const newHandCards = [...prevHandCards];

        const indexToDiscard = newHandCards.findIndex(
          (card) => card?.id === randomDiscardableCard.id,
        );

        if (indexToDiscard !== -1) {
          newHandCards[indexToDiscard] = firstTakeableCard;
        }

        return newHandCards;
      });
    } catch (error) {
      console.error("Failed to perform mandatory discard:", error);

      // Lanzamos el error de nuevo para que no pueda pasar el turno
      // si el descarte falló.
      throw error;
    }
  };

  const handleFinishTurn = async () => {
    if (!httpService || !player || !match) return;

    try {
      // Si el jugador no ha descartado cartas, se fuerza
      // el descarte obligatorio de una carta.
      if (!hasDiscardedCards) {
        await handleMandatoryDiscard();
      } else {
        await handleDiscardCards();
      }

      // Reseteamos los estados relacionados con el descarte
      setSelectedCards({});
      setDiscardedCards({});
      setHasDiscardedCards(false);

      await httpService.putPassTurn(match.id);
    } catch (error) {
      console.error("Failed to finish turn:", error);
    }

    setSetEvent(defaultStateSetEvent);
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
        handleEndEvent();
        break;
      }

      case "LOOK INTO THE ASHES": {
        setCurrentEventCard(cardEvent);
        handleEventDiscard();
        break;
      }

      case "CARDS OFF THE TABLE": {
        setCurrentEventCard(cardEvent);
        setSelectedCards({});
        setCurrentEventStep("select_player");
        break;
      }

      case "AND THEN THERE WAS ONE MORE": {
        setCurrentEventCard(cardEvent);
        setSelectedCards({});
        setCurrentEventStep("select_secret");
        break;
      }
    }
  };

  const handleEndEvent = async () => {
    if (!httpService || !player || !match || !currentEventCard) {
      console.error("Faltan datos necesarios para completar el evento");
      return;
    }

    const nameEvent = currentEventCard.name;
    let eventPayload: EventPayload | undefined;

    switch (nameEvent) {
      case "LOOK INTO THE ASHES": {
        // Validamos que haya una carta seleccionada del descarte
        const selectedDiscardedCardsArray = Object.values(selectedCards);

        if (selectedDiscardedCardsArray.length !== 1) {
          console.warn("Debe seleccionar exactamente una carta del descarte");
          return;
        }

        const selectedDiscardedCard = selectedDiscardedCardsArray[0];

        // Construimos el payload para el evento
        eventPayload = {
          target_card_id: selectedDiscardedCard.id,
        } as LookIntoTheAshesEventPayload;

        // Cerramos el modal
        setDiscardModal({
          isOpen: false,
          isEventDiscard: false,
        });

        // Limpiamos los estados
        setSelectedCards({});
        setCurrentEventCard(null);
        break;
      }

      case "DELAY THE MURDERER ESCAPE": {
        const idsInDiscardPile = cardsInDiscardPile.map((card) => card.id);

        eventPayload = {
          cards_ids: idsInDiscardPile,
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

        eventPayload = {
          target_secret_id: selectedTargetSecret.id,
          target_player_id: selectedTargetPlayer.id,
        } as AndThenThereWasOneMoreEventPayload;

        setSelectedTargetPlayer(null);
        setSelectedTargetSecret(null);
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
        currentEventCard.id,
        eventPayload,
      );

      setCurrentEventCard(null);
      setSelectedCards({});

      console.log("Evento completado exitosamente");
    } catch (error) {
      console.error("Error al ejecutar el evento", error);
    }
  };

  // -- Effects --

  useEffect(() => {
    // Evitamos generar la mano del jugador si todavía hay datos cargando
    // o si ya tiene cartas en su mano
    if (cards.length === 0 || player === null) return;

    if (initialLoadRef.current) {
      setHandCards(
        cards.filter(
          (card) => card.player_id === player?.id && !card.is_discarded,
        ),
      );

      initialLoadRef.current = false;
    }
  }, [cards, player]);

  // Para reutilizar el 'selectedCards', se vacía el mismo si se abre el modal
  // para ver las ultimas 5 cartas descartadas y se vacía al cerrar el modal.
  useEffect(() => {
    setSelectedCards({});
  }, [discardModal.isOpen]);

  // Al seleccionar cartas de mano, se revisa si son un set de detectives validos
  useEffect(() => {
    if (discardModal.isOpen || discardModal.isEventDiscard) return;

    const isValidSet = isCardsValidSet(Object.values(selectedCards));
    if (isValidSet) {
      const otherSecrets = secrets.filter(
        (secret) => secret.player_id !== player?.id,
      );

      const allSecretReveled = otherSecrets.every(
        (secret) => secret.is_revealed,
      );
      const isActionRevealSecret = isSetActionRevealSecret(
        Object.values(selectedCards),
      );

      if (isActionRevealSecret && allSecretReveled) return;
      if (!isActionRevealSecret && !allSecretReveled) return;
    }

    setSetEvent((prev) => ({ ...prev, isValidSet }));
  }, [discardModal, selectedCards, secrets, player]);

  return (
    <>
      <div
        data-testid="game-container"
        className="p-4 h-screen overflow-y-hidden relative bg-[url('/src/assets/background.png')] bg-cover bg-center"
      >
        {/* Formamos una grilla de 3x3 para posicionar los elementos de la partida. */}
        <div className="h-full w-full grid grid-cols-3 grid-rows-3">
          {/* Las primeras 6 casillas ubican a los jugadores, sus elementos y las pilas del juego. */}
          <Table
            drawPile={<DrawPile cardCount={drawableCards.length} />}
            discardPile={
              <DiscardPile
                topCard={cardsInDiscardPile[0]}
                onClick={handleClickDiscardPile}
              />
            }
            onSelectTargetEvent={handleSelectTargetEvent}
            isSelectablePlayer={isSelectablePlayer}
            isSelectableSecret={isSelectableSecret}
            isEvent={setEvent.isSetEvent || currentEventCard !== null}
            isTargetPlayer={
              setEvent.isTargetPlayer ||
              currentEventCard?.name === "CARDS OFF THE TABLE" ||
              (currentEventCard?.name === "AND THEN THERE WAS ONE MORE" &&
                currentEventStep === "select_player")
            }
            isTargetSecret={
              !setEvent.isTargetPlayer ||
              (currentEventCard?.name === "AND THEN THERE WAS ONE MORE" &&
                currentEventStep === "select_secret")
            }
            target={
              setEvent.target || selectedTargetPlayer || selectedTargetSecret
            }
          />

          <div className="col-start-1 col-span-3 row-start-3 w-full flex items-center justify-around">
            <div className="flex flex-col gap-y-3">
              <Secrets
                secrets={playerSecrets}
                isSelectableSecret={isSelectableSecret}
              />
              <Sets sets={playerSets} />
            </div>

            <Hand
              cards={handCards}
              onSelect={handleSelectCard}
              isSelected={isCardSelected}
              isSelecting={isSelectingCards}
              isDiscarded={isCardDiscarded}
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
              isDiscarding={isDiscardingCards}
              isDisabled={!isPlayerTurn}
              isDisabledEvent={!isPlayable}
              isDisabledEndEvent={isEndEventDisabled}
              isSetButtonDisabled={
                !(setEvent.isValidSet && !setEvent.isSetEvent)
              }
              isSelectionPlayerEvent={
                setEvent.isSetEvent && setEvent.isTargetPlayer
              }
              isSelectionSecretEvent={
                setEvent.isSetEvent && !setEvent.isTargetPlayer
              }
            />
          </div>
        </div>
      </div>

      <DiscardModal
        isOpen={discardModal.isOpen}
        onClose={onCloseDiscardModal}
        onSelect={handleSelectCard}
        isSelected={isCardSelected}
        onEndEvent={handleEndEvent}
        isEventDiscard={discardModal.isEventDiscard}
        discardedCards={cardsInDiscardPile}
      />
    </>
  );
}
