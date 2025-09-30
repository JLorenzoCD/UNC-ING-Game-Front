import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import type { GamePlayer } from "@/types/player";
import { usePlayer } from "@/contexts/PlayerContext";
import { useGame } from "@/contexts/GameContext";
import Table from "./Table";

import avatarPoirot from "@/assets/avatars/icono4.png";
import avatarQuin from "@/assets/avatars/icono1.png";
import avatarMarple from "@/assets/avatars/icono7.png";

// Mocks de los hooks de contexto
vi.mock("@/contexts/PlayerContext");
vi.mock("@/contexts/GameContext");

const mockUsePlayer = vi.mocked(usePlayer);
const mockUseGame = vi.mocked(useGame);

// Mock de window dimensions
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });
};

describe("Table Component", () => {
  const mockCurrentPlayer: GamePlayer = {
    id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
    name: "PlayerSession",
    avatar: avatarMarple,
    birthday: new Date("2000-10-03"),
    player_id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
    match_id: crypto.randomUUID(),
    role: "MURDERER",
    order: 2,
  };

  const mockPlayers: GamePlayer[] = [
    {
      id: "7fd66e40-249c-4e51-8028-25454c046ed4",
      name: "Player-1",
      avatar: avatarPoirot,
      birthday: new Date("1980-09-07"),
      player_id: "7fd66e40-249c-4e51-8028-25454c046ed4",
      match_id: crypto.randomUUID(),
      role: "INNOCENT",
      order: 1,
    },
    {
      id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
      name: "PlayerSession",
      avatar: avatarMarple,
      birthday: new Date("2000-10-03"),
      player_id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
      match_id: crypto.randomUUID(),
      role: "MURDERER",
      order: 2,
    },
    {
      id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
      name: "Player-2",
      avatar: avatarQuin,
      birthday: new Date("1995-12-04"),
      player_id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
      match_id: crypto.randomUUID(),
      role: "INNOCENT",
      order: 3,
    },
  ];

  const twoPlayersList = [
    {
      id: "7fd66e40-249c-4e51-8028-25454c046ed4",
      name: "Player-1",
      avatar: avatarPoirot,
      birthday: new Date("1980-09-07"),
      player_id: "7fd66e40-249c-4e51-8028-25454c046ed4",
      match_id: crypto.randomUUID(),
      role: "INNOCENT",
      order: 1,
    },
    {
      id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
      name: "PlayerSession",
      avatar: avatarMarple,
      birthday: new Date("2000-10-03"),
      player_id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
      match_id: crypto.randomUUID(),
      role: "MURDERER",
      order: 2,
    },
  ];

  beforeEach(() => {
    mockWindowDimensions(1024, 768);

    mockUsePlayer.mockReturnValue({
      player: mockCurrentPlayer,
      setPlayer: vi.fn(),
    } as ReturnType<typeof usePlayer>);

    mockUseGame.mockReturnValue({
      players: mockPlayers,
      match: null,
      cards: [],
      secrets: [],
      isLoading: false,
      hasError: false,
      error: null,
    } as ReturnType<typeof useGame>);

    // Mock de addEventListener y removeEventListener
    vi.spyOn(window, "addEventListener").mockImplementation(() => {});
    vi.spyOn(window, "removeEventListener").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render visible players excluding session player", () => {
    render(<Table />);

    expect(screen.queryByText("PlayerSession")).toBeNull();

    expect(screen.getByText("Player-1")).toBeInTheDocument();
    expect(screen.getByText("Player-2")).toBeInTheDocument();
  });

  it("should handle window resize", () => {
    const { rerender } = render(<Table />);

    // Simular cambio de tamaño de ventana
    act(() => {
      mockWindowDimensions(1200, 900);
      window.dispatchEvent(new Event("resize"));
    });

    rerender(<Table />);

    expect(screen.getByText("Player-1")).toBeInTheDocument();
    expect(screen.getByText("Player-2")).toBeInTheDocument();
  });

  it("should position players correctly for 2 players", () => {
    mockUseGame.mockReturnValue({
      players: twoPlayersList,
      match: null,
      cards: [],
      secrets: [],
      isLoading: false,
      hasError: false,
      error: null,
    } as ReturnType<typeof useGame>);

    render(<Table />);

    const player1Name = screen.getByText("Player-1");
    const player1Container = player1Name.closest(".absolute");

    expect(player1Container).toHaveStyle({ left: "467px", top: "-500px" });
  });

  it("should handle empty players list", () => {
    mockUseGame.mockReturnValue({
      players: [mockCurrentPlayer],
      match: null,
      cards: [],
      secrets: [],
      isLoading: false,
      hasError: false,
      error: null,
    } as ReturnType<typeof useGame>);

    const { container } = render(<Table />);

    // No debería haber jugadores visibles (solo el div contenedor vacío)
    const playerContainers = container.querySelectorAll(".absolute.transform");
    expect(playerContainers).toHaveLength(0);
  });

  it("should clean up event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<Table />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });

  it("should render players with correct avatar images", () => {
    render(<Table />);

    const player1Avatar = screen.getByAltText("Avatar de Player-1");
    const player2Avatar = screen.getByAltText("Avatar de Player-2");

    expect(player1Avatar).toBeInTheDocument();
    expect(player1Avatar).toHaveAttribute("src", avatarPoirot);
    expect(player2Avatar).toBeInTheDocument();
    expect(player2Avatar).toHaveAttribute("src", avatarQuin);
  });
});
