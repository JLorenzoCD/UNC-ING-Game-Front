import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";

import type { GameSecret } from "@/types/secret";
import { usePlayer } from "@/contexts/PlayerContext";
import Secrets from "./Secrets";

// Mock del contexto de jugador
vi.mock("@/contexts/PlayerContext", () => ({
  usePlayer: vi.fn(),
}));

// Mock de las imágenes
vi.mock("@/assets/06-secret_front.png", () => ({
  default: "secret-front.png",
}));
vi.mock("@/assets/03-secret_murderer.png", () => ({
  default: "secret-murderer.png",
}));

const mockUsePlayer = usePlayer as Mock;

describe("Secrets", () => {
  const mockPlayer = { id: crypto.randomUUID(), name: "TestPlayer" };

  const mockSecrets: GameSecret[] = [
    {
      type: "INNOCENT",
      content: "You are innocent",
      id: crypto.randomUUID(),
      match_id: crypto.randomUUID(),
      secret_id: crypto.randomUUID(),
      player_id: mockPlayer.id,
      is_revealed: false,
    },
    {
      type: "INNOCENT",
      id: crypto.randomUUID(),
      content: "You are the innocent",
      match_id: crypto.randomUUID(),
      secret_id: crypto.randomUUID(),
      player_id: mockPlayer.id,
      is_revealed: false,
    },
    {
      type: "MURDERER",
      id: crypto.randomUUID(),
      content: "You are the murderer",
      match_id: crypto.randomUUID(),
      secret_id: crypto.randomUUID(),
      player_id: mockPlayer.id,
      is_revealed: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods para evitar warnings en tests
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("Rendering secrets correctly", () => {
    it("should render the secrets for current player", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      render(<Secrets secrets={mockSecrets} />);

      const secretElements = screen.getAllByRole("img");

      expect(secretElements.length).toBe(3);
      expect(secretElements[0]).toHaveAttribute("src", "secret-front.png");
      expect(secretElements[1]).toHaveAttribute("src", "secret-front.png");
      expect(secretElements[2]).toHaveAttribute("src", "secret-murderer.png");
    });
  });

  describe("Security - Not showing other players secrets", () => {
    it("should not render secrets for different player", () => {
      mockUsePlayer.mockReturnValue({
        player: { ...mockPlayer, id: "different-player" },
      });

      render(<Secrets secrets={mockSecrets} />);

      const secretElements = screen.queryAllByRole("img");

      expect(secretElements.length).toBe(0);
    });
  });
});
