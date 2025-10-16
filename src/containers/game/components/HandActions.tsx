import Button from "@/components/Button";

interface HandActionsProps {
  onFinish: () => void; // Callback que se ejecuta al terminar el turno
  onDiscard: () => void; // Callback que se ejecuta al descartar cartas
  onClickSetButton: () => void; // Callback que se ejecuta al clickear el botón para jugar set
  isDisabled: boolean; // Indica si las acciones están deshabilitadas (no se pueden ejecutar)
  isDiscarding: boolean; // Indica si el jugador ha seleccionado cartas para descartar
  bottonMsgForSetMatch: string; // Mensaje que se muestra en el botón del jugar set de detectives
  isDisabledSetEventButton: boolean; // Indica si el botón para jugar un set de detectives esta habilitado o no
}

export default function HandActions({
  onFinish,
  onDiscard,
  onClickSetButton,
  isDisabled,
  isDiscarding,
  bottonMsgForSetMatch,
  isDisabledSetEventButton,
}: HandActionsProps) {
  return (
    <div data-testid="hand-actions" className="w-36 flex flex-col gap-y-2">
      <Button onClick={onDiscard} disabled={isDisabled}>
        {isDiscarding ? "Cancel discard" : "Discard cards"}
      </Button>

      <Button onClick={onClickSetButton} disabled={isDisabledSetEventButton}>
        {bottonMsgForSetMatch}
      </Button>

      <Button onClick={onFinish} disabled={isDisabled}>
        Finish turn
      </Button>
    </div>
  );
}
