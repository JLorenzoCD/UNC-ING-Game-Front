import { useGame } from "@/contexts/GameContext";

import Button from "@/components/Button";

interface HandActionsProps {
  onFinish: () => void; // Callback que se ejecuta al terminar el turno
  onDiscard: () => void; // Callback que se ejecuta al descartar cartas
  onPlaySet: () => void; // Callback que se ejecuta al clickear el botón para jugar set
  onSelectPlayer: () => void; // Callback que se ejecuta al clickear el botón seleccionar un jugador
  onSelectSecret: () => void; // Callback que se ejecuta al clickear el botón seleccionar un secreto
  isDisabled: boolean; // Indica si las acciones están deshabilitadas (no se pueden ejecutar)
  isSetButtonDisabled: boolean; // Indica si el botón para jugar un set de detectives esta habilitado o no
  isSelectionPlayerEvent: boolean; // Indica si el botón para seleccionar un jugador esta habilitado o no
  isSelectionSecretEvent: boolean; // Indica si el botón para seleccionar un secreto esta habilitado o no
}

export default function HandActions({
  onFinish,
  onDiscard,
  onPlaySet,
  onSelectPlayer,
  onSelectSecret,
  isDisabled,
  isSetButtonDisabled,
  isSelectionPlayerEvent,
  isSelectionSecretEvent,
}: HandActionsProps) {
  // Mientras se esta jugando un evento,
  // no se puede ni descartar o terminar turno.
  const { isPlayerFinishAction } = useGame();
  const shouldDisableOption =
    isDisabled || isSelectionPlayerEvent || isSelectionSecretEvent;

  return (
    <div data-testid="hand-actions" className="w-36 flex flex-col gap-y-2">
      <Button
        onClick={onDiscard}
        disabled={shouldDisableOption || isPlayerFinishAction}
      >
        Discard cards
      </Button>

      <Button
        onClick={onPlaySet}
        disabled={isDisabled || isSetButtonDisabled || isPlayerFinishAction}
      >
        Play set
      </Button>

      <Button
        onClick={onSelectPlayer}
        disabled={isDisabled || !isSelectionPlayerEvent || isPlayerFinishAction}
      >
        Select player
      </Button>

      <Button
        onClick={onSelectSecret}
        disabled={isDisabled || !isSelectionSecretEvent || isPlayerFinishAction}
      >
        Select secret
      </Button>

      <Button onClick={onFinish} disabled={shouldDisableOption}>
        Finish turn
      </Button>
    </div>
  );
}
