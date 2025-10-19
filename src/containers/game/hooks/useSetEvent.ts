import { useCallback, useState } from "react";

import {
  cardsToSetTypeDetective,
  isCardsValidSet,
  isSetActionRevealSecret,
  isSetTargetOneSecret,
} from "../components/utils";

import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { GameCard } from "@/types/card";
import { usePlayer } from "@/contexts/PlayerContext";
import { toast } from "sonner";
import { useGame } from "@/contexts/GameContext";
import type { SetType } from "@/types/set";

interface SetEvent {
  isValidSet: boolean;
  isTargetPlayer: boolean;
  isTargetSecret: boolean;
  isRevealSecret: boolean;
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
};

export function useSetEvent() {
  const { player } = usePlayer();
  const { secrets } = useGame();

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

      setSetEvent((prev) => ({
        ...prev,
        isValidSet: false, // Para deshabilitar el botón de jugar set mientras se juega el evento
        target: null,
        isTargetPlayer: !isTargetSecret,
        isTargetSecret,
        setType,
        cards: selectedCards,
      }));
      return;
    }
  };

  const setEventToggleDisableButtonPlaySet = useCallback(
    (selectedCards: GameCard[]) => {
      const isValidSet = isCardsValidSet(selectedCards);
      if (isValidSet) {
        const otherSecrets = secrets.filter(
          (secret) => secret.player_id !== player?.id,
        );

        const allSecretReveled = otherSecrets.every(
          (secret) => secret.is_revealed,
        );
        const isActionRevealSecret = isSetActionRevealSecret(selectedCards);

        if (isActionRevealSecret && allSecretReveled) return;
        if (!isActionRevealSecret && !allSecretReveled) return;
      }

      setSetEvent((prev) => ({ ...prev, isValidSet }));
    },
    [player, secrets],
  );

  const setTargetSet = (target: GamePlayer | GameSecret) => {
    if (isSetEvent && ("avatar" in target || "secret_id" in target)) {
      setSetEvent((prev) => ({
        ...prev,
        target: target,
      }));
    }
  };

  const executeSetActionToTarget = () => {
    if (!isSetEvent) return;

    if (setEvent.target === null) {
      toast.error("The target of the set must be selected.");
      return;
    }

    // Evento de set para un jugador
    if (setEvent.isTargetPlayer && "avatar" in setEvent.target) {
      console.log(
        "El jugador " +
          setEvent.target.name +
          " fue seleccionado para revelar su secreto",
      );

      setSetEvent({ ...defaultStateSetEvent, isValidSet: true });
    }

    // Evento de set para un secreto
    if (setEvent.isTargetSecret && "secret_id" in setEvent.target) {
      console.log(
        "Se selecciono el secreto con id: " +
          setEvent.target.id +
          ", fue seleccionado para revelar su secreto. Este es " +
          setEvent.target.type,
      );

      setSetEvent({ ...defaultStateSetEvent, isValidSet: true });
    }
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

    if (secret.player_id === player?.id && !secret.is_revealed) return true;

    return false;
  };

  const isSecretSelectableForSetEvent = (secret: GameSecret) => {
    if (!isSetEvent || !setEvent.isTargetSecret) return false;
    if (secret.player_id === player?.id) return false;

    const isActionRevealSecret = isSetActionRevealSecret(setEvent.cards);

    // Eventos de seleccionar secreto a revelarlo por jugar set
    if (isActionRevealSecret && !secret.is_revealed) return true;

    // Eventos de seleccionar secreto a des-revelar por jugar set (Payne)
    if (!isActionRevealSecret && secret.is_revealed) return true;

    return false;
  };

  const getTargetSetEvent = () => setEvent.target;

  const clearSetEvent = () => setSetEvent(defaultStateSetEvent);

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
    isSecretSelectableForSetEvent,
    isCurrPlayerSecretSelectableForSetEvent,
    setEventToggleDisableButtonPlaySet,
    getTargetSetEvent,
    clearSetEvent,
  };
}
