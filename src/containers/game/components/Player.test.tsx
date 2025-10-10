import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import Player from "./Player";

import avatarPoirot from "@/assets/avatars/icono4.png";
import avatarQuin from "@/assets/avatars/icono1.png";

const mockPlayer: GamePlayer = {
  id: "c582d4e4-4581-4b81-a1ef-fa17fc9599fe",
  name: "TestPlayer",
  avatar: avatarPoirot,
  birthday: new Date("2003-10-07"),
  player_id: crypto.randomUUID(),
  match_id: crypto.randomUUID(),
  role: "MURDERER",
  order: 1,
};

const mockPlayerWithLongName: GamePlayer = {
  id: "9e1f004d-44f7-4efa-b7a3-17883fb53769",
  name: "Thisisaverylongplayernamethatshouldbetruncated",
  avatar: avatarQuin,
  birthday: new Date("2010-01-25"),
  player_id: crypto.randomUUID(),
  match_id: crypto.randomUUID(),
  role: "INNOCENT",
  order: 3,
};

describe("Players Component", () => {
  const defaultPosition = { x: 100, y: 200 };

  it("should render player with avatar", () => {
    render(
      <Player
        player={mockPlayer}
        position={defaultPosition}
        hasCurrentTurn={false}
      />,
    );

    const avatar = screen.getByAltText("Avatar de TestPlayer");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", avatarPoirot);

    const playerName = screen.getByText("TestPlayer");
    expect(playerName).toBeInTheDocument();
  });

  it("should truncate long player names", () => {
    render(
      <Player
        player={mockPlayerWithLongName}
        position={defaultPosition}
        hasCurrentTurn={false}
      />,
    );

    const truncatedName = screen.getByText("Thisisaver...");
    expect(truncatedName).toBeInTheDocument();

    expect(truncatedName).toHaveAttribute(
      "title",
      "Thisisaverylongplayernamethatshouldbetruncated",
    );
  });

  it("should position player correctly", () => {
    const position = { x: 300, y: 400 };
    const { container } = render(
      <Player player={mockPlayer} position={position} hasCurrentTurn={false} />,
    );

    const playerDiv = container.firstChild as HTMLElement;
    expect(playerDiv).toHaveStyle({
      left: "300px",
      top: "400px",
    });
  });

  it("should show green pulsing border when it is player's turn", () => {
    const { container } = render(
      <Player
        player={mockPlayer}
        position={defaultPosition}
        hasCurrentTurn={true}
      />,
    );
    const avatarContainer = container.querySelector(
      ".relative.w-15.h-15.rounded-full.border-4",
    );

    expect(avatarContainer).toBeInTheDocument();
    expect(avatarContainer).toHaveClass("border-green-400");
    expect(avatarContainer).toHaveClass("shadow-lg");
    expect(avatarContainer).toHaveClass("shadow-green-400/50");
    expect(avatarContainer).toHaveClass("animate-pulse");
  });

  it("should not show green border when it is not player's turn", () => {
    const { container } = render(
      <Player
        player={mockPlayer}
        position={defaultPosition}
        hasCurrentTurn={false}
      />,
    );

    const avatarContainer = container.querySelector(
      ".relative.w-15.h-15.rounded-full.border-4",
    );

    expect(avatarContainer).toBeInTheDocument();

    expect(avatarContainer).not.toHaveClass("border-green-400");
    expect(avatarContainer).not.toHaveClass("shadow-green-400/50");
    expect(avatarContainer).not.toHaveClass("animate-pulse");
  });

  describe("Secrets display", () => {
    const mockSecrets: GameSecret[] = [
      {
        id: crypto.randomUUID(),
        type: "INNOCENT",
        content: "You are innocent",
        match_id: crypto.randomUUID(),
        secret_id: crypto.randomUUID(),
        player_id: mockPlayer.id,
        is_revealed: false,
      },
      {
        id: crypto.randomUUID(),
        type: "MURDERER",
        content: "You are the murderer",
        match_id: crypto.randomUUID(),
        secret_id: crypto.randomUUID(),
        player_id: mockPlayer.id,
        is_revealed: false,
      },
    ];

    it("should render secrets when provided", () => {
      render(
        <Player
          player={mockPlayer}
          position={defaultPosition}
          hasCurrentTurn={false}
          secrets={mockSecrets}
        />,
      );

      const secretsComponent = screen.getByTestId("secrets");
      const secretCards = screen.getAllByAltText("Secret card (hidden)");
      expect(secretsComponent).toBeInTheDocument();
      expect(secretCards).toHaveLength(mockSecrets.length);
    });

    it("should not render secrets section when no secrets provided", () => {
      render(
        <Player
          player={mockPlayer}
          position={defaultPosition}
          hasCurrentTurn={false}
        />,
      );

      const secretsComponent = screen.queryByTestId("mock-secrets");
      expect(secretsComponent).not.toBeInTheDocument();
    });

    it("should not render secrets section when empty array provided", () => {
      render(
        <Player
          player={mockPlayer}
          position={defaultPosition}
          hasCurrentTurn={false}
          secrets={[]}
        />,
      );

      const secretsComponent = screen.queryByTestId("mock-secrets");
      expect(secretsComponent).not.toBeInTheDocument();
    });

    it("should position secrets with correct margin", () => {
      const { container } = render(
        <Player
          player={mockPlayer}
          position={defaultPosition}
          hasCurrentTurn={false}
          secrets={mockSecrets}
        />,
      );

      const secretsContainer = container.querySelector(".mt-10");
      expect(secretsContainer).toBeInTheDocument();
    });
  });
});
