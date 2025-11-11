import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

import avatarPoirot from "@/assets/avatars/icono4.png";
import avatarQuin from "@/assets/avatars/icono1.png";

import type { GamePlayer } from "@/types/player";

import { getPlayerBorderClass, truncateName } from "../utils/player";

import Player from "./Player";

vi.mock("../utils/player", () => ({
  getPlayerBorderClass: vi.fn(() => "mock-border-class"),
  truncateName: vi.fn((name, maxLength = 10) => {
    const len = maxLength || 10;
    return name.length > len ? `${name.slice(0, len)}...` : name;
  }),
}));

const mockGetPlayerBorderClass = getPlayerBorderClass as Mock;
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
const mockIsSelectableSet = vi.fn();

describe("Players Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTruncateName.mockClear();
    mockGetPlayerBorderClass.mockClear();
    mockOnSelectTargetEvent.mockClear();
    mockIsSelectablePlayer.mockClear();
    mockIsSelectableSet.mockClear();
    mockIsSelectableSecret.mockClear();

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
        isSelectableSet={mockIsSelectableSet}
        isTargetSet={false}
        isPlayerEvent={false}
        isTargetSecret={false}
        shouldHighlightRole={false}
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
        isSelectableSet={mockIsSelectableSet}
        isPlayerEvent={false}
        isTargetSecret={false}
        isTargetSet={false}
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
        isSelectableSet={mockIsSelectableSet}
        isPlayerEvent={false}
        isTargetSecret={false}
        isTargetSet={false}
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
        isSelectableSet={mockIsSelectableSet}
        isPlayerEvent={false}
        isTargetSecret={false}
        isTargetSet={false}
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
          isSelectableSet={mockIsSelectableSet}
          isPlayerEvent={true}
          isTargetSecret={false}
          isTargetSet={false}
          target={null}
        />,
      );

      // Orden: isTarget, isSelectable, isSelectingTarget, hasCurrentTurn, shouldHighlightRole, isActivePlayerSelection
      expect(mockGetPlayerBorderClass).toHaveBeenCalledWith(
        false, // isTarget (target es null)
        true, // isSelectable (mock retorna true)
        true, // isSelectingTarget (target es null)
        false, // hasCurrentTurn
        false, // shouldHighlightRole (default)
        true, // isActivePlayerSelection (true && !false)
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
          isSelectableSet={mockIsSelectableSet}
          isPlayerEvent={false}
          isTargetSecret={false}
          isTargetSet={false}
          target={null}
        />,
      );

      // Orden: isTarget, isSelectable, isSelectingTarget, hasCurrentTurn, shouldHighlightRole, isActivePlayerSelection
      expect(mockGetPlayerBorderClass).toHaveBeenCalledWith(
        false, // isTarget
        false, // isSelectable (mock retorna false)
        true, // isSelectingTarget
        true, // hasCurrentTurn
        false, // shouldHighlightRole (default)
        false, // isActivePlayerSelection (false && !true)
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
          isSelectableSet={mockIsSelectableSet}
          isPlayerEvent={false}
          isTargetSecret={false}
          isTargetSet={false}
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

  describe("Role Highlighting", () => {
    it("should call getPlayerBorderClass with shouldHighlightRole=true when prop is passed", () => {
      mockIsSelectablePlayer.mockReturnValue(false);

      render(
        <Player
          player={mockPlayer}
          hasCurrentTurn={false}
          secrets={[]}
          sets={[]}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isSelectableSet={mockIsSelectableSet}
          isPlayerEvent={false}
          isTargetSecret={false}
          isTargetSet={false}
          target={null}
          shouldHighlightRole={true}
        />,
      );

      expect(mockGetPlayerBorderClass).toHaveBeenCalledWith(
        false, // isTarget
        false, // isSelectable
        true, // isSelectingTarget
        false, // hasCurrentTurn
        true, // shouldHighlightRole
        false, // isActivePlayerSelection
      );
    });

    it("should call getPlayerBorderClass with shouldHighlightRole=false when prop is not passed", () => {
      mockIsSelectablePlayer.mockReturnValue(false);

      render(
        <Player
          player={mockPlayer}
          hasCurrentTurn={false}
          secrets={[]}
          sets={[]}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isSelectableSet={mockIsSelectableSet}
          isPlayerEvent={false}
          isTargetSecret={false}
          isTargetSet={false}
          target={null}
        />,
      );

      expect(mockGetPlayerBorderClass).toHaveBeenCalledWith(
        false, // isTarget
        false, // isSelectable
        true, // isSelectingTarget
        false, // hasCurrentTurn
        false, // shouldHighlightRole (default)
        false, // isActivePlayerSelection
      );
    });
  });

  describe("Role Icons", () => {
    const murdererPlayer: GamePlayer = {
      ...mockPlayer,
      role: "MURDERER",
    };

    const accomplicePlayer: GamePlayer = {
      ...mockPlayer,
      id: crypto.randomUUID(),
      role: "ACCOMPLICE",
    };

    const innocentPlayer: GamePlayer = {
      ...mockPlayer,
      id: crypto.randomUUID(),
      role: "INNOCENT",
    };

    it("should show knife icon for MURDERER when shouldHighlightRole is true", () => {
      const { container } = render(
        <Player
          player={murdererPlayer}
          hasCurrentTurn={false}
          secrets={[]}
          sets={[]}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isSelectableSet={mockIsSelectableSet}
          isPlayerEvent={false}
          isTargetSecret={false}
          isTargetSet={false}
          target={null}
          shouldHighlightRole={true}
        />,
      );

      // Verificar que el ícono de cuchillo está presente
      const knifeIcon = container.querySelector("svg");
      expect(knifeIcon).toBeInTheDocument();
    });

    it("should show ghost icon for ACCOMPLICE when shouldHighlightRole is true", () => {
      const { container } = render(
        <Player
          player={accomplicePlayer}
          hasCurrentTurn={false}
          secrets={[]}
          sets={[]}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isSelectableSet={mockIsSelectableSet}
          isPlayerEvent={false}
          isTargetSecret={false}
          isTargetSet={false}
          target={null}
          shouldHighlightRole={true}
        />,
      );

      // Verificar que el ícono de fantasma está presente
      const ghostIcon = container.querySelector("svg");
      expect(ghostIcon).toBeInTheDocument();
    });

    it("should NOT show role icon for INNOCENT even when shouldHighlightRole is true", () => {
      const { container } = render(
        <Player
          player={innocentPlayer}
          hasCurrentTurn={false}
          secrets={[]}
          sets={[]}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isSelectableSet={mockIsSelectableSet}
          isPlayerEvent={false}
          isTargetSecret={false}
          isTargetSet={false}
          target={null}
          shouldHighlightRole={true}
        />,
      );

      // Verificar que NO hay ningún ícono para inocente
      const icon = container.querySelector("svg");
      expect(icon).not.toBeInTheDocument();
    });

    it("should NOT show role icon for MURDERER when shouldHighlightRole is false", () => {
      const { container } = render(
        <Player
          player={murdererPlayer}
          hasCurrentTurn={false}
          secrets={[]}
          sets={[]}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isSelectableSet={mockIsSelectableSet}
          isPlayerEvent={false}
          isTargetSecret={false}
          isTargetSet={false}
          target={null}
          shouldHighlightRole={false}
        />,
      );

      // Verificar que NO hay ningún ícono cuando no se debe resaltar
      const icon = container.querySelector("svg");
      expect(icon).not.toBeInTheDocument();
    });

    it("should NOT show role icon for ACCOMPLICE when shouldHighlightRole is false", () => {
      const { container } = render(
        <Player
          player={accomplicePlayer}
          hasCurrentTurn={false}
          secrets={[]}
          sets={[]}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isSelectableSet={mockIsSelectableSet}
          isPlayerEvent={false}
          isTargetSecret={false}
          isTargetSet={false}
          target={null}
          shouldHighlightRole={false}
        />,
      );

      // Verificar que NO hay ningún ícono cuando no se debe resaltar
      const icon = container.querySelector("svg");
      expect(icon).not.toBeInTheDocument();
    });

    it("should NOT show role icon when shouldHighlightRole is undefined (defaults to false)", () => {
      const { container } = render(
        <Player
          player={murdererPlayer}
          hasCurrentTurn={false}
          secrets={[]}
          sets={[]}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectablePlayer={mockIsSelectablePlayer}
          isSelectableSecret={mockIsSelectableSecret}
          isSelectableSet={mockIsSelectableSet}
          isPlayerEvent={false}
          isTargetSecret={false}
          isTargetSet={false}
          target={null}
        />,
      );

      // Verificar que NO hay ningún ícono cuando no se proporciona shouldHighlightRole
      const icon = container.querySelector("svg");
      expect(icon).not.toBeInTheDocument();
    });
  });
});
