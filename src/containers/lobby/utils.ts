import type { Player } from "@/types/player";

export function fillAndShufflePlayers(
  players: Player[],
  max_players: number,
): (Player | null)[] {
  let playersToView: (Player | null)[];

  // Se rellena el arreglo haste tener la maxima cantidad de jugadores deseados
  if (players.length < max_players) {
    const emptySlotsCount = max_players - players.length;
    playersToView = [...players, ...new Array(emptySlotsCount).fill(null)];
  } else {
    playersToView = players;
  }

  // Se mezcla el arreglo para mostrarlo en el lobby de forma random
  playersToView.sort(() => 0.5 - Math.random());

  return playersToView;
}
