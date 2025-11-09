import Secret from "./Secret";

import type { GameSecret } from "@/types/secret";
import type { GamePlayer } from "@/types/player";
import type { MatchSet } from "@/types/set";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { useCarousel } from "../hooks/useCarousel";

const MAX_SECRETS_DISPLAYED = 3;

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
  const {
    canGoNextPage,
    canGoPrevPage,
    displayedItems,
    handleNextPage,
    handlePrevPage,
  } = useCarousel<GameSecret>(secrets, MAX_SECRETS_DISPLAYED);

  if (secrets.length === 0) {
    return null;
  }

  return (
    <div data-testid="secrets" className="flex gap-x-0.5 items-center">
      <button
        type="button"
        onClick={handlePrevPage}
        disabled={!canGoPrevPage}
        className="text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RiArrowLeftSLine />
      </button>

      <div className="flex gap-x-2 justify-center items-center">
        {displayedItems.map((secret) => (
          <Secret
            key={secret !== null ? secret.id : crypto.randomUUID()}
            secret={secret}
            target={target}
            isTargetSecret={isTargetSecret}
            isSelectableSecret={isSelectableSecret}
            onSelectTargetEvent={onSelectTargetEvent}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleNextPage}
        disabled={!canGoNextPage}
        className="text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RiArrowRightSLine />
      </button>
    </div>
  );
}
