import Button from "@/components/Button";

interface HandActionsProps {
  onFinish: () => void; // Callback que se ejecuta al terminar el turno
  onDiscard: () => void; // Callback que se ejecuta al descartar cartas
  isDisabled: boolean; // Indica si las acciones están deshabilitadas (no se pueden ejecutar)
}

export default function HandActions({
  onFinish,
  onDiscard,
  isDisabled,
}: HandActionsProps) {
  return (
    <div data-testid="hand-actions" className="w-36 flex flex-col gap-y-2">
      <Button onClick={onDiscard} disabled={isDisabled}>
        Discard cards
      </Button>

      <Button onClick={onFinish} disabled={isDisabled}>
        Finish turn
      </Button>
    </div>
  );
}
