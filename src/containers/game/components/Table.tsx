import { useGame } from "@/contexts/GameContext";

import Player from "./Player";

import type { GamePlayer, Player as PlayerSchema } from "@/types/player";

const GRID_OTHER_PLAYERS = {
  1: ["col-start-3 row-start-1 flex justify-center items-center"],
  2: [
    "col-start-2 row-start-1 flex justify-center items-center",
    "col-start-4 row-start-1 flex justify-center items-center",
  ],
  3: [
    "col-start-1 row-start-1 flex justify-center items-center",
    "col-start-3 row-start-1 flex justify-center items-center",
    "col-start-5 row-start-1 flex justify-center items-center",
  ],
  4: [
    "col-start-1 row-start-2 flex justify-center items-center",
    "col-start-2 row-start-1 flex justify-center items-center",
    "col-start-4 row-start-1 flex justify-center items-center",
    "col-start-5 row-start-2 flex justify-center items-center",
  ],
  5: [
    "col-start-1 row-start-2 flex justify-center items-center",
    "col-start-2 row-start-1 flex justify-center items-center",
    "col-start-3 row-start-1 flex justify-center items-center",
    "col-start-4 row-start-1 flex justify-center items-center",
    "col-start-5 row-start-2 flex justify-center items-center",
  ],
} as { [key: number]: string[] };

function getPlayersInOrder(players: GamePlayer[], currPlayer: PlayerSchema) {
  const currPlayerOrder = players.find((p) => p.id === currPlayer.id)
    ?.order as number;

  // Ordeno los jugadores en base a su orden, de forma ascendente
  const playersInOrder = players.sort(
    (p1, p2) => (p1.order as number) - (p2.order as number),
  );

  // Sin contar a el jugador actual
  const playersInOrderModuleCurrPlayer = [
    ...playersInOrder.slice(currPlayerOrder),
    ...playersInOrder.slice(0, currPlayerOrder - 1),
  ];

  return playersInOrderModuleCurrPlayer;
}

interface Props {
  player: PlayerSchema;
}

export default function Table({ player }: Props) {
  const { match, players, secrets, sets } = useGame();

  const playersOrder = getPlayersInOrder(players, player);
  return (
    <>
      {playersOrder.map((p, index) => {
        const playerSecrets = secrets.filter((s) => p.id === s.player_id);
        const playerSets = sets.filter((s) => p.id === s.player_id);

        const lenOtherPlayers = playersOrder.length;
        const positionGrid = GRID_OTHER_PLAYERS[lenOtherPlayers][index];

        return (
          <Player
            key={p.id}
            player={p}
            secrets={playerSecrets}
            sets={playerSets}
            hasCurrentTurn={match?.current_player_order == p.order}
            positionClassName={positionGrid}
          />
        );
      })}
    </>
  );
}
