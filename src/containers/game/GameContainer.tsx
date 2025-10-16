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

import { isCardsValidSet } from "./components/utils";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";

type GameCardMap = Record<UUID, GameCard>;
type HandCardList = Array<GameCard | null>;

const defaultStateSetEvent = {
  isSetEvent: false,
  isValidSet: false,
  isTargetPlayer: true, // caso contrario el target es un secreto
  isSelectedTargetSet: false,
  target: "",
};

export default function GameContainer() {
  const { player } = usePlayer();

  const { httpService } = useHttpService();

  const { match, secrets, players, cards, sets } = useGame();

  const [handCards, setHandCards] = useState<HandCardList>([]);
  const [selectedCards, setSelectedCards] = useState<GameCardMap>({});
  const [discardedCards, setDiscardedCards] = useState<GameCardMap>({});
  const [hasDiscardedCards, setHasDiscardedCards] = useState<boolean>(false);

  const [discardModal, setDiscardModal] = useState({
    isOpen: false,
    isEventDiscard: false,
  });

  const [setEvent, setSetEvent] = useState(defaultStateSetEvent);

  const handleClickSetEvent = () => {
    if (!setEvent.isValidSet && !setEvent.isSetEvent) return;
    else if (!setEvent.isSetEvent) {
      // TODO: Se debe verificar si el target del set es un jugador o un secreto
      const isTargetPlayer = true;

      setSetEvent((prev) => ({
        ...prev,
        isSetEvent: true,
        isSelectedTargetSet: false,
        target: "",
        isTargetPlayer,
      }));
      return;
    }
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

    // Si no se han marcado cartas como descartadas,
    // cancelamos la operación.
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

  // Inicialmente, cargamos manualmente las cartas que pertenezcan al jugador
  // y no se hayan descartado. Luego, se actualizarán por WebSocket.
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
    if (discardModal.isOpen) return;
    if (!isCardsValidSet(Object.values(selectedCards))) return;

    setSetEvent((prev) => ({ ...prev, isValidSet: true }));
  }, [discardModal, selectedCards]);

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
          />

          {/* Las últimas tres casillas de la grilla pertenecen al jugador actual. */}
          <div className="col-start-1 col-span-3 row-start-3 w-full flex items-center justify-around">
            <div className="flex flex-col gap-y-3">
              <Secrets secrets={playerSecrets} />
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
              onPlaySet={handleClickSetEvent}
              onSelectPlayer={handleClickSetEvent}
              onSelectSecret={handleClickSetEvent}
              isDiscarding={isDiscardingCards}
              isDisabled={!isPlayerTurn}
              isValidSet={setEvent.isValidSet}
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
        onEndEvent={handleEventDiscard}
        isEventDiscard={discardModal.isEventDiscard}
        discardedCards={cardsInDiscardPile}
      />
    </>
  );
}
