import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import {
  canDownTheCardToASet,
  cardsToSetCreationData,
  cardsToSetCreationDataTypeDetective,
  cardsToSetUpdateData,
  isCardsValidSet,
  isSetActionHiddenSecret,
  isSetActionRevealSecret,
  isSetActionStolenSecret,
  isSetCardsTargetOnePLayer,
  isSetCardsTargetOneSecret,
  isSetTargetOnePlayer,
  isSetTargetOneSecret,
} from "../utils/setEvent";

import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { GameCard } from "@/types/card";
import type { MatchSet, SetType } from "@/types/set";
import type { UUID } from "@/types/common";

interface SetEvent {
  isInEvent: boolean;
  isValidSet: boolean;

  isTargetPlayer: boolean;
  isTargetSecret: boolean;

  isRevealSecret: boolean;
  isHiddenSecret: boolean;
  isStolenSecret: boolean;

  isSelectingSet: boolean;

  cards: GameCard[];
  setType: SetType | null;
  set: MatchSet | null;
  target: GamePlayer | GameSecret | null;

  isRevealCurrPlayerSecret: boolean;
  canDownTheCardToASet: boolean;
}

const defaultStateSetEvent: SetEvent = {
  isInEvent: false,
  isValidSet: false,

  isTargetPlayer: false,
  isTargetSecret: false,

  isRevealSecret: false,
  isHiddenSecret: false,
  isStolenSecret: false,

  isSelectingSet: false,

  cards: [],
  setType: null,
  set: null,
  target: null,

  isRevealCurrPlayerSecret: false,
  canDownTheCardToASet: false,
};

export function useSetEvent() {
  const { player } = usePlayer();
  const {
    secrets,
    players,
    sets,
    playerSelectsOneOfHisSecrets,
    lastUpdatedSecretId,
    hasFinishedAction,
  } = useGame();
  const { httpService } = useHttpService();

  const params = useParams();
  const matchId = params.matchId as UUID;

  const [setEvent, setSetEvent] = useState<SetEvent>(defaultStateSetEvent);

  const isSetEventButtonDisabled = useMemo(() => {
    if (hasFinishedAction) return true;

    if (setEvent.canDownTheCardToASet && setEvent.isSelectingSet) return false;

    if (!setEvent.isValidSet || setEvent.isInEvent) return true;

    return false;
  }, [
    setEvent.isValidSet,
    setEvent.isInEvent,
    setEvent.canDownTheCardToASet,
    setEvent.isSelectingSet,
    hasFinishedAction,
  ]);
  const isSetEventSelectSetButtonDisabled = useMemo(
    () =>
      setEvent.isValidSet ||
      setEvent.isInEvent ||
      !setEvent.canDownTheCardToASet ||
      setEvent.cards.length === 1 ||
      hasFinishedAction,
    [
      setEvent.isValidSet,
      setEvent.isInEvent,
      setEvent.canDownTheCardToASet,
      setEvent.cards,
      hasFinishedAction,
    ],
  );

  const playSet = async (selectedCards: GameCard[]) => {
    if (
      !setEvent.isValidSet &&
      !setEvent.isInEvent &&
      !setEvent.canDownTheCardToASet
    )
      return;

    if (
      setEvent.isValidSet &&
      !setEvent.isInEvent &&
      !setEvent.canDownTheCardToASet
    ) {
      const setType = cardsToSetCreationDataTypeDetective(selectedCards);
      const isTargetSecret = isSetCardsTargetOneSecret(selectedCards);
      const isTargetPlayer = isSetCardsTargetOnePLayer(selectedCards);
      const isRevealSecret = isSetActionRevealSecret(selectedCards);
      const isHiddenSecret = isSetActionHiddenSecret(selectedCards);
      const isStolenSecret = isSetActionStolenSecret(selectedCards);

      const isSetEvent = isTargetPlayer || isTargetSecret;

      setSetEvent((prev) => ({
        ...prev,
        isValidSet: false, // Para deshabilitar el botón de jugar set mientras se juega el evento
        isInEvent: isSetEvent,
        target: null,
        isTargetPlayer,
        isTargetSecret,
        setType,
        cards: selectedCards,
        isRevealSecret,
        isHiddenSecret,
        isStolenSecret,
      }));
      return;
    }

    if (
      setEvent.isValidSet ||
      setEvent.isInEvent ||
      !setEvent.canDownTheCardToASet ||
      !setEvent.isSelectingSet ||
      setEvent.set === null ||
      selectedCards.length !== 1
    )
      return;

    if (selectedCards[0].name !== "ARIADNE OLIVER") {
      const setType = setEvent.set.type;
      const isTargetSecret = isSetTargetOneSecret(setEvent.set);
      const isTargetPlayer = isSetTargetOnePlayer(setEvent.set);
      const isRevealSecret = setType !== "PARKER PYNE";
      const isHiddenSecret = setType === "PARKER PYNE";
      const isStolenSecret =
        setType === "MR SATTERTHWAITE" && setEvent.set.quin_play;

      const isSetEvent = isTargetPlayer || isTargetSecret;

      setSetEvent((prev) => ({
        ...prev,
        isValidSet: false, // Para deshabilitar el botón de jugar set mientras se juega el evento
        isInEvent: isSetEvent,
        target: null,
        isTargetPlayer,
        isTargetSecret,
        setType,
        cards: selectedCards,
        isRevealSecret,
        isHiddenSecret,
        isStolenSecret,
        isSelectingSet: false,
      }));
      return;
    } else {
      // Al bajar Oliver, directamente se juega el evento y no se selecciona nada.
      // Ya que el jugador seleccionado es el dueño del set.
      try {
        const dataBody = cardsToSetUpdateData(
          setEvent.cards[0],
          setEvent.set,
          setEvent.set.player_id,
        );
        await httpService?.addDetectiveCardToSetAndPlay(matchId, dataBody);

        setSetEvent({
          ...defaultStateSetEvent,
        });
      } catch (err) {
        console.error(err);

        toast.error("An unexpected error has occurred, please try again.");
      }
    }
  };

  const addDetectiveCardToSet = (card: GameCard) => {
    if (
      setEvent.isValidSet ||
      setEvent.isInEvent ||
      !setEvent.canDownTheCardToASet
    )
      return;

    setSetEvent((prev) => ({
      ...prev,
      cards: [card],
      isSelectingSet: true,
    }));
  };

  const setEventToggleDisableButtonPlaySet = useCallback(
    (selectedCards: GameCard[]) => {
      const isValidSet = isCardsValidSet(selectedCards);
      if (isValidSet) {
        const isHiddenSecret = isSetActionHiddenSecret(selectedCards);

        const someSecretReveled = secrets.some((secret) => secret.is_revealed);

        if (isHiddenSecret && !someSecretReveled) {
          // Si la acción del set es ocultar secreto y no hay secreto que
          // ocultar, entonces no se puede jugar el set
          setSetEvent((prev) => ({ ...prev, isValidSet: false }));
          return;
        }
      }

      setSetEvent((prev) => ({ ...prev, isValidSet }));
    },
    [secrets],
  );

  const setEventToggleDisableButtonSelectSet = useCallback(
    (selectedCards: GameCard[]) => {
      if (player === null) return;

      if (selectedCards.length !== 1) {
        setSetEvent((prev) => ({
          ...prev,
          canDownTheCardToASet: false,
          set: null,
          isSelectingSet: false,
          cards: [],
        }));
        return;
      }

      const can = canDownTheCardToASet(selectedCards[0], sets, player.id);

      setSetEvent((prev) => ({
        ...prev,
        canDownTheCardToASet: can,
        set: null,
        isSelectingSet: false,
        cards: [],
      }));
    },
    [player, sets],
  );

  const setTargetSet = (target: GamePlayer | GameSecret | MatchSet) => {
    if (!setEvent.isInEvent || player === null) return;

    // target player
    if (setEvent.isTargetPlayer && "avatar" in target) {
      setSetEvent((prev) => ({
        ...prev,
        target: target,
      }));
    }

    // target secret
    const isTargetSecret = setEvent.isTargetSecret && "secret_id" in target;
    if (
      // Se juega para revelar el secreto de otro o ocultar un secreto
      isTargetSecret &&
      ((setEvent.isRevealSecret &&
        target.player_id !== player.id &&
        !setEvent.isRevealCurrPlayerSecret &&
        !target.is_revealed) ||
        (setEvent.isHiddenSecret && target.is_revealed))
    ) {
      setSetEvent((prev) => ({
        ...prev,
        target: target,
      }));
    } else if (
      isTargetSecret &&
      setEvent.isRevealSecret &&
      setEvent.isRevealCurrPlayerSecret &&
      target.player_id === player.id &&
      !target.is_revealed
    ) {
      // El jugador fue seleccionado para revelar un secreto de su elección
      setSetEvent((prev) => ({
        ...prev,
        target: target,
      }));
    }
  };

  const setTargeSetToDown = (target: GamePlayer | GameSecret | MatchSet) => {
    if (player === null) return;

    if (
      !setEvent.isValidSet &&
      !setEvent.isInEvent &&
      setEvent.canDownTheCardToASet &&
      "quin_play" in target
    ) {
      setSetEvent((prev) => ({
        ...prev,
        set: target,
      }));
    }
  };

  const executeSetActionToTarget = async () => {
    if (!setEvent.isInEvent) return false;

    if (setEvent.target === null) {
      toast.error("The target of the set must be selected.");
      return false;
    }

    // Evento de set para un jugador
    if (setEvent.isTargetPlayer && "avatar" in setEvent.target) {
      const msg = `Player "${setEvent.target.name}" was selected to reveal one of his secrets.`;
      toast(msg);

      try {
        if (!setEvent.canDownTheCardToASet) {
          const dataBody = cardsToSetCreationData(
            setEvent.cards,
            setEvent.target.player_id,
          );
          await httpService?.createAndPlaySet(matchId, dataBody);
        } else {
          if (setEvent.set === null) throw new Error("Set is null");

          const dataBody = cardsToSetUpdateData(
            setEvent.cards[0],
            setEvent.set,
            setEvent.target.player_id,
          );
          await httpService?.addDetectiveCardToSetAndPlay(matchId, dataBody);
        }

        setSetEvent({
          ...defaultStateSetEvent,
          isStolenSecret: setEvent.isStolenSecret,
        });

        return true;
      } catch (err) {
        console.error(err);

        toast.error("An unexpected error has occurred, please try again.");
      }
    }

    // Evento de set para un secreto, que no es del jugador actual revelando uno suyo
    if (
      setEvent.isTargetSecret &&
      "secret_id" in setEvent.target &&
      !setEvent.isRevealCurrPlayerSecret
    ) {
      const playerTarget = players.find(
        (p) => p.id === setEvent.target?.player_id,
      );

      if (!playerTarget) {
        toast.error("The selected secret is not valid.");
        return false;
      }

      try {
        if (!setEvent.canDownTheCardToASet) {
          const dataBody = cardsToSetCreationData(
            setEvent.cards,
            setEvent.target.player_id as UUID,
            setEvent.target.id,
          );

          await httpService?.createAndPlaySet(matchId, dataBody);
        } else {
          if (setEvent.set === null) throw new Error("Set is null");

          const dataBody = cardsToSetUpdateData(
            setEvent.cards[0],
            setEvent.set,
            setEvent.target.player_id as UUID,
            setEvent.target.id,
          );
          await httpService?.addDetectiveCardToSetAndPlay(matchId, dataBody);
        }

        setSetEvent({ ...defaultStateSetEvent });
        return true;
      } catch (err) {
        console.error(err);
        toast.error("An unexpected error has occurred, please try again.");
      }
    }

    // El jugador actual revela un secreto
    if (
      setEvent.isTargetSecret &&
      "secret_id" in setEvent.target &&
      setEvent.isRevealCurrPlayerSecret
    ) {
      const playerTarget = players.find(
        (p) => p.id === setEvent.target?.player_id,
      );

      if (!playerTarget || playerTarget.player_id !== player?.id) {
        toast.error("The selected secret is not valid.");
        return false;
      }

      try {
        await httpService?.putSecret(
          matchId,
          setEvent.target.id,
          player.id,
          "reveal_secret",
        );
        setSetEvent(defaultStateSetEvent);
        return true;
      } catch (err) {
        console.error(err);
        toast.error("An unexpected error has occurred, please try again.");
      }
    }

    return false;
  };

  const executeFinishTurnSetEvent = async () => {
    if (httpService === null || player === null) return;

    if (!setEvent.isStolenSecret) return;

    const secretId = lastUpdatedSecretId;
    if (secretId === null) return;

    try {
      await httpService.putSecret(
        matchId,
        secretId,
        player.id as UUID,
        "steal_secret",
      );
    } catch (err) {
      console.error(err);

      // Lo maneja la función de terminar turno.
      throw err;
    }

    setSetEvent({ ...defaultStateSetEvent });
  };

  const isPlayerSelectableForSetEvent = (player: GamePlayer) => {
    if (!setEvent.isInEvent || !setEvent.isTargetPlayer) return false;

    const secretsPlayer = secrets.filter((s) => s.player_id === player.id);
    const isAllSecretsReveled = secretsPlayer.every((s) => s.is_revealed);

    // Eventos de seleccionar jugador por set para revelar secreto
    if (!isAllSecretsReveled) return true;

    return false;
  };

  const iSetSelectableForSetEvent = (set: MatchSet) => {
    if (
      setEvent.isValidSet ||
      setEvent.isInEvent ||
      !setEvent.canDownTheCardToASet
    )
      return false;

    const card = setEvent.cards[0];

    if (card.name === "ARIADNE OLIVER") return true;
    if (card.player_id !== set.player_id) return false;

    if (
      card.name === set.type ||
      (set.type === "TWO BERESFORD" &&
        (card.name === "TOMMY BERESFORD" || card.name === "TUPPENCE BERESFORD"))
    )
      return true;

    if (
      (set.type === "TOMMY BERESFORD" && card.name === "TUPPENCE BERESFORD") ||
      (set.type === "TUPPENCE BERESFORD" && card.name === "TOMMY BERESFORD")
    )
      return true;

    return false;
  };

  const isCurrPlayerSecretSelectableForSetEvent = (secret: GameSecret) => {
    if (!setEvent.isInEvent || !setEvent.isTargetSecret) return false;
    if (secret.player_id !== player?.id) return false;

    if (
      setEvent.isRevealSecret &&
      !secret.is_revealed &&
      setEvent.isRevealCurrPlayerSecret
    )
      return true;

    // Jugar un Payne para uno mismo
    if (setEvent.isHiddenSecret && secret.is_revealed) return true;

    return false;
  };

  const isOtherPlayerSecretSelectableForSetEvent = (secret: GameSecret) => {
    if (!setEvent.isInEvent || !setEvent.isTargetSecret) return false;
    if (secret.player_id === player?.id || setEvent.isRevealCurrPlayerSecret)
      return false;

    const isActionRevealSecret = setEvent.isRevealSecret;
    const isActionHiddenSecret = setEvent.isHiddenSecret;

    // Eventos de seleccionar secreto a revelarlo por jugar set
    if (isActionRevealSecret && !secret.is_revealed) return true;

    // Eventos de seleccionar secreto a des-revelar por jugar set (Payne)
    if (isActionHiddenSecret && secret.is_revealed) return true;

    return false;
  };

  const getTargetSetEvent = () => setEvent.target;

  const getSetCards = () => setEvent.cards;

  const clearSetEvent = () => setSetEvent(defaultStateSetEvent);

  useEffect(() => {
    if (playerSelectsOneOfHisSecrets.isCurrPlayer)
      setSetEvent({
        ...defaultStateSetEvent,
        isRevealSecret: true,
        isTargetSecret: true,
        isInEvent: true,
        isRevealCurrPlayerSecret: true,
      });
  }, [playerSelectsOneOfHisSecrets.isCurrPlayer]);

  return {
    setEvent,
    isSetEventButtonDisabled,
    isSetEventSelectSetButtonDisabled,
    playSet,
    addDetectiveCardToSet,
    setTargetSet,
    setTargeSetToDown,
    executeSetActionToTarget,
    executeFinishTurnSetEvent,
    isPlayerSelectableForSetEvent,
    isOtherPlayerSecretSelectableForSetEvent,
    isCurrPlayerSecretSelectableForSetEvent,
    iSetSelectableForSetEvent,
    setEventToggleDisableButtonPlaySet,
    setEventToggleDisableButtonSelectSet,
    getTargetSetEvent,
    getSetCards,
    clearSetEvent,
  };
}
