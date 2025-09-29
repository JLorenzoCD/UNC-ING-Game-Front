import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Match } from "@/types/match";
import type { UUID } from "@/types/common";

import LobbyLayout from "./LobbyLayout";

// --- Mocks de componentes y recursos ---

// Mock del componente Container (se asume que está bien y con tests)
vi.mock("@/components/Container", () => ({
  default: vi.fn(({ children, ...props }) => (
    <div data-testid="mock-container" {...props}>
      {children}
    </div>
  )),
}));

// Mock del componente Button (se asume que está bien y con tests)
vi.mock("@/components/Button", () => ({
  default: vi.fn(({ children, ...props }) => (
    <button data-testid="mock-button" {...props}>
      {children}
    </button>
  )),
}));

vi.mock("@/assets/logo.png", () => ({
  default: "mock-logo.png",
}));

// Mock de la imagen de fondo
vi.mock("src/assets/fondopartida.jpeg", () => ({
  default: "mock-background.jpeg",
}));

// --- Datos de prueba ---

const mockMatch: Match = {
  id: "mock-uuid-123" as UUID,
  name: "The Best Lobby",
  min_players: 4,
  max_players: 8,
  status: "WAITING",
  owner_id: "mock-owner-id" as UUID,
  current_player_order: 0,
};

// Un componente hijo simple para testear que se renderiza
const MockChildComponent = () => (
  <div data-testid="mock-child">Mocked Content</div>
);

describe("LobbyLayout", () => {
  const startGameMock = vi.fn();

  const consoleErrorMock = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    consoleErrorMock.mockClear();
  });

  it("should render the layout with header, main content, and children", () => {
    render(
      <LobbyLayout match={mockMatch} startGame={startGameMock} isOwner={false}>
        <MockChildComponent />
      </LobbyLayout>,
    );

    // 1. Verificar el logo
    const logoImage = screen.getByAltText(
      "AGATHA CHRISTIE'S - DEATH ON THE CARDS",
    );
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute("src", "mock-logo.png");

    // 2. Verificar el título del lobby con datos del match
    const h1Title = screen.getByRole("heading", { level: 1 });
    expect(h1Title).toBeInTheDocument();
    expect(h1Title).toHaveTextContent(
      `"${mockMatch.name}" (${mockMatch.min_players}/${mockMatch.max_players})`,
    );

    // 3. Verificar el contenido hijo
    expect(screen.getByTestId("mock-child")).toBeInTheDocument();
  });

  it('should NOT render the "Start game" button when the user is not the owner', () => {
    render(
      <LobbyLayout match={mockMatch} startGame={startGameMock} isOwner={false}>
        <MockChildComponent />
      </LobbyLayout>,
    );

    // El botón no debe estar en el documento
    expect(
      screen.queryByRole("button", { name: /start game/i }),
    ).not.toBeInTheDocument();
  });

  it('should render the "Start game" button when the user is the owner', () => {
    render(
      <LobbyLayout match={mockMatch} startGame={startGameMock} isOwner={true}>
        <MockChildComponent />
      </LobbyLayout>,
    );

    // El botón debe estar en el documento
    const startButton = screen.getByRole("button", { name: /start game/i });
    expect(startButton).toBeInTheDocument();
    expect(startButton).toHaveTextContent("Start game");
  });

  it('should call startGame when the owner clicks the "Start game" button and handle success', async () => {
    startGameMock.mockResolvedValue(true);

    render(
      <LobbyLayout match={mockMatch} startGame={startGameMock} isOwner={true}>
        <MockChildComponent />
      </LobbyLayout>,
    );

    const startButton = screen.getByRole("button", { name: /start game/i });

    fireEvent.click(startButton);

    await waitFor(() => {
      expect(startGameMock).toHaveBeenCalledTimes(1);
    });

    expect(consoleErrorMock).not.toHaveBeenCalled();
  });
});
