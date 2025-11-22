import type { ReactNode } from "react";

import { useBasicGame } from "@/contexts/BasicGameContext";
import { usePlayer } from "@/contexts/PlayerContext";

import Player from "./Player";

import { getVisiblePlayersWithGridPositions } from "../utils/tablePositions";

import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";

interface TableProps {
  onSelectTargetEvent: (target: GamePlayer | GameSecret | MatchSet) => void;
  isSelectablePlayer: (player: GamePlayer) => boolean;
  isSelectableSecret: (secret: GameSecret) => boolean;
  isSelectableSet: (set: MatchSet) => boolean;

  draft: ReactNode;
  drawPile: ReactNode;
  discardPile: ReactNode;
  isEvent: boolean;
  isTargetPlayer: boolean;
  isTargetSecret: boolean;
  isTargetSet: boolean;
  target: GamePlayer | GameSecret | MatchSet | null;
}

export default function Table({
  onSelectTargetEvent,
  isSelectablePlayer,
  isSelectableSecret,
  isSelectableSet,

  draft,
  drawPile,
  discardPile,
  isEvent,
  isTargetPlayer,
  isTargetSecret,
  isTargetSet,
  target,
}: TableProps) {
  const { player } = usePlayer();
  const { players, match, secrets, sets } = useBasicGame();

  const visiblePlayers = getVisiblePlayersWithGridPositions(
    player,
    players,
    match,
    secrets,
    sets,
  );

  const currentMatchPlayer = players.find((p) => p.id === player?.id);
  const currentMatchPlayerRole = currentMatchPlayer?.role ?? "INNOCENT";

  return (
    <>
      {/* Los demás jugadores (de 1 a 5 jugadores además del actual) */}
      {visiblePlayers.map(
        ({ turn, position, playerData, playerSets, playerSecrets }) => {
          // Si el jugador actual es el Asesino o el Cómplice,
          // se resalta al otro jugador con rol especial.
          const shouldHighlightRole =
            currentMatchPlayerRole !== "INNOCENT" &&
            playerData.role !== "INNOCENT";

          return (
            <div
              key={playerData.id}
              className={`${position} flex items-center justify-center`}
            >
              <Player
                isSelectablePlayer={isSelectablePlayer}
                onSelectTargetEvent={onSelectTargetEvent}
                isSelectableSecret={isSelectableSecret}
                isSelectableSet={isSelectableSet}
                sets={playerSets}
                player={playerData}
                hasCurrentTurn={turn}
                secrets={playerSecrets}
                isPlayerEvent={isEvent && isTargetPlayer}
                isTargetSecret={isEvent && isTargetSecret}
                isTargetSet={isEvent && isTargetSet}
                target={target}
                shouldHighlightRole={shouldHighlightRole}
              />
            </div>
          );
        },
      )}

      {/* Las pilas están fijas en el centro de la pantalla. */}
      <div className="col-start-2 row-start-2 flex flex-col justify-center items-center gap-y-4">
        <div className="flex justify-center items-center gap-x-3">
          {drawPile}
          {discardPile}
        </div>

        {draft}
      </div>
    </>
  );
}
