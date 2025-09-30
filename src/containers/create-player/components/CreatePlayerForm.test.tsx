import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreatePlayerForm from "./CreatePlayerForm";

describe("CreatePlayerForm", () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    user = userEvent.setup();
  });

  describe("Rendering", () => {
    it("renders all form fields", () => {
      render(<CreatePlayerForm handleCreatePlayer={vi.fn()} />);

      expect(screen.getByLabelText(/Nickname */i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Birthday */i)).toBeInTheDocument();
      expect(screen.getByText(/Avatar */i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Create Player/i }),
      ).toBeInTheDocument();
    });

    it("initially has empty fields", () => {
      render(<CreatePlayerForm handleCreatePlayer={vi.fn()} />);

      expect(screen.getByLabelText(/Nickname */i)).toHaveValue("");
      expect(screen.getByLabelText(/Birthday */i)).toHaveValue("");
    });
  });

  describe("User Input", () => {
    it("updates nickname field when user types", async () => {
      render(<CreatePlayerForm handleCreatePlayer={mockOnSubmit} />);
      const nicknameInput = screen.getByLabelText(/Nickname */i);

      await user.type(nicknameInput, "TestUser");

      expect(nicknameInput).toHaveValue("TestUser");
    });

    it("updates birthday fields when user types", async () => {
      render(<CreatePlayerForm handleCreatePlayer={mockOnSubmit} />);
      const birthdayInput = screen.getByLabelText(/Birthday */i);
      const testDate = "2000-01-01";

      await user.type(birthdayInput, testDate);

      expect(birthdayInput).toHaveValue(testDate);
    });

    it("selects an avatar when clicked", async () => {
      render(<CreatePlayerForm handleCreatePlayer={mockOnSubmit} />);

      const avatarImages = screen.getAllByAltText(/Avatar */i);

      const firstAvatar = avatarImages[0];
      await user.click(firstAvatar);

      // Verifica que el avatar seleccionado tenga el estilo de borde
      expect(firstAvatar).toHaveClass("border-blue-500");

      for (let i = 1; i < avatarImages.length; i++) {
        expect(avatarImages[i]).not.toHaveClass("border-blue-500");
      }
    });
  });
});
