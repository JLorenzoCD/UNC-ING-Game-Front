import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import Players from "./Players";
import type { GamePlayer } from "@/types/player";

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
    render(<Players player={mockPlayer} position={defaultPosition} />);

    const avatar = screen.getByAltText("Avatar de TestPlayer");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", avatarPoirot);

    const playerName = screen.getByText("TestPlayer");
    expect(playerName).toBeInTheDocument();
  });

  it("should truncate long player names", () => {
    render(
      <Players player={mockPlayerWithLongName} position={defaultPosition} />,
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
      <Players player={mockPlayer} position={position} />,
    );

    const playerDiv = container.firstChild as HTMLElement;
    expect(playerDiv).toHaveStyle({
      left: "300px",
      top: "400px",
    });
  });
});
