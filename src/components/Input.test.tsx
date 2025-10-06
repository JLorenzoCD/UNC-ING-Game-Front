import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Input from "@/components/Input";

describe("Input", () => {
  it("should render an input element", () => {
    render(<Input data-testid="test-input" />);

    expect(screen.getByTestId("test-input")).toBeInTheDocument();
    expect(screen.getByTestId("test-input").tagName).toBe("INPUT");
  });

  it("should have the expected base class names", () => {
    render(<Input data-testid="test-input" />);

    const inputElement = screen.getByTestId("test-input");
    expect(inputElement).toHaveClass(
      "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5",
    );
    expect(inputElement).toHaveClass(
      "focus:ring-blue-500 focus:border-blue-500",
    );
    expect(inputElement).toHaveClass("placeholder-gray-400");
  });

  it("should preserve custom class names", () => {
    const customClass = "my-custom-input text-lg";
    render(<Input className={customClass} data-testid="test-input" />);

    const inputElement = screen.getByTestId("test-input");
    expect(inputElement).toHaveClass("my-custom-input text-lg");
  });

  it("should pass through standard input attributes", () => {
    const placeholderText = "Enter your name";
    render(<Input placeholder={placeholderText} type="email" />);

    const inputElement = screen.getByPlaceholderText(placeholderText);
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute("type", "email");
  });
});
