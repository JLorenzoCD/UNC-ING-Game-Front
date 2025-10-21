import Set from "./Set";

import type { MatchSet } from "@/types/set";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";

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
  return (
    <article className="flex gap-5 flex-wrap p-2 justify-center items-center w-72">
      {sets.map((set) => (
        <Set
          key={set.id}
          type={set.type}
          quin_play={set.quin_play}
          quin_count={set.quin_count}
          set_object={set}
          onSelectTargetEvent={onSelectTargetEvent}
          isSelectableSet={isSelectableSet}
          isTargetSet={isTargetSet}
          target={target}
        />
      ))}
    </article>
  );
}
