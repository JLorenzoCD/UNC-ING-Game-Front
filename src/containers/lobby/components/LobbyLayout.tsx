import type { ReactNode } from "react";

import Container from "@/components/Container";
import Button from "@/components/Button";

import logoGame from "@/assets/logo.png";
import type { Match } from "@/types/match";

interface Props {
  children: ReactNode;
  match: Match;
  isOwner: boolean;
  startGame: () => Promise<void>;
}

function LobbyLayout({ children, startGame, isOwner, match }: Props) {
  const handleClick = () => {
    // Errores se manejan en el startGame
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
          {isOwner && <Button onClick={handleClick}>Start game</Button>}
        </Container>
      </header>
      <main className='relative flex-grow bg-[url("src/assets/fondopartida.jpeg")] bg-cover bg-center flex justify-center items-center -z-20'>
        <div className="absolute inset-0 bg-black opacity-45 -z-10"></div>

        <section>
          <h1 className="text-6xl text-white text-center mb-10">
            &quot;{match.name}&quot; ({match.min_players}/{match.max_players})
          </h1>
          <Container className="flex gap-8 flex-wrap justify-center items-center max-w-[600px]">
            {children}
          </Container>
        </section>
      </main>
    </div>
  );
}

export default LobbyLayout;
