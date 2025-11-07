import Secret from "./Secret";

import type { GameSecret } from "@/types/secret";
import type { GamePlayer } from "@/types/player";
import type { MatchSet } from "@/types/set";
import { useMemo, useState } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";

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
  const [page, setPage] = useState<number>(0);

  const startIndex = page * MAX_SECRETS_DISPLAYED;
  const endIndex = startIndex + MAX_SECRETS_DISPLAYED;
  const displayedSecrets: Array<GameSecret | null> = useMemo(() => {
    let slicedSecrets = secrets.slice(startIndex, endIndex);

    if (slicedSecrets.length < MAX_SECRETS_DISPLAYED) {
      slicedSecrets = [
        ...slicedSecrets,
        ...Array(MAX_SECRETS_DISPLAYED - slicedSecrets.length).fill(null),
      ];
    }

    return slicedSecrets;
  }, [secrets, startIndex, endIndex]);

  const canGoPrevPage = page > 0;
  const canGoNextPage = endIndex < secrets.length;

  const handlePrevPage = () => {
    if (canGoPrevPage) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNextPage) {
      setPage(page + 1);
    }
  };

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
        {displayedSecrets.map((secret) => (
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
