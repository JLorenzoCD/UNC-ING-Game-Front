import Set from "./Set";

import type { MatchSet } from "@/types/set";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { useCarousel } from "../hooks/useCarousel";

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
  const {
    canGoNextPage,
    canGoPrevPage,
    displayedItems,
    handleNextPage,
    handlePrevPage,
  } = useCarousel<MatchSet>(sets, MAX_SETS_DISPLAYED);

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
        {displayedItems.map((set) => {
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
