import { useMemo, useState } from "react";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import Hand from "./components/Hand";
import Sets from "./components/Sets";
import Table from "./components/Table";
import Draft from "./components/Draft";
import Secrets from "./components/Secrets";
import DrawPile from "./components/DrawPile";
import DiscardPile from "./components/DiscardPile";
import HandActions from "./components/HandActions";
import DiscardModal from "./components/DiscardModal";

import { useHand } from "./hooks/useHand";

const DRAFT_SIZE = 3;

export default function GameContainer() {
  const { player } = usePlayer();

  const { httpService } = useHttpService();

  const { match, secrets, players, cards, sets } = useGame();

  const {
    addCard,
    clearSelectedCards,
    getRandomCard,
    handCards,
    isCardSelected,
    isHandFull,
    isSelectingCards,
    removeCard,
    replaceCard,
    selectCard,
    selectedCards,
  } = useHand();

  const [hasDiscardedCards, setHasDiscardedCards] = useState<boolean>(false);

  const [discardModal, setDiscardModal] = useState({
    isOpen: false,
    isEventDiscard: false,
  });

  // -- Valores memoizados --

  const isPlayerTurn = useMemo(() => {
    if (!match || !player) return false;

    const matchPlayer = players.find((p) => p.id === player.id);

    if (!matchPlayer) return false;

    return match.current_player_order === matchPlayer.order;
  }, [match, player, players]);

  const canTakeCards = useMemo(() => {
    return isPlayerTurn && !isHandFull;
  }, [isHandFull, isPlayerTurn]);

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

  // -- Manejadores --

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

      addCard(card);
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

    const randomDiscardableCard = getRandomCard();

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

      replaceCard(randomDiscardableCard, firstTakeableCard);
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

      for (const cardId of selectedCardIds) {
        const card = selectedCards[cardId];

        if (!card) continue;

        removeCard(card);
      }

      clearSelectedCards();
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
      clearSelectedCards();
      setHasDiscardedCards(false);

      await httpService.putPassTurn(match.id);
    } catch (error) {
      console.error("Failed to finish turn:", error);
    }
  };

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
              onSelect={selectCard}
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
        onSelect={selectCard}
        isSelected={isCardSelected}
        onEndEvent={handleEventDiscard}
        isEventDiscard={discardModal.isEventDiscard}
        discardedCards={cardsInDiscardPile}
      />
    </>
  );
}
