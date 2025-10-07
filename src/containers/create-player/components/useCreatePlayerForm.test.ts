import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useCreatePlayerForm from "./useCreatePlayerForm";

// Mocks para la fecha para pruebas de edad (Bloqueamos la fecha actual)
const MOCK_CURRENT_DATE = "2023-10-25T10:00:00.000Z";
vi.useFakeTimers();
vi.setSystemTime(new Date(MOCK_CURRENT_DATE));

describe("useCreatePlayerForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize formData, errors, and submission status correctly", () => {
    const { result } = renderHook(() => useCreatePlayerForm());

    expect(result.current.formData).toEqual({
      name: "",
      avatar: "",
      birthday: "",
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.haveError).toBe(false);
  });

  describe("Validations", () => {
    it("should update formData and run validation on text input change (name)", () => {
      const { result } = renderHook(() => useCreatePlayerForm());

      const mockEvent = {
        target: { name: "name", value: "ValidName" },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(result.current.formData.name).toBe("ValidName");
      expect(result.current.errors.name).toBe(""); // Debería ser válido
      expect(result.current.haveError).toBe(false);
    });

    it("should update formData and run validation on avatar change", () => {
      const { result } = renderHook(() => useCreatePlayerForm());
      const mockAvatarUrl = "/path/to/avatar.png";

      act(() => {
        result.current.handleAvatarChange(mockAvatarUrl);
      });

      expect(result.current.formData.avatar).toBe(mockAvatarUrl);
      expect(result.current.errors.avatar).toBe(""); // Debería ser válido
    });

    it("should set error for empty name", () => {
      const { result } = renderHook(() => useCreatePlayerForm());
      const mockEvent = {
        target: { name: "name", value: " " },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(result.current.errors.name).toBe("The nickname is required");
      expect(result.current.haveError).toBe(true);
    });

    it("should set error for name containing spaces", () => {
      const { result } = renderHook(() => useCreatePlayerForm());
      const mockEvent = {
        target: { name: "name", value: "Invalid Name" },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(result.current.errors.name).toBe(
        "The nickname must not contain spaces",
      );
      expect(result.current.haveError).toBe(true);
    });

    it("should set error for empty birthday", () => {
      const { result } = renderHook(() => useCreatePlayerForm());
      const mockEvent = {
        target: { name: "birthday", value: "" },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(result.current.errors.birthday).toBe("The birthdate is required");
      expect(result.current.haveError).toBe(true);
    });

    it("should set error for age below 5 years", () => {
      const { result } = renderHook(() => useCreatePlayerForm());

      const dateTooYoung = "2019-11-01"; // 4 años
      const mockEvent = {
        target: { name: "birthday", value: dateTooYoung },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(result.current.errors.birthday).toBe(
        "The birthdate must be between 5 and 110 years ago",
      );
    });

    it("should set error for age above 110 years", () => {
      const { result } = renderHook(() => useCreatePlayerForm());
      const dateTooOld = "1912-10-01"; // 111 años
      const mockEvent = {
        target: { name: "birthday", value: dateTooOld },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(result.current.errors.birthday).toBe(
        "The birthdate must be between 5 and 110 years ago",
      );
    });

    it("should clear error for valid birthday (e.g., 20 years old)", () => {
      const { result } = renderHook(() => useCreatePlayerForm());

      const validDate = "2003-01-01";
      const mockEvent = {
        target: { name: "birthday", value: validDate },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(mockEvent);
      });

      expect(result.current.errors.birthday).toBe("");
    });

    it("should set errors for all required fields when submitting an empty form", async () => {
      const { result } = renderHook(() => useCreatePlayerForm());

      // Mock para prevenir el envío del formulario.
      const mockFormEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;
      const mockHandleCreatePlayer = vi.fn();

      await act(async () => {
        // Ejecutamos handleSubmit con datos vacíos
        await result.current.handleSubmit(
          mockFormEvent,
          mockHandleCreatePlayer,
        );
      });

      // Verificaciones: Se debe haber detectado el error del avatar y otros
      // errores de campos requeridos.

      // El formulario no debe haberse enviado al servicio externo
      expect(mockHandleCreatePlayer).not.toHaveBeenCalled();

      expect(result.current.haveError).toBe(true);
      expect(result.current.errors.avatar).toBe("The avatar is required");
      expect(result.current.errors.name).toBe("The nickname is required");
      expect(result.current.errors.birthday).toBe("The birthdate is required");
    });
  });
});
