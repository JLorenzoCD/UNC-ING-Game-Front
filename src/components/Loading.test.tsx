import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Loading from "@/components/Loading";

describe("Loading", () => {
  it("should render the status role and screen-reader text", () => {
    render(<Loading />);

    const statusElement = screen.getByRole("status");
    expect(statusElement).toBeInTheDocument();

    expect(screen.getByText("Loading...")).toHaveClass("sr-only");

    const svgElement = screen.getByTestId("svg");
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute("aria-hidden", "true");
  });

  it("should have the expected base class names for the SVG", () => {
    render(<Loading />);

    const svgElement = screen.getByTestId("svg");
    expect(svgElement).toHaveClass("w-8 h-8 animate-spin"); // tamaño y animación
    expect(svgElement).toHaveClass("text-gray-200 fill-blue-600"); // color
  });
});
