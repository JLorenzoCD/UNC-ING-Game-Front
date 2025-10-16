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

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";
import Draft from "./components/Draft";

type GameCardMap = Record<UUID, GameCard>;
type HandCardList = Array<GameCard | null>;

const DRAFT_SIZE = 3;
const HAND_SIZE = 6;

export default function GameContainer() {
  const { player } = usePlayer();

  const { httpService } = useHttpService();

  const { match, secrets, players, cards, sets } = useGame();

  const [handCards, setHandCards] = useState<HandCardList>([]);
  const [selectedCards, setSelectedCards] = useState<GameCardMap>({});
  const [hasDiscardedCards, setHasDiscardedCards] = useState<boolean>(false);

  const [discardModal, setDiscardModal] = useState({
    isOpen: false,
    isEventDiscard: false,
  });

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

  // El jugador puede tomar cartas si es su turno
  // y tiene menos de 6 cartas en mano (posiciones no nulas).
  const canTakeCards = useMemo(() => {
    return (
      isPlayerTurn &&
      handCards.filter((card) => card !== null).length < HAND_SIZE
    );
  }, [handCards, isPlayerTurn]);

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

  const isSelectingCards = Object.keys(selectedCards).length > 0;

  // -- Utilidades --

  const isCardSelected = (card: GameCard) => {
    return !!selectedCards[card.id];
  };

  const fillHandWithNulls = (cards: GameCard[]): HandCardList => {
    const filledHand: HandCardList = [...cards];

    while (filledHand.length < HAND_SIZE) {
      filledHand.push(null);
    }

    return filledHand;
  };

  // -- Manejadores --

  /**
   * Si una carta no ha sido marcada como "descartada",
   * entonces la seleccionamos.
   */
  const handleSelectCard = (card: GameCard) => {
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

  const handleTakeCardFromDraft = async (card: GameCard) => {
    if (!httpService || !player || !match) return;

    try {
      await httpService.putTakeCards(match.id, player.id, [card.id]);

      const firstEmptyIndex = handCards.findIndex((c) => c === null);

      if (firstEmptyIndex !== -1) {
        setHandCards((prevHandCards) => {
          const newHandCards = [...prevHandCards];
          newHandCards[firstEmptyIndex] = card;
          return newHandCards;
        });
      }
    } catch (error) {
      console.error("Failed to take card from draft:", error);
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
      await httpService.putDiscardCards(match.id, player.id, [
        randomDiscardableCard.id,
      ]);

      await httpService.putTakeCards(match.id, player.id, [
        firstTakeableCard.id,
      ]);

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

  const handleDiscardSelectedCards = async () => {
    if (!httpService || !player || !match) return;

    const selectedCardIds = Object.keys(selectedCards);

    if (selectedCardIds.length === 0) return;

    try {
      await httpService.putDiscardCards(
        match.id,
        player.id,
        selectedCardIds as UUID[],
      );

      setHandCards((current) => {
        const newHandCards = [...current];

        selectedCardIds.forEach((cardId) => {
          const index = newHandCards.findIndex((card) => card?.id === cardId);
          if (index !== -1) {
            newHandCards[index] = null;
          }
        });

        return newHandCards;
      });

      setSelectedCards({});
      setHasDiscardedCards(true);
    } catch (error) {
      console.error("Failed to discard selected cards:", error);

      return;
    }
  };

  const handleFinishTurn = async () => {
    if (!httpService || !player || !match) return;

    try {
      // Si el jugador no ha descartado cartas, se fuerza
      // el descarte obligatorio de una carta.
      if (!hasDiscardedCards) {
        await handleMandatoryDiscard();
      }

      // Reseteamos los estados relacionados con el descarte
      setSelectedCards({});
      setHasDiscardedCards(false);

      await httpService.putPassTurn(match.id);
    } catch (error) {
      console.error("Failed to finish turn:", error);
    }
  };

  // Inicialmente, cargamos manualmente las cartas que pertenezcan al jugador
  // y no se hayan descartado. Luego, se actualizarán por WebSocket.
  useEffect(() => {
    // Evitamos generar la mano del jugador si todavía hay datos cargando
    // o si ya tiene cartas en su mano
    if (cards.length === 0 || player === null) return;

    if (!initialLoadRef.current) return;

    initialLoadRef.current = false;

    setHandCards(
      fillHandWithNulls(
        cards.filter(
          (card) => card.player_id === player.id && !card.is_discarded,
        ),
      ),
    );
  }, [cards, player]);

  // Para reutilizar el 'selectedCards', se vacía el mismo si se abre el modal
  // para ver las ultimas 5 cartas descartadas y se vacía al cerrar el modal.
  useEffect(() => {
    setSelectedCards({});
  }, [discardModal.isOpen]);

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
                onTake={handleTakeCardFromDraft}
                canTake={canTakeCards}
              />
            }
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
              isDisabled={!isPlayerTurn}
            />

            <HandActions
              onFinish={handleFinishTurn}
              onDiscard={handleDiscardSelectedCards}
              isDisabled={!isPlayerTurn}
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
