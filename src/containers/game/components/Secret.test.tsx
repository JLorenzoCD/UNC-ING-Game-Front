import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";

import type { GameSecret } from "@/types/secret";
import type { UUID } from "@/types/common";

import { usePlayer } from "@/contexts/PlayerContext";

import Secret from "./Secret";

vi.mock("../utils/secretClassName", () => ({
  getBoderClass: vi.fn(() => "mock-border-class"),
}));

// Mocks existentes
vi.mock("@/contexts/PlayerContext", () => ({
  usePlayer: vi.fn(),
}));
vi.mock("@/assets/06-secret_front.png", () => ({
  default: "secret-front.png",
}));
vi.mock("@/assets/04-secret_accomplice.png", () => ({
  default: "secret-accomplice.png",
}));
vi.mock("@/assets/03-secret_murderer.png", () => ({
  default: "secret-murderer.png",
}));
vi.mock("@/assets/05-secret_back.png", () => ({
  default: "secret-back.png",
}));

import { getBoderClass } from "../utils/secretClassName";

const mockGetBoderClass = getBoderClass as Mock;
const mockUsePlayer = usePlayer as Mock;
const mockIsSelectableSecret = vi.fn();

describe("Secret Component", () => {
  const mockPlayer = { id: crypto.randomUUID(), name: "TestPlayer" };
  const mockOtherPlayerId = crypto.randomUUID();

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
    // Secreto de otro jugador para pruebas de selección
    other: {
      type: "MURDERER",
      id: "secret-other-id" as UUID,
      content: "Secret of other player",
      match_id: crypto.randomUUID(),
      secret_id: crypto.randomUUID(),
      player_id: mockOtherPlayerId,
      is_revealed: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetBoderClass.mockClear(); // Limpiar el mock de la función de clase
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
  });

  describe("Security - Not showing other players secrets", () => {
    it("should render secret back for other players", () => {
      const otherPlayer = { id: mockOtherPlayerId, name: "OtherPlayer" };
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
        expect.stringContaining("secret-back.png"),
      );
      expect(image).toHaveClass("w-full", "h-full");
    });
  });

  describe("Revealed secrets functionality", () => {
    it("should show revealed secret with red border and eye icon for current player", () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      const revealedSecret = {
        ...mockSecrets.innocent,
        type: "MURDERER" as const,
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

      const image = screen.getByRole("img");
      expect(image).toHaveClass("brightness-50");

      const eyeIcon = container.querySelector(".bg-red-500.rounded-full");
      expect(eyeIcon).toBeInTheDocument();
    });

    it("should show revealed secret without special styling for other players viewing it", () => {
      const otherPlayer = { id: mockOtherPlayerId, name: "OtherPlayer" };
      mockUsePlayer.mockReturnValue({ player: otherPlayer });

      const revealedSecret = {
        ...mockSecrets.innocent,
        type: "MURDERER" as const,
        player_id: mockPlayer.id,
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

      expect(container.querySelector(".bg-red-500")).not.toBeInTheDocument();

      expect(image).not.toHaveClass("brightness-50");
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

  describe("getBoderClass", () => {
    it("should call getBoderClass with correct arguments in a 'selection mode' scenario", () => {
      // Configuramos el escenario:
      // 1. Es un secreto de OTRO jugador, NO REVELADO. (isSelfRevealed = false)
      // 2. Estamos en modo de evento de selección de secreto (isTargetSecret = true).
      // 3. El target es NULL (estamos en el paso de selección: isSelectingTarget = true).
      // 4. El secreto ES una opción válida (isSelectableSecret retorna true).

      const targetSecret = {
        ...mockSecrets.other,
        id: "selected-secret-id" as UUID,
        player_id: mockOtherPlayerId,
        is_revealed: false,
      };

      mockUsePlayer.mockReturnValue({ player: mockPlayer });
      mockIsSelectableSecret.mockReturnValue(true);

      render(
        <Secret
          secret={targetSecret}
          isSelectableSecret={mockIsSelectableSecret}
          isTargetSecret={true}
          target={null}
        />,
      );

      // Argumentos que deben calcularse en Secret.tsx:
      // isSessionPlayer = false, isRevealed = false
      // isSelfRevealed = false (isRevealed && isSessionPlayer)

      // isTarget = false (target?.id !== secret.id)
      // isSelectingTarget = true (target === null)
      // isSelectable = true (mockIsSelectableSecret retorna true)
      // isSelectionMode = true (!isSelfRevealed && isTargetSecret)

      expect(mockGetBoderClass).toHaveBeenCalledWith(
        false,
        true,
        true,
        false,
        true,
      );

      // Verificamos que se utiliza la clase mockeada
      const secretDiv = screen.getByTestId("secret").parentElement;
      expect(secretDiv).toHaveClass("mock-border-class");
    });
  });

  describe("Interactivity - handleClickSecret", () => {
    // Definimos un mock para el callback de selección
    const mockOnSelectTargetEvent = vi.fn();
    const mockSecretId = "secret-to-select";

    // Configuramos el secreto para que sea el que se pasa al callback
    const secretToSelect = {
      ...mockSecrets.other,
      id: mockSecretId,
      player_id: mockOtherPlayerId,
    } as unknown as GameSecret;

    it("should call onSelectTargetEvent with the secret object when clicked and callback is provided", async () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      render(
        <Secret
          secret={secretToSelect}
          onSelectTargetEvent={mockOnSelectTargetEvent}
          isSelectableSecret={mockIsSelectableSecret}
          isTargetSecret={true}
          target={null}
        />,
      );

      const image = screen.getByTestId("secret");
      const secretElement = image.parentElement as HTMLElement;
      await act(() => fireEvent.click(secretElement));

      expect(mockOnSelectTargetEvent).toHaveBeenCalledTimes(1);
      expect(mockOnSelectTargetEvent).toHaveBeenCalledWith(secretToSelect);
    });

    it("should NOT call onSelectTargetEvent when the prop is not provided, even if clicked", async () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });

      const { container } = render(
        <Secret
          secret={secretToSelect}
          // onSelectTargetEvent NO se pasa (o se pasa undefined)
          isSelectableSecret={mockIsSelectableSecret}
          isTargetSecret={false}
          target={null}
        />,
      );

      const secretElement = container.querySelector("div") as HTMLElement;
      fireEvent.click(secretElement);

      expect(mockOnSelectTargetEvent).not.toHaveBeenCalled();
    });
  });
});
