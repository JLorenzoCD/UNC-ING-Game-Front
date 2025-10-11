import { useGame } from "@/contexts/GameContext";

import { usePlayer } from "@/contexts/PlayerContext";

import Player from "./Player";
import type { GamePlayer } from "@/types/player";

export default function Table() {
  const { match /* players */ } = useGame();
  const { player } = usePlayer();

  const players: GamePlayer[] = [
    // {
    //   id: crypto.randomUUID(),
    //   player_id: crypto.randomUUID(),
    //   name: "Alice",
    //   avatar: "src/assets/icono5.png",
    //   order: 1,
    //   role: "MURDERER",
    //   birthday: new Date("1970-01-01"),
    //   match_id: match?.id || crypto.randomUUID(),
    // },
    // {
    //   id: crypto.randomUUID(),
    //   player_id: crypto.randomUUID(),
    //   name: "Alisa",
    //   avatar: "src/assets/icono4.png",
    //   order: 2,
    //   role: "INNOCENT",
    //   birthday: new Date("1970-01-01"),
    //   match_id: match?.id || crypto.randomUUID(),
    // },
    {
      id: crypto.randomUUID(),
      player_id: crypto.randomUUID(),
      name: "Aliso",
      avatar: "src/assets/icono3.png",
      order: 3,
      role: "INNOCENT",
      birthday: new Date("1970-01-01"),
      match_id: match?.id || crypto.randomUUID(),
    },
    {
      id: crypto.randomUUID(),
      player_id: crypto.randomUUID(),
      name: "Alise",
      avatar: "src/assets/icono1.png",
      order: 4,
      role: "INNOCENT",
      birthday: new Date("1970-01-01"),
      match_id: match?.id || crypto.randomUUID(),
    },
    {
      id: crypto.randomUUID(),
      player_id: crypto.randomUUID(),
      name: "owiwiw",
      avatar: "src/assets/icono2.png",
      order: 5,
      role: "INNOCENT",
      birthday: new Date("1970-01-01"),
      match_id: match?.id || crypto.randomUUID(),
    },
  ];

  const getVisiblePlayersWithGridPositions = () => {
    const visiblePlayers = players.filter((p) => p.id !== player?.id);

    const sortedPlayers = [...visiblePlayers].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );

    const totalPlayers = players.length;
    const playerTurn = match?.current_player_order;

    // Grid positions mapping for different player counts
    // Grid is 3x3: [top-left, top-center, top-right, mid-left, mid-center, mid-right, bottom-left, bottom-center, bottom-right]
    const getGridPositionsForPlayerCount = (count: number): string[] => {
      switch (count) {
        case 2:
          // 1 other player: top-center
          return ["col-start-2 row-start-1"];
        case 3:
          // 2 other players: top-center, mid-right
          return ["col-start-2 row-start-1", "col-start-3 row-start-2"];
        case 4:
          // 3 other players: mid-left, top-center, mid-right
          return [
            "col-start-1 row-start-2",
            "col-start-2 row-start-1",
            "col-start-3 row-start-2",
          ];
        case 5:
          // 4 other players: top-left, top-center, top-right, mid-right
          return [
            "col-start-1 row-start-1",
            "col-start-2 row-start-1",
            "col-start-3 row-start-1",
            "col-start-3 row-start-2",
          ];
        case 6:
          // 5 other players: top-left, top-center, top-right, mid-left, mid-right
          return [
            "col-start-1 row-start-1",
            "col-start-2 row-start-1",
            "col-start-3 row-start-1",
            "col-start-1 row-start-2",
            "col-start-3 row-start-2",
          ];
        default:
          return [];
      }
    };

    const gridPositions = getGridPositionsForPlayerCount(totalPlayers);
    const result = [];

    for (let i = 0; i < totalPlayers; i++) {
      const playerData = sortedPlayers[i];
      const turn = playerTurn === playerData.order;
      const gridPosition = gridPositions[i] || "";

      result.push({ player: playerData, turn, gridPosition });
    }

    return result;
  };

  const visiblePlayers = getVisiblePlayersWithGridPositions();

  return (
    <div
      data-testid="table"
      className="absolute top-0 left-0 w-full h-2/3 grid grid-cols-3 grid-rows-3 gap-4 p-8"
    >
      {visiblePlayers.map(({ player: playerData, turn, gridPosition }) => (
        <div
          key={playerData.id}
          className={`${gridPosition} flex items-center justify-center`}
        >
          <Player player={playerData} hasCurrentTurn={turn} />
        </div>
      ))}

      {/* Center position for draw/discard pile - always in the middle */}
      <div className="col-start-2 row-start-2 flex items-center justify-center">
        {/* Draw/Discard pile will go here */}
      </div>
    </div>
  );
}
