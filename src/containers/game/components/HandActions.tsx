import Button from "@/components/Button";

interface HandActionsProps {
  onFinish: () => void; // Callback que se ejecuta al terminar el turno
  onDiscard: () => void; // Callback que se ejecuta al descartar cartas
}

export default function HandActions({ onFinish, onDiscard }: HandActionsProps) {
  return (
    <div data-testid="hand-actions" className="w-36 flex flex-col gap-y-2">
      <Button onClick={onDiscard}>Discard cards</Button>

      <Button onClick={onFinish}>Finish turn</Button>
    </div>
  );
}
