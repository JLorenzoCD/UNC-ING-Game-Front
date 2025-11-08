import Set from "./Set";

import type { MatchSet } from "@/types/set";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import { useMemo, useState } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";

const MAX_SETS_DISPLAYED = 3;

interface Props {
  sets: MatchSet[];
  onSelectTargetEvent?: (target: GamePlayer | GameSecret | MatchSet) => void;
  isSelectableSet?: (set: MatchSet) => boolean;
  isTargetSet?: boolean;
  target?: GamePlayer | GameSecret | MatchSet | null;
}

export default function Sets({
  sets,
  onSelectTargetEvent,
  isSelectableSet,
  isTargetSet,
  target,
}: Props) {
  const [page, setPage] = useState<number>(0);

  const startIndex = page * MAX_SETS_DISPLAYED;
  const endIndex = startIndex + MAX_SETS_DISPLAYED;

  const displayedSets: Array<MatchSet | null> = useMemo(() => {
    let slicedSets = sets.slice(startIndex, endIndex);

    if (slicedSets.length < MAX_SETS_DISPLAYED) {
      slicedSets = [
        ...slicedSets,
        ...Array(MAX_SETS_DISPLAYED - slicedSets.length).fill(null),
      ];
    }

    return slicedSets;
  }, [sets, startIndex, endIndex]);

  const canGoPrevPage = page > 0;
  const canGoNextPage = endIndex < sets.length;

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

  if (sets.length === 0) {
    return null;
  }

  return (
    <article
      data-testid="secrets"
      className="flex gap-x-0.5 justify-center items-center"
    >
      <button
        type="button"
        onClick={handlePrevPage}
        disabled={!canGoPrevPage}
        className="text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RiArrowLeftSLine />
      </button>

      <div className="flex gap-x-2 justify-center items-center">
        {displayedSets.map((set) => {
          return (
            <Set
              key={set ? set.id : crypto.randomUUID()}
              set={set}
              target={target}
              isTargetSet={isTargetSet}
              isSelectableSet={isSelectableSet}
              onSelectTargetEvent={onSelectTargetEvent}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleNextPage}
        disabled={!canGoNextPage}
        className="text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RiArrowRightSLine />
      </button>
    </article>
  );
}
