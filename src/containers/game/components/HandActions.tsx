import Button from "@/components/Button";

interface HandActionsProps {
  onFinish: () => void; // Callback que se ejecuta al terminar el turno
  onDiscard: () => void; // Callback que se ejecuta al descartar cartas
  isDiscarding: boolean; // Indica si el jugador ha seleccionado cartas para descartar
}

export default function HandActions({
  onFinish,
  onDiscard,
  isDiscarding,
}: HandActionsProps) {
  return (
    <div data-testid="hand-actions" className="w-36 flex flex-col gap-y-2">
      <Button onClick={onDiscard}>
        {isDiscarding ? "Cancel discard" : "Discard cards"}
      </Button>

      <Button onClick={onFinish}>Finish turn</Button>
    </div>
  );
}
