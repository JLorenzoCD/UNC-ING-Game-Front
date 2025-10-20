import Set from "./Set";

import type { MatchSet } from "@/types/set";

interface Props {
  sets: MatchSet[];
}

export default function Sets({ sets }: Props) {
  return (
    <article className="flex gap-5 flex-wrap p-2 justify-center items-center w-72">
      {sets.map((set) => (
        <Set
          key={set.id}
          type={set.type}
          quin_play={set.quin_play}
          quin_count={set.quin_count}
        />
      ))}
    </article>
  );
}
