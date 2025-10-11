import type { ReactNode } from "react";

import type { MatchWithPlayerCount } from "@/types/match";
import Container from "@/components/Container";
import Button from "@/components/Button";

import logoGame from "@/assets/logo.png";
import backgroundGame from "@/assets/background.png";

interface Props {
  match: MatchWithPlayerCount;
  isOwner: boolean;
  startGame: () => Promise<void>;

  children: ReactNode;
}

export default function LobbyLayout({
  children,
  startGame,
  isOwner,
  match,
}: Props) {
  const handleClick = () => {
    if (
      match.current_player_count < match.min_players ||
      match.status.toUpperCase() !== "WAITING" ||
      !isOwner
    ) {
      alert(
        "The game cannot be started if the minimum number of players desired is not reached.",
      );

      return;
    }

    startGame();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <Container className="m-5 flex justify-between items-center max-w-[1200px] px-4">
          <img
            src={logoGame}
            alt="AGATHA CHRISTIE'S - DEATH ON THE CARDS"
            className="w-[210px]"
          />
          {isOwner && (
            <Button
              onClick={handleClick}
              disabled={match.current_player_count < match.min_players}
            >
              Start game
            </Button>
          )}
        </Container>
      </header>

      <main
        className="relative flex-grow bg-cover bg-center flex justify-center items-center -z-20"
        style={{ backgroundImage: `url(${backgroundGame})` }}
      >
        <div className="absolute inset-0 bg-black opacity-45 -z-10"></div>

        <section>
          <div className="flex justify-center items-center flex-col mb-10 gap-3">
            <h1 className="text-6xl text-white text-center">
              &quot;{match.name}&quot;
            </h1>
            <span className="text-white text-2xl">
              ({match.min_players}/{match.max_players}){" "}
              {match.current_player_count >= match.min_players ? "🟢" : "🟡"}{" "}
              {match.current_player_count}
            </span>
          </div>
          <Container className="flex gap-8 flex-wrap justify-center items-center max-w-[600px]">
            {children}
          </Container>
        </section>
      </main>
    </div>
  );
}
