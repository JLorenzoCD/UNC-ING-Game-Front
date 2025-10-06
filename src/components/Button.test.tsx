import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Button from "@/components/Button";

describe("Button", () => {
  it("should render a button element with its children", () => {
    const buttonText = "Click Me";
    render(<Button>{buttonText}</Button>);

    const buttonElement = screen.getByRole("button", { name: buttonText });
    expect(buttonElement).toBeInTheDocument();
  });

  it("should have the expected base class names", () => {
    render(<Button>Test</Button>);

    const buttonElement = screen.getByRole("button", { name: "Test" });
    expect(buttonElement).toHaveClass(
      "text-white bg-[#2C2C2C] font-medium rounded-lg text-sm px-5 py-2.5",
    );

    // Hover y focus
    expect(buttonElement).toHaveClass(
      "hover:bg-[#4D4D4D] focus:ring-4 focus:ring-[#4D4D4D] focus:outline-none",
    );

    // Estado disabled
    expect(buttonElement).toHaveClass("disabled:bg-[#6e6e6e]");
  });

  it("should preserve custom class names", () => {
    const customClass = "w-full shadow-lg";
    render(<Button className={customClass}>Test</Button>);

    const buttonElement = screen.getByRole("button", { name: "Test" });
    expect(buttonElement).toHaveClass("w-full shadow-lg");
  });

  it("should pass through standard button attributes like 'disabled'", () => {
    render(<Button disabled>Disabled Test</Button>);

    const buttonElement = screen.getByRole("button", { name: "Disabled Test" });
    expect(buttonElement).toBeDisabled();
  });
});
