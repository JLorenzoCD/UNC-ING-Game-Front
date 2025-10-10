import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

import Modal from "./Modal";

// Mock del icono
vi.mock("@remixicon/react", () => ({
  RiCloseFill: vi.fn(() => <span data-testid="mock-close-icon" />),
}));

describe("Modal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    // Crear el elemento #modal-root si no existe.
    let modalRoot = document.getElementById("modal-root");
    if (!modalRoot) {
      modalRoot = document.createElement("div");
      modalRoot.setAttribute("id", "modal-root");
      document.body.appendChild(modalRoot);
    }

    vi.clearAllMocks();
  });

  it("should not render the modal content when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <p>Modal Content</p>
      </Modal>,
    );

    expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
  });

  it("should render the modal content, header, and footer when isOpen is true", () => {
    const HEADER_TEXT = "Modal Header";
    const FOOTER_TEXT = "Modal Footer";
    const BODY_TEXT = "Modal Body";

    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        header={<h1 data-testid="modal-header">{HEADER_TEXT}</h1>}
        footer={<div data-testid="modal-footer">{FOOTER_TEXT}</div>}
      >
        <p>{BODY_TEXT}</p>
      </Modal>,
    );

    expect(screen.getByText(BODY_TEXT)).toBeInTheDocument();
    expect(screen.getByTestId("modal-header")).toHaveTextContent(HEADER_TEXT);
    expect(screen.getByTestId("modal-footer")).toHaveTextContent(FOOTER_TEXT);
    expect(screen.getByTestId("mock-close-icon")).toBeInTheDocument();
  });

  it("should call onClose when the close button is clicked", async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        Content
      </Modal>,
    );

    const closeButton = screen.getByRole("button", { name: /Close modal/i });

    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when clicking on the overlay (semi-transparent background)", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        Content
      </Modal>,
    );

    const overlay = screen.getByTestId("overlay-background");

    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should prevent onClose when clicking inside the white card area", async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        Content
      </Modal>,
    );

    const content = screen.getByTestId("modal-card");

    await userEvent.click(content);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("should apply correct border styles based on props", () => {
    render(
      // Renderizamos dos veces para probar ambos casos
      <>
        <Modal // Sin bordes
          isOpen={true}
          onClose={mockOnClose}
          header={<h1 data-testid="header-no-border">Header</h1>}
          footer={<div data-testid="footer-no-border">Footer</div>}
          headerBorderBottom={false}
          footerBorderTop={false}
        >
          Body A
        </Modal>
        <Modal // Con bordes (por defecto)
          isOpen={true}
          onClose={mockOnClose}
          header={<h1 data-testid="header-with-border">Header B</h1>}
          footer={<div data-testid="footer-with-border">Footer B</div>}
        >
          Body B
        </Modal>
      </>,
    );

    const headerNoBorder = screen.getByTestId("header-no-border").parentElement;
    const footerNoBorder = screen.getByTestId("footer-no-border").parentElement;

    // Verificamos que no tengan la clase de borde.
    expect(headerNoBorder).not.toHaveClass("border-b");
    expect(footerNoBorder).not.toHaveClass("border-t");

    const headerWithBorder =
      screen.getByTestId("header-with-border").parentElement;
    const footerWithBorder =
      screen.getByTestId("footer-with-border").parentElement;

    expect(headerWithBorder).toHaveClass("border-b");
    expect(footerWithBorder).toHaveClass("border-t");
  });
});
