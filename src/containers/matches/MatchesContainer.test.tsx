import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { UUID } from "@/types/common";
import { type MatchWithPlayerCount } from "@/types/match";

import MatchesContainer from "./MatchesContainer";

const { mockUseHttpService, mockUseMatchesData } = vi.hoisted(() => {
  const mockUseHttpService = { useHttpService: vi.fn() };
  const mockUseMatchesData = {
    useMatchesData: vi.fn(),
  };

  return {
    mockUseHttpService,
    mockUseMatchesData,
  };
});

// Mock dependencias
vi.mock("./useMatchesData", () => mockUseMatchesData);
vi.mock("@/contexts/HttpServiceContext", () => mockUseHttpService);
vi.mock("react-router", () => {
  return {
    Link: vi.fn(({ to, children, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    )),
  };
});

// Mock componentes hijos
vi.mock("./components/MatchList", () => ({
  default: vi.fn(({ children, isLoading }) => (
    <div data-testid="mock-match-list" data-loading={isLoading}>
      {children}
    </div>
  )),
}));
vi.mock("./components/MatchListItem", () => ({
  default: vi.fn(({ match }) => (
    <div data-testid={`match-item-${match.id}`}>{match.name}</div>
  )),
}));
vi.mock("@/components/Button", () => ({
  default: vi.fn(({ children, ...props }) => (
    <button {...props}>{children}</button>
  )),
}));

// Mock datos
const mockMatches = [
  {
    id: "1" as UUID,
    name: "Match 1",
    status: "WAITING",
    current_player_count: 2,
  },
  {
    id: "2" as UUID,
    name: "Match 2",
    status: "WAITING",
    current_player_count: 4,
  },
] as MatchWithPlayerCount[];

const mockHttpService = {
  joinMatch: vi.fn(),
  getMatches: vi.fn(),
};

describe("MatchesContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseHttpService.useHttpService.mockReturnValue({
      httpService: mockHttpService,
    });
  });

  it('should display "Loading..." when loading is in progress', () => {
    mockUseMatchesData.useMatchesData.mockReturnValue({
      matches: [],
      loading: true,
      error: false,
    });

    render(<MatchesContainer />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByTestId("matches-container")).not.toBeInTheDocument();
  });

  it("should display the connection error message when httpService is null", () => {
    mockUseMatchesData.useMatchesData.mockReturnValue({
      matches: [],
      loading: false,
      error: false,
    });
    mockUseHttpService.useHttpService.mockReturnValue({ httpService: null });

    render(<MatchesContainer />);

    expect(
      screen.getByText("No connection to the server."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("should render the match list and the create match button when loading is successful", async () => {
    mockUseMatchesData.useMatchesData.mockReturnValue({
      matches: mockMatches,
      loading: false,
      error: false,
    });

    render(<MatchesContainer />);

    expect(screen.getByTestId("matches-container")).toBeInTheDocument();

    const createMatchLink = screen.getByRole("link", { name: /create match/i });
    expect(createMatchLink).toBeInTheDocument();
    expect(createMatchLink).toHaveAttribute("href", "/match/create");

    // Verificar la lista de partidas renderizada
    expect(screen.getByTestId("mock-match-list")).toBeInTheDocument();
    expect(screen.getByTestId("mock-match-list")).toHaveAttribute(
      "data-loading",
      "false",
    );

    // Verificar que MatchListItem se llama por cada partida
    expect(screen.getByTestId("match-item-1")).toHaveTextContent("Match 1");
    expect(screen.getByTestId("match-item-2")).toHaveTextContent("Match 2");

    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
