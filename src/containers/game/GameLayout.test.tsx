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

  it("should render the logo image with correct src and alt text", () => {
    render(<GameLayout />);

    const logoImage = screen.getByAltText(
      "AGATHA CHRISTIE'S - DEATH ON THE CARDS",
    );
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute("src", "mock-logo.png");
  });

  it("should render the background image with correct src and alt text", () => {
    render(<GameLayout />);

    const backgroundImage = screen.getByAltText("Background");
    expect(backgroundImage).toBeInTheDocument();
    expect(backgroundImage).toHaveAttribute("src", "mock-background.png");
  });

  it("should render the Outlet component", () => {
    render(<GameLayout />);

    const outlet = screen.getByTestId("mock-outlet");
    expect(outlet).toBeInTheDocument();
    expect(outlet).toHaveTextContent("Outlet Content");
  });

  it("should have proper layering with z-index classes", () => {
    render(<GameLayout />);

    const logoImage = screen.getByAltText(
      "AGATHA CHRISTIE'S - DEATH ON THE CARDS",
    );
    const headerContainer = logoImage.closest("div");
    const backgroundImage = screen.getByAltText("Background");

    // Header should have z-30 (higher layer)
    expect(headerContainer).toHaveClass("z-30");

    // Background should have z-0 (lower layer)
    expect(backgroundImage).toHaveClass("z-0");
  });

  it("should render logo with proper centering classes", () => {
    render(<GameLayout />);

    const logoImage = screen.getByAltText(
      "AGATHA CHRISTIE'S - DEATH ON THE CARDS",
    );

    // Logo should be centered horizontally
    expect(logoImage).toHaveClass("mx-auto");
  });
});
