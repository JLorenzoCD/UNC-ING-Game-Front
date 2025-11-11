import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import GameLayout from "./GameLayout";

// Mock the Outlet component from react-router
vi.mock("react-router", () => ({
  Outlet: vi.fn(() => <div data-testid="mock-outlet">Outlet Content</div>),
}));

// Mock the GameContextProvider
vi.mock("@/contexts/GameContext", () => ({
  default: vi.fn(({ children }) => (
    <div data-testid="mock-game-context-provider">{children}</div>
  )),
}));
vi.mock("./components/TimerTurn", () => ({
  default: vi.fn(() => <div data-testid="mock-timerTurn">Timer</div>),
}));

// Mock image assets
vi.mock("@/assets/logo.png", () => ({
  default: "mock-logo.png",
}));

vi.mock("@/assets/background.png", () => ({
  default: "mock-background.png",
}));

describe("GameLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(<GameLayout />);
    expect(
      screen.getByTestId("mock-game-context-provider"),
    ).toBeInTheDocument();
  });

  it("should wrap content with GameContextProvider", () => {
    render(<GameLayout />);

    const provider = screen.getByTestId("mock-game-context-provider");
    expect(provider).toBeInTheDocument();
  });

  it("should render the Outlet component", () => {
    render(<GameLayout />);

    const outlet = screen.getByTestId("mock-outlet");
    expect(outlet).toBeInTheDocument();
    expect(outlet).toHaveTextContent("Outlet Content");
  });

  it("should render the TimerTurn component", () => {
    render(<GameLayout />);

    const timer = screen.getByTestId("mock-timerTurn");
    expect(timer).toBeInTheDocument();
    expect(timer).toHaveTextContent("Timer");
  });

  it("should render the TimerTurn component in parten component with position relative in className", () => {
    render(<GameLayout />);

    const main = screen.getByTestId("mock-timerTurn").parentElement;
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass("relative");
  });
});
