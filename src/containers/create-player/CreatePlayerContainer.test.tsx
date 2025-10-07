import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, useNavigate } from "react-router";
import type { Mock } from "vitest";
import CreatePlayerContainer from "./CreatePlayerContainer";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";
import { FRONTEND_PATHS } from "@/constants/frontend";
import type { Player, PlayerInput } from "@/types/player";

// Mock de los módulos
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock("@/contexts/PlayerContext");
vi.mock("@/contexts/HttpServiceContext");

// Mock del formulario que captura la función handleCreatePlayer
let capturedHandleCreatePlayer: ((data: PlayerInput) => Promise<void>) | null =
  null;

vi.mock("./components/CreatePlayerForm", () => ({
  default: ({
    handleCreatePlayer,
  }: {
    handleCreatePlayer: (data: PlayerInput) => Promise<void>;
  }) => {
    capturedHandleCreatePlayer = handleCreatePlayer;
    return (
      <div data-testid="create-player-form">
        <button>Create Player</button>
      </div>
    );
  },
}));

describe("CreatePlayerContainer", () => {
  const mockNavigate = vi.fn();
  const mockSetPlayer = vi.fn();
  const mockCreatePlayer = vi.fn();

  const mockHttpService = {
    createPlayer: mockCreatePlayer,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    capturedHandleCreatePlayer = null;

    (useNavigate as Mock).mockReturnValue(mockNavigate);

    (usePlayer as Mock).mockReturnValue({
      setPlayer: mockSetPlayer,
    });

    (useHttpService as Mock).mockReturnValue({
      httpService: mockHttpService,
    });
  });

  it("should render the CreatePlayerForm component", () => {
    render(
      <MemoryRouter>
        <CreatePlayerContainer />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("create-player-form")).toBeInTheDocument();
  });

  it("should create player and navigate on successful creation", async () => {
    const playerInput: PlayerInput = {
      name: "TestPlayer",
      avatar: "avatar1.png",
      birthday: new Date("2003-07-10"),
    };

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: "TestPlayer",
      avatar: "avatar1.png",
      birthday: new Date("2003-07-10"),
    };

    mockCreatePlayer.mockResolvedValue(newPlayer);

    render(
      <MemoryRouter>
        <CreatePlayerContainer />
      </MemoryRouter>,
    );

    // Llamar a la función capturada
    expect(capturedHandleCreatePlayer).not.toBeNull();
    await capturedHandleCreatePlayer!(playerInput);

    await waitFor(() => {
      expect(mockCreatePlayer).toHaveBeenCalledWith(playerInput);
      expect(mockSetPlayer).toHaveBeenCalledWith(newPlayer);
      expect(mockNavigate).toHaveBeenCalledWith(FRONTEND_PATHS.MATCH_LIST);
    });
  });

  it("should throw error when httpService is not available", async () => {
    (useHttpService as Mock).mockReturnValue({
      httpService: null,
    });

    render(
      <MemoryRouter>
        <CreatePlayerContainer />
      </MemoryRouter>,
    );

    const playerInput: PlayerInput = {
      name: "TestPlayer",
      avatar: "avatar1.png",
      birthday: new Date("2003-07-10"),
    };

    expect(capturedHandleCreatePlayer).not.toBeNull();

    await expect(capturedHandleCreatePlayer!(playerInput)).rejects.toThrow(
      "HTTP Service is not available",
    );

    expect(mockCreatePlayer).not.toHaveBeenCalled();
  });

  it("should handle error when creating player fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const error = new Error("Failed to create player");

    mockCreatePlayer.mockRejectedValue(error);

    render(
      <MemoryRouter>
        <CreatePlayerContainer />
      </MemoryRouter>,
    );

    const playerInput: PlayerInput = {
      name: "TestPlayer",
      avatar: "avatar1.png",
      birthday: new Date("2003-07-10"),
    };

    expect(capturedHandleCreatePlayer).not.toBeNull();

    await expect(capturedHandleCreatePlayer!(playerInput)).rejects.toThrow(
      "Failed to create player",
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error creating player:",
        error,
      );
      expect(mockSetPlayer).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
