import Secret from "./Secret";

import type { GameSecret } from "@/types/secret";
import type { GamePlayer } from "@/types/player";
import type { MatchSet } from "@/types/set";

type SecretsProps = {
  onSelectTargetEvent?: (target: GamePlayer | GameSecret | MatchSet) => void;
  isSelectableSecret: (secret: GameSecret) => boolean;

  secrets: GameSecret[];

  isTargetSecret?: boolean;
  target?: GamePlayer | GameSecret | MatchSet | null;
};

export default function Secrets({
  onSelectTargetEvent,
  isSelectableSecret,

  secrets,

  target = null,
  isTargetSecret = false,
}: SecretsProps) {
  return (
    <div data-testid="secrets" className="flex space-x-4 justify-center">
      {secrets.map((secret) => (
        <Secret
          key={secret.id}
          onSelectTargetEvent={onSelectTargetEvent}
          isSelectableSecret={isSelectableSecret}
          secret={secret}
          isTargetSecret={isTargetSecret}
          target={target}
        />
      ))}
    </div>
  );
}
