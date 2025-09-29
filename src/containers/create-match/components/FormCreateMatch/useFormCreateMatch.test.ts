import "@testing-library/jest-dom";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { ChangeEvent, FormEvent } from "react";

import { FRONTEND_PATHS } from "@/constants/frontendPaths";
import { ERROR_MESSAGES, RANGE_PLAYERS } from "./constants";

import useFormCreateMatch from "./useFormCreateMatch";

// Mock de useNavigate para evitar errores de contexto
const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));
vi.mock("@/contexts/PlayerContext", () => ({
  usePlayer: () => ({
    player: { id: "mock-uuid-owner" },
  }),
}));

describe("useFormCreateMatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the initial state correctly", () => {
    const { result } = renderHook(() => useFormCreateMatch());

    expect(result.current.formData).toEqual({
      name: "",
      min_players: RANGE_PLAYERS.MIN.toString(),
      max_players: RANGE_PLAYERS.MAX.toString(),
    });
    expect(result.current.formError).toEqual({
      name: "",
      min_players: "",
      max_players: "",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.haveError).toBeFalsy();
  });

  describe("handleChange", () => {
    it("should update name field and clear error on valid input", () => {
      const { result } = renderHook(() => useFormCreateMatch());

      // Se pone solo espacios y se revisa que hay error
      act(() => {
        result.current.handleChange({
          target: { name: "name", value: "    " },
        } as ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.formError.name).toBe(ERROR_MESSAGES.NAME_EMPTY);

      // Se cambia el valor del input a uno valido y se revisa que se limpio el error
      act(() => {
        result.current.handleChange({
          target: { name: "name", value: "Valid Name" },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formData.name).toBe("Valid Name");
      expect(result.current.formError.name).toBe("");
      expect(result.current.haveError).toBeFalsy();
    });

    it("should set an error when a name is empty", () => {
      const { result } = renderHook(() => useFormCreateMatch());

      act(() => {
        result.current.handleChange({
          target: { name: "name", value: "" },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formError.name).toBe(ERROR_MESSAGES.NAME_EMPTY);
      expect(result.current.haveError).toBeTruthy();
    });

    it("should set an error when min_players is out of range", () => {
      const { result } = renderHook(() => useFormCreateMatch());

      act(() => {
        result.current.handleChange({
          target: {
            name: "min_players",
            value: (RANGE_PLAYERS.MIN - 1).toString(),
          },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formError.min_players).toBe(
        ERROR_MESSAGES.MIN_PLAYERS_OUT_RANGE,
      );
      expect(result.current.haveError).toBeTruthy();
    });

    it("should set an error when max_players is out of range", () => {
      const { result } = renderHook(() => useFormCreateMatch());

      act(() => {
        result.current.handleChange({
          target: {
            name: "max_players",
            value: (RANGE_PLAYERS.MAX + 1).toString(),
          },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formError.max_players).toBe(
        ERROR_MESSAGES.MAX_PLAYERS_OUT_RANGE,
      );
      expect(result.current.haveError).toBeTruthy();
    });

    it("should set an error when min_players is greater than max_players on change", () => {
      const { result } = renderHook(() => useFormCreateMatch());

      const curr_max_players = RANGE_PLAYERS.MAX - 1;

      act(() => {
        // Primero pongo un valor valido a max_players
        result.current.handleChange({
          target: { name: "max_players", value: curr_max_players.toString() },
        } as ChangeEvent<HTMLInputElement>);
      });
      act(() => {
        // Ahora pongo un valor valido para min_players, pero que sea mayor a max_players
        result.current.handleChange({
          target: {
            name: "min_players",
            value: (curr_max_players + 1).toString(),
          },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formError.min_players).toBe(
        ERROR_MESSAGES.MIN_PLAYERS_GREATER_MAX_PLAYERS,
      );
      expect(result.current.haveError).toBeTruthy();
    });

    it("should set an error when max_players is less than min_players on change", () => {
      const { result } = renderHook(() => useFormCreateMatch());

      const curr_min_players = RANGE_PLAYERS.MIN + 1;

      act(() => {
        // Primero pongo un valor valido a min_players
        result.current.handleChange({
          target: { name: "min_players", value: curr_min_players.toString() },
        } as ChangeEvent<HTMLInputElement>);
      });
      act(() => {
        // Ahora pongo un valor valido para max_players, pero que sea menor a min_players
        result.current.handleChange({
          target: {
            name: "max_players",
            value: (curr_min_players - 1).toString(),
          },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formError.max_players).toBe(
        ERROR_MESSAGES.MAX_PLAYERS_LESS_MIN_PLAYERS,
      );
      expect(result.current.haveError).toBeTruthy();
    });
  });

  describe("createHandleSubmit", () => {
    it("should not call handleCreateMatch if there are errors", async () => {
      const { result } = renderHook(() => useFormCreateMatch());
      const mockHandleCreateMatch = vi.fn();
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as FormEvent<HTMLFormElement>;

      // El campo name esta vació, por lo que da error
      act(() => {
        result.current.handleChange({
          target: { name: "name", value: "" },
        } as ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        const handleSubmit = result.current.createHandleSubmit(
          mockHandleCreateMatch,
        );
        await handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockHandleCreateMatch).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
      expect(result.current.formError.name).toBe(ERROR_MESSAGES.NAME_EMPTY);
    });

    it("should call handleCreateMatch with correct data on successful submit", async () => {
      const { result } = renderHook(() => useFormCreateMatch());

      const mockHandleCreateMatch = vi.fn();
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as FormEvent<HTMLFormElement>;
      const mockMatch = {
        id: "mock-uuid-match",
        name: "Test Match",
        min_players: RANGE_PLAYERS.MIN,
        max_players: RANGE_PLAYERS.MAX,
        status: "WAITING",
        owner_id: "mock-uuid-owner",
        current_player_order: 0,
      };

      mockHandleCreateMatch.mockResolvedValueOnce(mockMatch);

      // Se coloca valores validos
      act(() => {
        result.current.handleChange({
          target: { name: "name", value: mockMatch.name },
        } as ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        const handleSubmit = result.current.createHandleSubmit(
          mockHandleCreateMatch,
        );
        await handleSubmit(mockEvent);
      });

      expect(mockHandleCreateMatch).toHaveBeenCalledWith({
        owner_id: mockMatch.owner_id,
        name: mockMatch.name,
        min_players: mockMatch.min_players,
        max_players: mockMatch.max_players,
      });
      expect(result.current.loading).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith(
        FRONTEND_PATHS.MATCH_LOBBY(mockMatch.id),
      );
    });

    it("should handle errors from handleCreateMatch gracefully", async () => {
      const { result } = renderHook(() => useFormCreateMatch());

      const mockHandleCreateMatch = vi
        .fn()
        .mockRejectedValueOnce(new Error("API error"));
      const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});
      const mockConsoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as FormEvent<HTMLFormElement>;

      act(() => {
        result.current.handleChange({
          target: { name: "name", value: "Test Error Match" },
        } as ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        const handleSubmit = result.current.createHandleSubmit(
          mockHandleCreateMatch,
        );
        await handleSubmit(mockEvent);
      });

      expect(mockHandleCreateMatch).toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
      expect(mockAlert).toHaveBeenCalledWith("The match could not be created.");
      expect(mockConsoleError).toHaveBeenCalledWith(new Error("API error"));

      mockAlert.mockRestore();
      mockConsoleError.mockRestore();
    });
  });
});
