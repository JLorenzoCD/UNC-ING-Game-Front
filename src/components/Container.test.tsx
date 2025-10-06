import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Container from "@/components/Container";

describe("Container", () => {
  it("should render its children content", () => {
    const testContent = "Test Container Content";
    render(<Container>{testContent}</Container>);

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it("should have the expected base class names", () => {
    const { container } = render(<Container>Test</Container>);

    const divElement = container.firstChild;
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveClass("container");
    expect(divElement).toHaveClass("mx-auto");
  });

  it("should preserve custom class names", () => {
    const customClass = "custom-padding bg-red-500";
    const { container } = render(
      <Container className={customClass}>Test</Container>,
    );

    const divElement = container.firstChild;
    expect(divElement).toHaveClass(
      "custom-padding bg-red-500 container mx-auto",
    );
  });

  it("should pass through other HTML attributes", () => {
    render(<Container role="main">Test</Container>);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
