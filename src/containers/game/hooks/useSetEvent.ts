import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { useGame } from "@/contexts/GameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import {
  cardsToSet,
  cardsToSetTypeDetective,
  isCardsValidSet,
  isSetActionRevealSecret,
  isSetTargetOneSecret,
} from "../components/utils";

import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { GameCard } from "@/types/card";
import type { SetType } from "@/types/set";
import type { UUID } from "@/types/common";

interface SetEvent {
  isValidSet: boolean;
  isTargetPlayer: boolean;
  isTargetSecret: boolean;
  isRevealSecret: boolean;
  isRevealCurrPlayerSecret: boolean;
  cards: GameCard[];
  setType: SetType | null;
  target: GamePlayer | GameSecret | null;
}

const defaultStateSetEvent: SetEvent = {
  isValidSet: false,
  isTargetPlayer: false,
  isTargetSecret: false,
  isRevealSecret: false,
  cards: [],
  setType: null,
  target: null,
  isRevealCurrPlayerSecret: false,
};

export function useSetEvent() {
  const { player } = usePlayer();
  const { secrets, players, playerSelectsOneOfHisSecrets } = useGame();
  const { httpService } = useHttpService();

  const params = useParams();
  const matchId = params.matchId as UUID;

  const [setEvent, setSetEvent] = useState<SetEvent>(defaultStateSetEvent);

  const isSetEvent = setEvent.isTargetPlayer || setEvent.isTargetSecret;
  const isTargetPlayerSetEvent = setEvent.isTargetPlayer;
  const isTargetSecretSetEvent = setEvent.isTargetSecret;
  const isSetEventButtonDisabled = !(setEvent.isValidSet && !isSetEvent);

  const playSet = (selectedCards: GameCard[]) => {
    if (!setEvent.isValidSet && !isSetEvent) return;
    else if (setEvent.isValidSet && !isSetEvent) {
      const setType = cardsToSetTypeDetective(selectedCards);
      const isTargetSecret = isSetTargetOneSecret(selectedCards);
      const isRevealSecret = isSetActionRevealSecret(selectedCards);

      setSetEvent((prev) => ({
        ...prev,
        isValidSet: false, // Para deshabilitar el botón de jugar set mientras se juega el evento
        target: null,
        isTargetPlayer: !isTargetSecret,
        isTargetSecret,
        setType,
        cards: selectedCards,
        isRevealSecret,
      }));
      return;
    }
  };

  const setEventToggleDisableButtonPlaySet = useCallback(
    (selectedCards: GameCard[]) => {
      const isValidSet = isCardsValidSet(selectedCards);
      if (isValidSet) {
        const isActionRevealSecret = isSetActionRevealSecret(selectedCards);

        const allOtherPlayersSecretAreReveled = secrets
          .filter((secret) => secret.player_id !== player?.id)
          .every((secret) => secret.is_revealed);
        const someSecretReveled = secrets.some((secret) => secret.is_revealed);

        // No se puede revelar ningún secreto de los otros jugadores
        // o
        // Algún secreto propio o de otro jugador esta revelado y puede ser ocultado
        if (
          (isActionRevealSecret && allOtherPlayersSecretAreReveled) ||
          (!isActionRevealSecret && !someSecretReveled)
        ) {
          toast.warning(
            "The conditions for playing this set are not met. There are no cards to reveal or hide.",
          );

          setSetEvent((prev) => ({ ...prev, isValidSet: false }));
          return;
        }
      }

      setSetEvent((prev) => ({ ...prev, isValidSet }));
    },
    [player, secrets],
  );

  const setTargetSet = (target: GamePlayer | GameSecret) => {
    if (!isSetEvent) return;

    // target player
    if (isTargetPlayerSetEvent && "avatar" in target) {
      setSetEvent((prev) => ({
        ...prev,
        target: target,
      }));
    }

    // target secret
    const isTargetSecret = isTargetSecretSetEvent && "secret_id" in target;
    if (
      // Se juega para revelar el secreto de otro o ocultar un secreto
      isTargetSecret &&
      ((setEvent.isRevealSecret &&
        target.player_id !== player?.id &&
        !setEvent.isRevealCurrPlayerSecret) ||
        !setEvent.isRevealSecret)
    ) {
      setSetEvent((prev) => ({
        ...prev,
        target: target,
      }));
    } else if (
      isTargetSecret &&
      setEvent.isRevealSecret &&
      setEvent.isRevealCurrPlayerSecret &&
      target.player_id === player?.id
    ) {
      // El jugador fue seleccionado para revelar un secreto de su elección
      setSetEvent((prev) => ({
        ...prev,
        target: target,
      }));
    }
  };

  const executeSetActionToTarget = async () => {
    if (!isSetEvent) return false;

    if (setEvent.target === null) {
      toast.error("The target of the set must be selected.");
      return false;
    }

    // Evento de set para un jugador
    if (setEvent.isTargetPlayer && "avatar" in setEvent.target) {
      const msg = `Player "${setEvent.target.name}" was selected to reveal one of his secrets.`;
      toast(msg);

      try {
        const dataBody = cardsToSet(setEvent.cards, setEvent.target.player_id);

        await httpService?.createAndPlaySet(matchId, dataBody);
        setSetEvent({ ...defaultStateSetEvent, isValidSet: true });

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
        const dataBody = cardsToSet(
          setEvent.cards,
          setEvent.target.player_id as UUID,
          setEvent.target.id,
        );

        await httpService?.createAndPlaySet(matchId, dataBody);
        setSetEvent({ ...defaultStateSetEvent, isValidSet: true });
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

  const isPlayerSelectableForSetEvent = (player: GamePlayer) => {
    if (!isSetEvent || !setEvent.isTargetPlayer) return false;

    const secretsPlayer = secrets.filter((s) => s.player_id === player.id);
    const isAllSecretsReveled = secretsPlayer.every((s) => s.is_revealed);

    // Eventos de seleccionar jugador por set para revelar secreto
    if (!isAllSecretsReveled) return true;

    return false;
  };

  const isCurrPlayerSecretSelectableForSetEvent = (secret: GameSecret) => {
    if (!isSetEvent || !setEvent.isTargetSecret) return false;
    if (secret.player_id !== player?.id) return false;

    if (setEvent.isRevealSecret && !secret.is_revealed) return true;

    // Jugar un Payne para uno mismo
    if (!setEvent.isRevealSecret && secret.is_revealed) return true;

    return false;
  };

  const isOtherPlayerSecretSelectableForSetEvent = (secret: GameSecret) => {
    if (!isSetEvent || !setEvent.isTargetSecret) return false;
    if (secret.player_id === player?.id || setEvent.isRevealCurrPlayerSecret)
      return false;

    const isActionRevealSecret = setEvent.isRevealSecret;

    // Eventos de seleccionar secreto a revelarlo por jugar set
    if (isActionRevealSecret && !secret.is_revealed) return true;

    // Eventos de seleccionar secreto a des-revelar por jugar set (Payne)
    if (!isActionRevealSecret && secret.is_revealed) return true;

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
        isRevealCurrPlayerSecret: true,
      });
  }, [playerSelectsOneOfHisSecrets.isCurrPlayer]);

  return {
    setEvent,
    isSetEvent,
    isTargetPlayerSetEvent,
    isTargetSecretSetEvent,
    isSetEventButtonDisabled,
    playSet,
    setTargetSet,
    executeSetActionToTarget,
    isPlayerSelectableForSetEvent,
    isOtherPlayerSecretSelectableForSetEvent,
    isCurrPlayerSecretSelectableForSetEvent,
    setEventToggleDisableButtonPlaySet,
    getTargetSetEvent,
    getSetCards,
    clearSetEvent,
  };
}
