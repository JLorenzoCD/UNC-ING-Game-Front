interface HandActionsProps {
  onDiscard: () => void; // Callback que se ejecuta al descartar cartas
  onFinish: () => void; // Callback que se ejecuta al terminar el turno
}

export default function HandActions({ onDiscard, onFinish }: HandActionsProps) {
  return (
    <div data-testid="hand-actions space-y-2">
      <button onClick={onDiscard} className="bg-white">
        Discard cards
      </button>

      <button onClick={onFinish} className="bg-white">
        Finish turn
      </button>
    </div>
  );
}
