import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

import avatarPoirot from "@/assets/avatars/icono4.png";
import avatarQuin from "@/assets/avatars/icono1.png";

import type { GamePlayer } from "@/types/player";

import Player from "./Player";

vi.mock("../utils/player", () => ({
  getBoderPlayer: vi.fn(() => "mock-border-class"),
  truncateName: vi.fn((name, maxLength = 10) => {
    const len = maxLength || 10;
    return name.length > len ? `${name.slice(0, len)}...` : name;
  }),
}));

import { getBoderPlayer, truncateName } from "../utils/player";
const mockGetBoderPlayer = getBoderPlayer as Mock;
const mockTruncateName = truncateName as Mock;

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
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBoderPlayer.mockClear();
    mockTruncateName.mockClear();
    mockIsSelectablePlayer.mockClear();
    mockOnSelectTargetEvent.mockClear();

    mockIsSelectablePlayer.mockReturnValue(false);
  });

  it("should render player with avatar and apply the mocked border class", () => {
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

    const avatar = screen.getByAltText("Avatar de TestPlayer");
    expect(avatar).toBeInTheDocument();

    const avatarContainer = container.querySelector(
      ".w-20.h-20.rounded-full.border-4",
    );
    expect(avatarContainer).toHaveClass("mock-border-class");

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

  it("should apply the mocked border class when it is player's turn (logic handled by util)", () => {
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

    // Solo se verifica la clase mockeada
    expect(avatarContainer).toHaveClass("mock-border-class");
    // Se verifica que las clases específicas no están aquí
    expect(avatarContainer).not.toHaveClass("border-green-400");
  });

  it("should call onSelectTargetEvent with the player object when clicked", () => {
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
    const avatarContainer = avatar.parentElement as HTMLElement;

    fireEvent.click(avatarContainer);

    expect(mockOnSelectTargetEvent).toHaveBeenCalledTimes(1);
    expect(mockOnSelectTargetEvent).toHaveBeenCalledWith(mockPlayer);
  });

  describe("Utility Function Integration", () => {
    it("should call getBoderPlayer with correct arguments in player selection mode (isSelectingTarget branch)", () => {
      // isActivePlayerSelection = TRUE, isSelectable = TRUE, isSelectingTarget = TRUE
      mockIsSelectablePlayer.mockReturnValue(true);

      render(
        <Player
          player={mockPlayer}
          hasCurrentTurn={false}
          secrets={[]}
          sets={[]}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isPlayerEvent={true}
          isTargetSecret={false}
          target={null}
        />,
      );

      expect(mockGetBoderPlayer).toHaveBeenCalledWith(
        false, // hasCurrentTurn
        true, // isActivePlayerSelection (true && !false)
        true, // isSelectable (mock retorna true)
        false, // isTarget (target es null)
        true, // isSelectingTarget (target es null)
      );

      // Verificamos que la clase mockeada se aplica
      const avatarContainer = screen.getByAltText(
        `Avatar de ${mockPlayer.name}`,
      ).parentElement;
      expect(avatarContainer).toHaveClass("mock-border-class");
    });

    it("should call getBoderPlayer with correct arguments when player has the current turn", () => {
      // hasCurrentTurn = TRUE, isActivePlayerSelection = FALSE
      mockIsSelectablePlayer.mockReturnValue(false);

      render(
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

      expect(mockGetBoderPlayer).toHaveBeenCalledWith(
        true, // hasCurrentTurn
        false, // isActivePlayerSelection (false && !true)
        false, // isSelectable (mock retorna false)
        false, // isTarget
        true, // isSelectingTarget
      );
    });

    it("should call truncateName with the player name and max length of 10", () => {
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

      // Player.tsx llama a truncateName con un maxLength de 10
      expect(mockTruncateName).toHaveBeenCalledWith(
        mockPlayerWithLongName.name,
        10,
      );
    });
  });
});
