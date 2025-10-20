import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { GameCard } from "@/types/card";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import {
  isCardsValidSet,
  isSetActionRevealSecret,
  isSetTargetOneSecret,
} from "./components/utils";

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

export const DRAFT_SIZE = 3;

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
  isTargetPlayer: true, // caso contrario el target es un secreto
  isSelectedTargetSet: false,
  target: null,
};

export default function GameContainer() {
  const { player } = usePlayer();

  const { httpService } = useHttpService();

  const { match, secrets, players, cards, result, sets } = useGame();

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

  const [setEvent, setSetEvent] = useState<SetEvent>(defaultStateSetEvent);

  const handleClickSetEvent = () => {
    if (!setEvent.isValidSet && !setEvent.isSetEvent) return;
    else if (setEvent.isValidSet && !setEvent.isSetEvent) {
      const isTargetPlayer = !isSetTargetOneSecret(
        Object.values(selectedCards),
      );

      setSetEvent((prev) => ({
        ...prev,
        isValidSet: false, // Para deshabilitar el botón de jugar set mientras se juega el evento
        isSetEvent: true,
        isSelectedTargetSet: false,
        target: null,
        isTargetPlayer,
      }));
      return;
    }
  };

  const handleSelectTargetEvent = (target: GamePlayer | GameSecret) => {
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

  const isSelectablePlayer = (player: GamePlayer) => {
    // Se deben de poner todos los posibles eventos validos
    if (!setEvent.isSetEvent && setEvent.isTargetPlayer) return false;

    const secretsPlayer = secrets.filter((s) => s.player_id === player.id);
    const isAllSecretsReveled = secretsPlayer.every((s) => s.is_revealed);

    //* Validacion por eventos

    // Eventos de seleccionar jugador por set para revelar secreto
    if (setEvent.isSetEvent && setEvent.isTargetPlayer && !isAllSecretsReveled)
      return true;

    return false;
  };

  const isSelectableSecret = (secret: GameSecret) => {
    // Se deben de poner todos los posibles eventos validos
    if (!setEvent.isSetEvent || setEvent.isTargetPlayer) return false;

    if (secret.player_id === player?.id) return false;

    try {
      const isActionRevealSecret = isSetActionRevealSecret(
        Object.values(selectedCards),
      );

      //* Validacion por eventos

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
    setDiscardModal({ isOpen: false, isEventDiscard: false });
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

    if (setEvent.isSetEvent) return;

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
    } catch (error) {
      console.error("Failed to discard selected cards:", error);

      toast.error("Failed to discard selected cards.");

      throw error;
    }
  };

  const mandatoryDiscard = async () => {
    if (!httpService || !player || !match) return;

    try {
      const firstTakeableCard = cards.find(
        (card) => card.player_id === null && !card.is_discarded,
      );

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
      // Si el jugador no ha descartado cartas, se fuerza
      // el descarte obligatorio de una carta.
      if (!hasDiscardedCards) {
        await mandatoryDiscard();
      }

      await httpService.putPassTurn(match.id);

      // Reseteamos los estados relacionados con el descarte
      setHasTakenCards(false);
      setHasDiscardedCards(false);

      clearSelectedCards();
    } catch (error) {
      console.error("Failed to finish turn:", error);
    }

    setSetEvent(defaultStateSetEvent);
  };

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
            isEvent={setEvent.isSetEvent}
            isTargetPlayer={setEvent.isTargetPlayer}
            isTargetSecret={!setEvent.isTargetPlayer}
            target={setEvent.target}
          />

          {/* Las últimas tres casillas de la grilla pertenecen al jugador actual. */}
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
              isDisabled={!isPlayerTurn}
            />

            <HandActions
              onFinish={handleFinishTurn}
              onDiscard={handleDiscardSelectedCards}
              onPlaySet={handleClickSetEvent}
              onSelectPlayer={handleSelectedPlayer}
              onSelectSecret={handleSelectedSecret}
              isDisabled={!isPlayerTurn}
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
        onSelect={selectCard}
        isSelected={isCardSelected}
        onEndEvent={handleEventDiscard}
        isEventDiscard={discardModal.isEventDiscard}
        discardedCards={cardsInDiscardPile}
      />

      <Result result={result} />
    </>
  );
}
