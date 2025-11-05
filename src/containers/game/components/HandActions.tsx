import { useGame } from "@/contexts/GameContext";

import Button from "@/components/Button";

interface HandActionsProps {
  onFinish: () => void; // Callback que se ejecuta al terminar el turno
  onDiscard: () => void; // Callback que se ejecuta al descartar cartas
  onPlaySet: () => void; // Callback que se ejecuta al clickear el botón para jugar set
  onSelectPlayer: () => void; // Callback que se ejecuta al clickear el botón seleccionar un jugador
  onSelectSecret: () => void; // Callback que se ejecuta al clickear el botón seleccionar un secreto
  onPlayEvent: () => void; // Callback que se ejecuta al clickear el boton de jugar evento
  onSelectSet: () => void; // Callback que se ejecuta al clickear el boton de terminar evento
  onAddDetectiveCardToSet: () => void; // Callback que se ejecuta para bajar un detective a un set
  isDisabled: boolean; // Indica si las acciones están deshabilitadas (no se pueden ejecutar)
  isSetButtonDisabled: boolean; // Indica si el botón para jugar un set de detectives esta habilitado o no
  isSetEventSelectSetButtonDisabled: boolean; // Si se esta bajando un detective a un set, este es falso
  isSelectionPlayerEvent: boolean; // Indica si el botón para seleccionar un jugador esta habilitado o no
  isSelectionSecretEvent: boolean; // Indica si el botón para seleccionar un secreto esta habilitado o no
  isDisabledEvent: boolean; // Indica si el boton para jugar evento esta habilitado
  isSelectionSetEvent: boolean; // Indica si el boton para seleccionar un set esta habilitado
  isAddingCardToSet: boolean; // Indica si se esta seleccionando un set para bajar un detective
  canSelectMeAsPlayer: boolean; // Indica si el jugador puede seleccionarse a si mismo.
}

export default function HandActions({
  onFinish,
  onDiscard,
  onPlaySet,
  onSelectPlayer,
  onSelectSecret,
  onPlayEvent,
  onSelectSet,
  onAddDetectiveCardToSet,
  isDisabled,
  isSetButtonDisabled,
  isSetEventSelectSetButtonDisabled,
  isSelectionPlayerEvent,
  isSelectionSecretEvent,
  isAddingCardToSet,
  isSelectionSetEvent,
  isDisabledEvent,
  canSelectMeAsPlayer,
}: HandActionsProps) {
  // Mientras se esta jugando un evento,
  // no se puede ni descartar o terminar turno.
  const { hasFinishedAction, playerSelectsOneOfHisSecrets } = useGame();
  const shouldDisableOption =
    isDisabled ||
    isSelectionPlayerEvent ||
    isSelectionSecretEvent ||
    isSelectionSetEvent ||
    isAddingCardToSet;

  return (
    <div
      data-testid="hand-actions"
      className="flex flex-col items-center gap-y-2"
    >
      <div className="flex flex-row gap-x-2">
        <div className="flex flex-col gap-y-2">
          <Button
            onClick={onDiscard}
            disabled={shouldDisableOption || hasFinishedAction}
          >
            Discard cards
          </Button>

          <Button
            onClick={onPlaySet}
            disabled={isDisabled || isSetButtonDisabled || hasFinishedAction}
          >
            Play set
          </Button>

          <Button onClick={onPlayEvent} disabled={isDisabledEvent}>
            Play event
          </Button>

          <Button
            onClick={onAddDetectiveCardToSet}
            disabled={
              isDisabled ||
              isSetEventSelectSetButtonDisabled ||
              hasFinishedAction
            }
          >
            Add detective
          </Button>
        </div>

        <div className="flex flex-col gap-y-2">
          <Button
            onClick={onSelectSet}
            disabled={isDisabled || !isSelectionSetEvent}
          >
            Select set
          </Button>

          <Button
            onClick={onSelectSecret}
            disabled={
              (isDisabled || !isSelectionSecretEvent || hasFinishedAction) &&
              !playerSelectsOneOfHisSecrets.isCurrPlayer
            }
          >
            Select secret
          </Button>

          <Button
            onClick={onSelectPlayer}
            disabled={
              isDisabled || !isSelectionPlayerEvent || hasFinishedAction
            }
          >
            {canSelectMeAsPlayer ? "Select me" : "Select player"}
          </Button>

          <Button
            onClick={onFinish}
            disabled={
              shouldDisableOption || playerSelectsOneOfHisSecrets.isSelecting
            }
          >
            Finish turn
          </Button>
        </div>
      </div>
    </div>
  );
}
