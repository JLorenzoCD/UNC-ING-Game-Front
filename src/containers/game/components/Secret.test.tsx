import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";

import type { GameSecret } from "@/types/secret";
import { usePlayer } from "@/contexts/PlayerContext";
import Secret from "./Secret";

// Mock del contexto de jugador
vi.mock("@/contexts/PlayerContext", () => ({
  usePlayer: vi.fn(),
}));

// Mock de las imágenes
vi.mock("@/assets/06-secret_front.png", () => ({
  default: "secret-front.png",
}));
vi.mock("@/assets/04-secret_accomplice.png", () => ({
  default: "secret-accomplice.png",
}));
vi.mock("@/assets/03-secret_murderer.png", () => ({
  default: "secret-murderer.png",
}));

const mockUsePlayer = usePlayer as Mock;

const mockIsSelectableSecret = vi.fn();

describe("Secret Component", () => {
  const mockPlayer = { id: crypto.randomUUID(), name: "TestPlayer" };

  const mockSecrets: Record<string, GameSecret> = {
    innocent: {
      type: "INNOCENT",
      content: "You are innocent",
      id: crypto.randomUUID(),
      match_id: crypto.randomUUID(),
      secret_id: crypto.randomUUID(),
      player_id: mockPlayer.id,
      is_revealed: false,
    },
    accomplice: {
      type: "ACCOMPLICE",
      id: crypto.randomUUID(),
      content: "You are the accomplice",
      match_id: crypto.randomUUID(),
      secret_id: crypto.randomUUID(),
      player_id: mockPlayer.id,
      is_revealed: false,
    },
    murderer: {
      type: "MURDERER",
      id: crypto.randomUUID(),
      content: "You are the murderer",
      match_id: crypto.randomUUID(),
      secret_id: crypto.randomUUID(),
      player_id: mockPlayer.id,
      is_revealed: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("Rendering secrets correctly", () => {
    it("should render INNOCENT secret for current player", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      render(
        <Secret
          secret={mockSecrets.innocent}
          isSelectableSecret={mockIsSelectableSecret}
          isTargetSecret={false}
          target={null}
        />,
      );

      const image = screen.getByRole("img", { name: /Secret card: INNOCENT/i });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "secret-front.png");
      expect(image).toHaveClass("object-cover", "w-full", "h-full");
    });

    it("should render ACCOMPLICE secret for current player", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      render(
        <Secret
          secret={mockSecrets.accomplice}
          isSelectableSecret={mockIsSelectableSecret}
          isTargetSecret={false}
          target={null}
        />,
      );

      const image = screen.getByRole("img", {
        name: /Secret card: ACCOMPLICE/i,
      });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "secret-accomplice.png");
    });

    it("should render MURDERER secret for current player", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      render(
        <Secret
          secret={mockSecrets.murderer}
          isSelectableSecret={mockIsSelectableSecret}
          isTargetSecret={false}
          target={null}
        />,
      );

      const image = screen.getByRole("img", { name: /Secret card: MURDERER/i });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "secret-murderer.png");
    });
  });

  describe("Security - Not showing other players secrets", () => {
    it("should render secret back for other players", () => {
      const otherPlayer = { id: crypto.randomUUID(), name: "OtherPlayer" };
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      const otherPlayerSecret = {
        ...mockSecrets.innocent,
        player_id: otherPlayer.id,
      };

      render(
        <Secret
          secret={otherPlayerSecret}
          isSelectableSecret={mockIsSelectableSecret}
          isTargetSecret={false}
          target={null}
        />,
      );

      const image = screen.getByRole("img", {
        name: /Secret card \(hidden\)/i,
      });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        "src",
        expect.stringContaining("secret_back.png"),
      );
      expect(image).toHaveClass("w-full", "h-full");
    });
  });

  describe("Revealed secrets functionality", () => {
    it("should show revealed secret with red border and eye icon for current player", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      const revealedSecret = {
        ...mockSecrets.murderer,
        is_revealed: true,
      };

      const { container } = render(
        <Secret
          secret={revealedSecret}
          isSelectableSecret={mockIsSelectableSecret}
          isTargetSecret={false}
          target={null}
        />,
      );
      screen.debug();
      const borderDiv = container.querySelector(".border-red-500");
      expect(borderDiv).toBeInTheDocument();
      expect(borderDiv).toHaveClass(
        "border-4",
        "shadow-lg",
        "shadow-red-500/50",
      );

      const image = screen.getByRole("img");
      expect(image).toHaveClass("brightness-50");

      const eyeIcon = container.querySelector(".bg-red-500.rounded-full");
      expect(eyeIcon).toBeInTheDocument();
    });

    it("should show revealed secret without special styling for other players viewing it", () => {
      const otherPlayer = { id: crypto.randomUUID(), name: "OtherPlayer" };
      mockUsePlayer.mockReturnValue({ player: otherPlayer });

      const revealedSecret = {
        ...mockSecrets.murderer,
        is_revealed: true,
      };

      const { container } = render(
        <Secret
          secret={revealedSecret}
          isSelectableSecret={mockIsSelectableSecret}
          isTargetSecret={false}
          target={null}
        />,
      );

      const image = screen.getByRole("img", { name: /Secret card: MURDERER/i });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "secret-murderer.png");

      expect(
        container.querySelector(".border-red-500"),
      ).not.toBeInTheDocument();
      expect(container.querySelector(".bg-red-500")).not.toBeInTheDocument();

      expect(image).not.toHaveClass("brightness-50");
    });

    it("should show revealed secret for current player with correct size", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      const revealedSecret = {
        ...mockSecrets.innocent,
        is_revealed: true,
      };

      const { container } = render(
        <Secret
          secret={revealedSecret}
          isSelectableSecret={mockIsSelectableSecret}
          isTargetSecret={false}
          target={null}
        />,
      );

      const borderDiv = container.querySelector(".w-21.h-31");
      expect(borderDiv).toBeInTheDocument();
    });
  });

  describe("Error handling - Invalid props", () => {
    it("should not render when secret prop is null", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      render(
        <Secret
          secret={null}
          isSelectableSecret={mockIsSelectableSecret}
          isTargetSecret={false}
          target={null}
        />,
      );

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("should not render when secret.type is missing", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      const invalidSecret = { ...mockSecrets.innocent, type: undefined as any };

      render(
        <Secret
          secret={invalidSecret}
          isSelectableSecret={mockIsSelectableSecret}
          isTargetSecret={false}
          target={null}
        />,
      );

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(console.warn).toHaveBeenCalledWith(
        "Secret component: invalid secret type",
      );
    });
  });
});
