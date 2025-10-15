import Button from "@/components/Button";

interface HandActionsProps {
  onFinish: () => void; // Callback que se ejecuta al terminar el turno
  onDiscard: () => void; // Callback que se ejecuta al descartar cartas
  onPlayEvent: () => void; // Callback que se ejecuta al jugar evento
  isDisabled: boolean; // Indica si las acciones están deshabilitadas (no se pueden ejecutar)
  isDiscarding: boolean; // Indica si el jugador ha seleccionado cartas para descartar
  isDisabledEvent: boolean; // Inica si se puede jugar esa carta (debe ser un evento posible)
}

export default function HandActions({
  onFinish,
  onDiscard,
  onPlayEvent,
  isDisabled,
  isDiscarding,
  isDisabledEvent,
}: HandActionsProps) {
  return (
    <div data-testid="hand-actions" className="w-36 flex flex-col gap-y-2">
      <Button onClick={onDiscard} disabled={isDisabled}>
        {isDiscarding ? "Cancel discard" : "Discard cards"}
      </Button>

      <Button onClick={onFinish} disabled={isDisabled}>
        Finish turn
      </Button>

      <Button onClick={onPlayEvent} disabled={isDisabledEvent}>
        Play Event
      </Button>
    </div>
  );
}
