import { Outlet } from "react-router";

import Container from "@/components/Container";

import logoGame from "@/assets/logo.png";

export default function MainLayout() {
  return (
    <>
      <header className="w-full pt-4 flex items-center justify-center">
        <img
          src={logoGame}
          alt="AGATHA CHRISTIE'S - DEATH ON THE CARDS"
          width={384}
        />
      </header>
      <main>
        <Container className="pt-5">
          <Outlet />
        </Container>
      </main>
    </>
  );
}
