import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Outlet } from "react-router";
import MainLayout from "./MainLayout";

// Mock del componente Container
vi.mock("@/components/Container", () => ({
  default: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

// Mock de react-router
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    Outlet: vi.fn(() => <div data-testid="outlet">Child Content</div>),
  };
});

describe("MainLayout", () => {
  it("should render the header with logo", () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>,
    );

    const logo = screen.getByAltText("AGATHA CHRISTIE'S - DEATH ON THE CARDS");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("width", "384");
  });

  it("should render the logo with correct src", () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>,
    );

    const logo = screen.getByAltText("AGATHA CHRISTIE'S - DEATH ON THE CARDS");
    expect(logo).toHaveAttribute("src");
    expect(logo.getAttribute("src")).toContain("logo.png");
  });

  it("should render the Container component with correct className", () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>,
    );

    const container = screen.getByTestId("container");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("pt-5");
  });

  it("should render the Outlet component", () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>,
    );

    const outlet = screen.getByTestId("outlet");
    expect(outlet).toBeInTheDocument();
    expect(Outlet).toHaveBeenCalled();
  });

  it("should have correct structure with header and main elements", () => {
    const { container } = render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>,
    );

    const header = container.querySelector("header");
    const main = container.querySelector("main");

    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(header).toHaveClass(
      "w-full",
      "pt-4",
      "flex",
      "items-center",
      "justify-center",
    );
  });

  it("should render children through Outlet", () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>,
    );

    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });
});
