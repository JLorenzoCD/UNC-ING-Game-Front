import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import type { GamePlayer } from "@/types/player";
import { usePlayer } from "@/contexts/PlayerContext";
import { useGame } from "@/contexts/GameContext";
import Table from "./Table";
import type { Mock } from "vitest";
import type { GameSecret } from "@/types/secret";

import avatarPoirot from "@/assets/avatars/icono4.png";
import avatarQuin from "@/assets/avatars/icono1.png";
import avatarMarple from "@/assets/avatars/icono7.png";
import avatarLady from "@/assets/avatars/icono2.png";
import avatarTuppence from "@/assets/avatars/icono3.png";
import avatarOliver from "@/assets/avatars/icono5.png";

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
    name: "CurrentPlayer",
    avatar: avatarMarple,
    birthday: new Date("2000-10-03"),
    player_id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
    match_id: crypto.randomUUID(),
    role: "MURDERER",
    order: 1,
  };

  beforeEach(() => {
    mockWindowDimensions(1024, 768);

    mockUsePlayer.mockReturnValue({
      player: mockCurrentPlayer,
      setPlayer: vi.fn(),
    } as ReturnType<typeof usePlayer>);

    // Mock real de addEventListener
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should register resize event listener on mount", () => {
    mockUseGame.mockReturnValue({
      players: [mockCurrentPlayer],
      match: null,
      cards: [],
      secrets: [],
      isLoading: false,
      hasError: false,
      error: null,
    } as ReturnType<typeof useGame>);

    render(<Table />);

    expect(window.addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });

  it("should position players correctly for 2 players", () => {
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

  it("should position players correctly for 3 players", () => {
    const threePlayers: GamePlayer[] = [
      {
        id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
        name: "CurrentPlayer",
        avatar: avatarMarple,
        birthday: new Date("2000-10-03"),
        player_id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
        match_id: crypto.randomUUID(),
        role: "MURDERER",
        order: 1,
      },
      {
        id: "7fd66e40-249c-4e51-8028-25454c046ed4",
        name: "Player2",
        avatar: avatarPoirot,
        birthday: new Date("1995-05-15"),
        player_id: "7fd66e40-249c-4e51-8028-25454c046ed4",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 2,
      },
      {
        id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
        name: "Player3",
        avatar: avatarQuin,
        birthday: new Date("1998-08-20"),
        player_id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 3,
      },
    ];

    mockUseGame.mockReturnValue({
      players: threePlayers,
      match: null,
      cards: [],
      secrets: [],
      isLoading: false,
      hasError: false,
      error: null,
    } as ReturnType<typeof useGame>);

    render(<Table />);

    expect(screen.getByText("Player2")).toBeInTheDocument();
    expect(screen.getByText("Player3")).toBeInTheDocument();
    expect(screen.queryByText("CurrentPlayer")).not.toBeInTheDocument();
  });

  it("should position players correctly for 4 players", () => {
    const fourPlayers: GamePlayer[] = [
      {
        id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
        name: "CurrentPlayer",
        avatar: avatarMarple,
        birthday: new Date("2000-10-03"),
        player_id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
        match_id: crypto.randomUUID(),
        role: "MURDERER",
        order: 1,
      },
      {
        id: "7fd66e40-249c-4e51-8028-25454c046ed4",
        name: "Player2",
        avatar: avatarPoirot,
        birthday: new Date("1995-05-15"),
        player_id: "7fd66e40-249c-4e51-8028-25454c046ed4",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 2,
      },
      {
        id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
        name: "Player3",
        avatar: avatarQuin,
        birthday: new Date("1998-08-20"),
        player_id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 3,
      },
      {
        id: "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
        name: "Player4",
        avatar: avatarLady,
        birthday: new Date("1992-03-10"),
        player_id: "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 4,
      },
    ];

    mockUseGame.mockReturnValue({
      players: fourPlayers,
      match: null,
      cards: [],
      secrets: [],
      isLoading: false,
      hasError: false,
      error: null,
    } as ReturnType<typeof useGame>);

    render(<Table />);

    expect(screen.getByText("Player2")).toBeInTheDocument();
    expect(screen.getByText("Player3")).toBeInTheDocument();
    expect(screen.getByText("Player4")).toBeInTheDocument();
    expect(screen.queryByText("CurrentPlayer")).not.toBeInTheDocument();
  });

  it("should position players correctly for 5 players", () => {
    const fivePlayers: GamePlayer[] = [
      {
        id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
        name: "CurrentPlayer",
        avatar: avatarMarple,
        birthday: new Date("2000-10-03"),
        player_id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
        match_id: crypto.randomUUID(),
        role: "MURDERER",
        order: 1,
      },
      {
        id: "7fd66e40-249c-4e51-8028-25454c046ed4",
        name: "Player2",
        avatar: avatarPoirot,
        birthday: new Date("1995-05-15"),
        player_id: "7fd66e40-249c-4e51-8028-25454c046ed4",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 2,
      },
      {
        id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
        name: "Player3",
        avatar: avatarQuin,
        birthday: new Date("1998-08-20"),
        player_id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 3,
      },
      {
        id: "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
        name: "Player4",
        avatar: avatarLady,
        birthday: new Date("1992-03-10"),
        player_id: "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 4,
      },
      {
        id: "f1e2d3c4-b5a6-4798-8a9b-c0d1e2f3a4b5",
        name: "Player5",
        avatar: avatarTuppence,
        birthday: new Date("1990-07-25"),
        player_id: "f1e2d3c4-b5a6-4798-8a9b-c0d1e2f3a4b5",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 5,
      },
    ];

    mockUseGame.mockReturnValue({
      players: fivePlayers,
      match: null,
      cards: [],
      secrets: [],
      isLoading: false,
      hasError: false,
      error: null,
    } as ReturnType<typeof useGame>);

    render(<Table />);

    expect(screen.getByText("Player2")).toBeInTheDocument();
    expect(screen.getByText("Player3")).toBeInTheDocument();
    expect(screen.getByText("Player4")).toBeInTheDocument();
    expect(screen.getByText("Player5")).toBeInTheDocument();
  });

  it("should position players correctly for 6 players", () => {
    const sixPlayers: GamePlayer[] = [
      {
        id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
        name: "CurrentPlayer",
        avatar: avatarMarple,
        birthday: new Date("2000-10-03"),
        player_id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
        match_id: crypto.randomUUID(),
        role: "MURDERER",
        order: 1,
      },
      {
        id: "7fd66e40-249c-4e51-8028-25454c046ed4",
        name: "Player2",
        avatar: avatarPoirot,
        birthday: new Date("1995-05-15"),
        player_id: "7fd66e40-249c-4e51-8028-25454c046ed4",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 2,
      },
      {
        id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
        name: "Player3",
        avatar: avatarQuin,
        birthday: new Date("1998-08-20"),
        player_id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 3,
      },
      {
        id: "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
        name: "Player4",
        avatar: avatarLady,
        birthday: new Date("1992-03-10"),
        player_id: "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 4,
      },
      {
        id: "f1e2d3c4-b5a6-4798-8a9b-c0d1e2f3a4b5",
        name: "Player5",
        avatar: avatarTuppence,
        birthday: new Date("1990-07-25"),
        player_id: "f1e2d3c4-b5a6-4798-8a9b-c0d1e2f3a4b5",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 5,
      },
      {
        id: "b2c3d4e5-f6a7-4b89-9c0d-1e2f3a4b5c6d",
        name: "Player6",
        avatar: avatarOliver,
        birthday: new Date("1988-11-30"),
        player_id: "b2c3d4e5-f6a7-4b89-9c0d-1e2f3a4b5c6d",
        match_id: crypto.randomUUID(),
        role: "INNOCENT",
        order: 6,
      },
    ];

    mockUseGame.mockReturnValue({
      players: sixPlayers,
      match: null,
      cards: [],
      secrets: [],
      isLoading: false,
      hasError: false,
      error: null,
    } as ReturnType<typeof useGame>);

    render(<Table />);

    expect(screen.getByText("Player2")).toBeInTheDocument();
    expect(screen.getByText("Player3")).toBeInTheDocument();
    expect(screen.getByText("Player4")).toBeInTheDocument();
    expect(screen.getByText("Player5")).toBeInTheDocument();
    expect(screen.getByText("Player6")).toBeInTheDocument();
  });

  it("should update dimensions on window resize", () => {
    mockUseGame.mockReturnValue({
      players: [mockCurrentPlayer],
      match: null,
      cards: [],
      secrets: [],
      isLoading: false,
      hasError: false,
      error: null,
    } as ReturnType<typeof useGame>);

    const { rerender } = render(<Table />);

    // Verificar que el addEventListener fue llamado
    expect(window.addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );

    // Obtener la función de callback
    const resizeCallback = (window.addEventListener as Mock).mock.calls[0][1];

    // Simular cambio de dimensiones
    mockWindowDimensions(1920, 1080);

    // Llamar al callback manualmente
    resizeCallback();

    rerender(<Table />);

    // Verificar que el componente sigue renderizando
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("should highlight player with current turn", () => {
    const matchId = crypto.randomUUID();
    const threePlayers: GamePlayer[] = [
      {
        id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
        name: "CurrentPlayer",
        avatar: avatarMarple,
        birthday: new Date("2000-10-03"),
        player_id: "dafcedef-fbdd-4248-9ed7-eeb45aa6f78d",
        match_id: matchId,
        role: "MURDERER",
        order: 1,
      },
      {
        id: "7fd66e40-249c-4e51-8028-25454c046ed4",
        name: "Player2",
        avatar: avatarPoirot,
        birthday: new Date("1995-05-15"),
        player_id: "7fd66e40-249c-4e51-8028-25454c046ed4",
        match_id: matchId,
        role: "INNOCENT",
        order: 2,
      },
      {
        id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
        name: "Player3",
        avatar: avatarQuin,
        birthday: new Date("1998-08-20"),
        player_id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
        match_id: matchId,
        role: "INNOCENT",
        order: 3,
      },
    ];

    mockUseGame.mockReturnValue({
      players: threePlayers,
      match: {
        id: matchId,
        name: "Test Match",
        current_player_order: 2,
        status: "IN_PROGRESS",
        min_players: 2,
        max_players: 5,
        owner_id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
      },
      cards: [],
      secrets: [],
      isLoading: false,
      hasError: false,
      error: null,
    } as ReturnType<typeof useGame>);

    render(<Table />);

    // Verificar que Player2 está destacado (tiene el turno)
    expect(screen.getByText("Player2")).toBeInTheDocument();
  });

  it("should handle SSR scenario with default dimensions", () => {
    mockUseGame.mockReturnValue({
      players: [mockCurrentPlayer],
      match: null,
      cards: [],
      secrets: [],
      isLoading: false,
      hasError: false,
      error: null,
    } as ReturnType<typeof useGame>);

    // Simular entorno SSR donde window no está definido
    const originalWindow = global.window;

    // Temporalmente eliminar window
    // @ts-expect-error: Testing SSR scenario
    delete global.window;

    // El componente debería usar valores por defecto (1024x768)
    // Restaurar window antes de renderizar
    global.window = originalWindow;

    mockWindowDimensions(1024, 768);

    const { container } = render(<Table />);

    expect(container).toBeInTheDocument();
  });

  describe("Secrets integration", () => {
    it("should pass secrets to players and render them", () => {
      const mockSecrets: GameSecret[] = [
        {
          id: crypto.randomUUID(),
          type: "INNOCENT",
          content: "You are innocent",
          match_id: crypto.randomUUID(),
          secret_id: crypto.randomUUID(),
          player_id: "7fd66e40-249c-4e51-8028-25454c046ed4",
          is_revealed: false,
        },
        {
          id: crypto.randomUUID(),
          type: "MURDERER",
          content: "You are the murderer",
          match_id: crypto.randomUUID(),
          secret_id: crypto.randomUUID(),
          player_id: "7fd66e40-249c-4e51-8028-25454c046ed4",
          is_revealed: false,
        },
      ];

      const twoPlayers: GamePlayer[] = [
        mockCurrentPlayer,
        {
          id: "7fd66e40-249c-4e51-8028-25454c046ed4",
          name: "Player2",
          avatar: avatarPoirot,
          birthday: new Date("1995-05-15"),
          player_id: "7fd66e40-249c-4e51-8028-25454c046ed4",
          match_id: crypto.randomUUID(),
          role: "INNOCENT",
          order: 2,
        },
      ];

      mockUseGame.mockReturnValue({
        players: twoPlayers,
        match: null,
        cards: [],
        secrets: mockSecrets,
        isLoading: false,
        hasError: false,
        error: null,
      } as ReturnType<typeof useGame>);

      render(<Table />);

      const secretsContainer = screen.getByTestId("secrets");
      expect(secretsContainer).toBeInTheDocument();

      const secretCards = screen.getAllByTestId("secret");
      expect(secretCards).toHaveLength(2);
    });

    it("should filter secrets by player_id", () => {
      const mockSecrets: GameSecret[] = [
        {
          id: crypto.randomUUID(),
          type: "INNOCENT",
          content: "You are innocent",
          match_id: crypto.randomUUID(),
          secret_id: crypto.randomUUID(),
          player_id: "7fd66e40-249c-4e51-8028-25454c046ed4",
          is_revealed: false,
        },
        {
          id: crypto.randomUUID(),
          type: "MURDERER",
          content: "You are the murderer",
          match_id: crypto.randomUUID(),
          secret_id: crypto.randomUUID(),
          player_id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
          is_revealed: false,
        },
      ];

      const threePlayers: GamePlayer[] = [
        mockCurrentPlayer,
        {
          id: "7fd66e40-249c-4e51-8028-25454c046ed4",
          name: "Player2",
          avatar: avatarPoirot,
          birthday: new Date("1995-05-15"),
          player_id: "7fd66e40-249c-4e51-8028-25454c046ed4",
          match_id: crypto.randomUUID(),
          role: "INNOCENT",
          order: 2,
        },
        {
          id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
          name: "Player3",
          avatar: avatarQuin,
          birthday: new Date("1998-08-20"),
          player_id: "63fcbb6f-f455-46dc-b231-61968bc391e1",
          match_id: crypto.randomUUID(),
          role: "INNOCENT",
          order: 3,
        },
      ];

      mockUseGame.mockReturnValue({
        players: threePlayers,
        match: null,
        cards: [],
        secrets: mockSecrets,
        isLoading: false,
        hasError: false,
        error: null,
      } as ReturnType<typeof useGame>);

      render(<Table />);

      const secretsContainers = screen.getAllByTestId("secrets");
      expect(secretsContainers).toHaveLength(2);

      const secretCards = screen.getAllByTestId("secret");
      expect(secretCards).toHaveLength(2);
    });
  });
});
