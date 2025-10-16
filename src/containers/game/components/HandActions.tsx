import Button from "@/components/Button";

interface HandActionsProps {
  onFinish: () => void; // Callback que se ejecuta al terminar el turno
  onDiscard: () => void; // Callback que se ejecuta al descartar cartas
  onPlaySet: () => void; // Callback que se ejecuta al clickear el botón para jugar set
  onSelectPlayer: () => void; // Callback que se ejecuta al clickear el botón seleccionar un jugador
  onSelectSecret: () => void; // Callback que se ejecuta al clickear el botón seleccionar un secreto
  isDisabled: boolean; // Indica si las acciones están deshabilitadas (no se pueden ejecutar)
  isDiscarding: boolean; // Indica si el jugador ha seleccionado cartas para descartar
  isValidSet: boolean; // Indica si el botón para jugar un set de detectives esta habilitado o no
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
  isDiscarding,
  isValidSet,
  isSelectionPlayerEvent,
  isSelectionSecretEvent,
}: HandActionsProps) {
  return (
    <div data-testid="hand-actions" className="w-36 flex flex-col gap-y-2">
      <Button onClick={onDiscard} disabled={isDisabled}>
        {isDiscarding ? "Cancel discard" : "Discard cards"}
      </Button>

      <Button onClick={onPlaySet} disabled={isDisabled && isValidSet}>
        Play set
      </Button>

      <Button
        onClick={onSelectPlayer}
        disabled={isDisabled && isSelectionPlayerEvent}
      >
        Select player
      </Button>

      <Button
        onClick={onSelectSecret}
        disabled={isDisabled && isSelectionSecretEvent}
      >
        Select secret
      </Button>

      <Button onClick={onFinish} disabled={isDisabled}>
        Finish turn
      </Button>
    </div>
  );
}
