import Set from "./Set";

import type { MatchSet } from "@/types/set";

/*
const MATCH_ID = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
const PLAYER_ID = "00000001-0001-0001-0001-000000000001";

const playerSets: MatchSet[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    type: "Hercule_Poirot",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    type: "Miss_Marple",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    type: "Tommy_Beresford",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    type: "Lady_Eileen",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    type: "Two_Beresford",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    type: "Mr_Satterthwaite",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
]; */

interface Props {
  sets: MatchSet[];
}

export default function Sets({ sets }: Props) {
  return (
    <article className="flex gap-5 flex-wrap p-2 justify-center items-center w-72">
      {sets.map((set) => (
        <Set key={set.id} type={set.type} quin_play={set.quin_play} />
      ))}
    </article>
  );
}
