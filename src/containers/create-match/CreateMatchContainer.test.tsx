import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useHttpService } from "@/contexts/HttpServiceContext";

import type { ReactNode } from "react";
import type { UUID } from "@/types/common";
import type { Match, MatchCreateInput } from "@/types/match";

import CreateMatchContainer from "./CreateMatchContainer";

// Mock de los componentes dependientes CreateMatchForm, Button (se asume que
// están bien y con tests)
vi.mock("@/components/Button", () => ({
  default: vi.fn(
    ({ className, children }: { className: string; children: ReactNode }) => (
      <button data-testid="mock-button" className={className}>
        {children}
      </button>
    ),
  ),
}));

const mockMatchToCreate = {
  name: "Partida",
  owner_id: "test-owner_id-1" as UUID,
  min_players: 2,
  max_players: 6,
} as MatchCreateInput;
vi.mock("./components/CreateMatchForm/CreateMatchForm", () => ({
  default: vi.fn(
    (props: {
      handleCreateMatch: (matchToCreate: MatchCreateInput) => Promise<Match>;
    }) => (
      <form
        data-testid="mock-form"
        onSubmit={(e) => {
          e.preventDefault();
          props.handleCreateMatch(mockMatchToCreate);
        }}
      >
        <p>Form title</p>
        <button type="submit">Send</button>
      </form>
    ),
  ),
}));

vi.mock("@/constants/frontend", () => ({
  FRONTEND_PATHS: {
    MATCH_LIST: "/matches",
  },
}));

const mockCreateMatch = vi.fn();
// Mock del hook useHttpService (se asume que esta bien y con tests)
vi.mock("@/contexts/HttpServiceContext", () => ({
  useHttpService: vi.fn(() => ({
    httpService: {
      createMatch: mockCreateMatch,
      request: vi.fn(),
    },
  })),
}));

// Mock para evitar problemas de contexto por el Link
vi.mock("react-router", async (importOriginal) => {
  const mod = await importOriginal<typeof import("react-router")>();
  return {
    ...mod,
    Link: vi.fn(({ to, children, ...props }) => (
      <a href={to} {...props} data-testid="mock-link-button">
        {children}
      </a>
    )),
  };
});

// Mock de usePlayer para evitar problemas con PlayerProvider que usa useNavigate
vi.mock("@/contexts/PlayerContext", () => ({
  usePlayer: vi.fn(() => ({
    player: { id: "test-player-id" as UUID },
    setPlayer: vi.fn(),
  })),
}));

describe("CreateMatchContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it("should render the page correctly", () => {
    render(<CreateMatchContainer />);

    // El enlace hacia la lista de partidas se renderiza
    const linkButton = screen.getByTestId("mock-link-button");
    expect(linkButton).toBeInTheDocument();
    expect(linkButton).toHaveTextContent("List of matches");

    // El formulario de crear partida se renderiza
    const form = screen.getByTestId("mock-form");
    expect(form).toBeInTheDocument();
  });

  it("should call createMatch when form is submitted", async () => {
    mockCreateMatch.mockResolvedValue({
      ...mockMatchToCreate,
      id: "test-match-id",
      status: "WAITING",
      current_player_order: 0,
    });

    render(<CreateMatchContainer />);

    const form = screen.getByTestId("mock-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockCreateMatch).toHaveBeenCalled();
    });
  });

  it("should render the button for list of matches with correct link", () => {
    render(<CreateMatchContainer />);

    const linkButton = screen.getByTestId("mock-link-button");
    expect(linkButton).toHaveAttribute("href", "/matches");
  });

  it("should not render CreateMatchForm if httpService is null", () => {
    vi.mocked(useHttpService).mockReturnValueOnce({ httpService: null });
    render(<CreateMatchContainer />);

    const form = screen.queryByTestId("mock-form");
    expect(form).not.toBeInTheDocument();
  });

  it("should handle form submission error correctly", async () => {
    mockCreateMatch.mockRejectedValue(new Error("Failed to create match"));

    render(<CreateMatchContainer />);

    const form = screen.getByTestId("mock-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockCreateMatch).toHaveBeenCalled();
    });
  });
});
