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
    // Mock console methods para evitar warnings en tests
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("Rendering secrets correctly", () => {
    it("should render INNOCENT secret for current player", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      render(<Secret secret={mockSecrets.innocent} />);

      const image = screen.getByRole("img", { name: /Secret card: INNOCENT/i });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "secret-front.png");
      expect(image).toHaveClass("object-cover", "w-40", "h-60");
    });

    it("should render ACCOMPLICE secret for current player", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      render(<Secret secret={mockSecrets.accomplice} />);

      const image = screen.getByRole("img", {
        name: /Secret card: ACCOMPLICE/i,
      });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "secret-accomplice.png");
    });

    it("should render MURDERER secret for current player", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      render(<Secret secret={mockSecrets.murderer} />);

      const image = screen.getByRole("img", { name: /Secret card: MURDERER/i });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "secret-murderer.png");
    });
  });

  describe("Security - Not showing other players secrets", () => {
    it("should not render secret for different player", () => {
      mockUsePlayer.mockReturnValue({
        player: { ...mockPlayer, id: "different-player" },
      });

      render(<Secret secret={mockSecrets.innocent} />);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("should not render when player_id is different", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });
      const otherPlayerSecret = {
        ...mockSecrets.innocent,
        player_id:
          "37a27c8a-18b3-4363-8ec2-1a1f0fe87a21" as `${string}-${string}-${string}-${string}-${string}`,
      };

      render(<Secret secret={otherPlayerSecret} />);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("Error handling - Invalid props", () => {
    it("should not render when secret prop is null", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      render(<Secret secret={null} />);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("should not render when secret.type is missing", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      // Forzamos un tipo inválido
      const invalidSecret = { ...mockSecrets.innocent, type: undefined as any };

      render(<Secret secret={invalidSecret} />);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(console.warn).toHaveBeenCalledWith(
        "Secret component: invalid secret type",
      );
    });

    it("should not render when secret.player_id is missing", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      // Forzamos un player_id inválido

      const invalidSecret = {
        ...mockSecrets.innocent,
        player_id: undefined as any,
      };

      render(<Secret secret={invalidSecret} />);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });
});
