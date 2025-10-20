import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import Player from "./Player";

import avatarPoirot from "@/assets/avatars/icono4.png";
import avatarQuin from "@/assets/avatars/icono1.png";
import type { MatchSet } from "@/types/set";

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

const MATCH_ID = crypto.randomUUID();
const PLAYER_ID = crypto.randomUUID();

const mockSets = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    type: "HERCULE POIROT",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    type: "MISS MARPLE",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: true,
  },
] as unknown as MatchSet[];

vi.mock("./Secrets", () => ({
  __esModule: true,
  default: vi.fn(({ secrets }) => (
    <div data-testid="mock-secrets">
      Secrets Component - Secrets: {secrets.length}
    </div>
  )),
}));
vi.mock("./Sets", () => ({
  __esModule: true,
  default: vi.fn(({ sets }) => (
    <div data-testid="mock-sets">Sets Component - Sets: {sets.length}</div>
  )),
}));

const mockOnSelectTargetEvent = vi.fn();
const mockIsSelectablePlayer = vi.fn();
const mockIsSelectableSecret = vi.fn();

describe("Players Component", () => {
  it("should render player with avatar", () => {
    render(
      <Player
        player={mockPlayer}
        hasCurrentTurn={false}
        secrets={[]}
        sets={[]}
        onSelectTargetEvent={mockOnSelectTargetEvent}
        isSelectablePlayer={mockIsSelectablePlayer}
        isSelectableSecret={mockIsSelectableSecret}
        isPlayerEvent={false}
        isTargetSecret={false}
        target={null}
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
        hasCurrentTurn={false}
        secrets={[]}
        sets={[]}
        onSelectTargetEvent={mockOnSelectTargetEvent}
        isSelectablePlayer={mockIsSelectablePlayer}
        isSelectableSecret={mockIsSelectableSecret}
        isPlayerEvent={false}
        isTargetSecret={false}
        target={null}
      />,
    );

    const truncatedName = screen.getByText("Thisisaver...");
    expect(truncatedName).toBeInTheDocument();

    expect(truncatedName).toHaveAttribute(
      "title",
      "Thisisaverylongplayernamethatshouldbetruncated",
    );
  });

  it("should show green pulsing border when it is player's turn", () => {
    const { container } = render(
      <Player
        player={mockPlayer}
        hasCurrentTurn={true}
        secrets={[]}
        sets={[]}
        onSelectTargetEvent={mockOnSelectTargetEvent}
        isSelectablePlayer={mockIsSelectablePlayer}
        isSelectableSecret={mockIsSelectableSecret}
        isPlayerEvent={false}
        isTargetSecret={false}
        target={null}
      />,
    );
    const avatarContainer = container.querySelector(
      ".w-20.h-20.rounded-full.border-4",
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
        hasCurrentTurn={false}
        secrets={[]}
        sets={[]}
        onSelectTargetEvent={mockOnSelectTargetEvent}
        isSelectablePlayer={mockIsSelectablePlayer}
        isSelectableSecret={mockIsSelectableSecret}
        isPlayerEvent={false}
        isTargetSecret={false}
        target={null}
      />,
    );

    const avatarContainer = container.querySelector(
      ".w-20.h-20.rounded-full.border-4",
    );

    expect(avatarContainer).toBeInTheDocument();

    expect(avatarContainer).not.toHaveClass("border-green-400");
    expect(avatarContainer).not.toHaveClass("shadow-green-400/50");
    expect(avatarContainer).not.toHaveClass("animate-pulse");
  });

  describe("Secrets display", () => {
    it("should render secrets when provided", () => {
      render(
        <Player
          player={mockPlayer}
          hasCurrentTurn={false}
          secrets={mockSecrets}
          sets={[]}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isPlayerEvent={false}
          isTargetSecret={false}
          target={null}
        />,
      );

      const secretsComponent = screen.getByTestId("mock-secrets");
      expect(secretsComponent).toBeInTheDocument();
    });

    it("should render secrets component even with empty array", () => {
      render(
        <Player
          player={mockPlayer}
          hasCurrentTurn={false}
          secrets={[]}
          sets={[]}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isPlayerEvent={false}
          isTargetSecret={false}
          target={null}
        />,
      );

      // The Secrets component is always rendered now
      const secretsComponent = screen.getByTestId("mock-secrets");
      expect(secretsComponent).toBeInTheDocument();
    });
  });

  describe("Sets display", () => {
    it("should render sets when provided", () => {
      render(
        <Player
          player={mockPlayer}
          hasCurrentTurn={false}
          secrets={[]}
          sets={mockSets}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isPlayerEvent={false}
          isTargetSecret={false}
          target={null}
        />,
      );

      const setsComponent = screen.getByTestId("mock-sets");
      expect(setsComponent).toBeInTheDocument();
    });

    it("should render sets component even with empty array", () => {
      render(
        <Player
          player={mockPlayer}
          hasCurrentTurn={false}
          secrets={[]}
          sets={[]}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isPlayerEvent={false}
          isTargetSecret={false}
          target={null}
        />,
      );

      // The Sets component is always rendered now
      const setsComponent = screen.getByTestId("mock-sets");
      expect(setsComponent).toBeInTheDocument();
    });
  });
});
