import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreatePlayerForm from "./CreatePlayerForm";

// Mock para el componente AlertErrorList, Input y Button
vi.mock("@/components/Input", () => ({
  default: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input data-testid={`input-${props.name}`} {...props} />
  ),
}));
vi.mock("@/components/Button", () => ({
  default: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button data-testid="submit-button" {...props}>
      {props.children}
    </button>
  ),
}));
vi.mock("@/components/AlertErrorList", () => ({
  default: vi.fn(
    ({
      title,
      errorList,
    }: {
      title: string;
      errorList: {
        key: string | number;
        error: string;
      }[];
    }) => (
      <div data-testid="mock-alert-error-list">
        <h2 data-testid="mock-alert-title">{title}</h2>
        <ul>
          {errorList.map(({ key, error }) => (
            <li key={key} data-testid="mock-error-item">
              {error}
            </li>
          ))}
        </ul>
      </div>
    ),
  ),
}));

const defaultHookValues = {
  formData: { name: "test", avatar: "/path/1.png", birthday: "2000-01-01" },
  errors: {},
  handleChange: vi.fn(),
  handleAvatarChange: vi.fn(),
  handleSubmit: vi.fn(),
  getInputErrorClassName: vi.fn(),
  haveError: false,
  isSubmitting: false,
};
vi.mock("./useCreatePlayerForm", () => ({
  default: vi.fn(() => defaultHookValues),
}));

describe("CreatePlayerForm", () => {
  let mockHandleCreatePlayer: ReturnType<typeof vi.fn>;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockHandleCreatePlayer = vi.fn();
    user = userEvent.setup();
  });

  describe("Rendering", () => {
    it("renders all form fields, avatars, and submit button", () => {
      render(<CreatePlayerForm handleCreatePlayer={mockHandleCreatePlayer} />);

      expect(screen.getByLabelText(/Nickname */i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Birthday */i)).toBeInTheDocument();
      expect(screen.getAllByAltText(/Avatar: /i).length).toBeGreaterThan(0);
      expect(
        screen.getByRole("button", { name: /Create Player/i }),
      ).toBeInTheDocument();
    });

    it("renders AlertErrorList when haveError is true", () => {
      defaultHookValues.haveError = true;
      defaultHookValues.errors = {
        name: "Name error",
        birthday: "Birthday error",
      };

      render(<CreatePlayerForm handleCreatePlayer={mockHandleCreatePlayer} />);

      const errorAlert = screen.getByTestId("mock-alert-error-list");
      expect(errorAlert).toBeInTheDocument();

      // Le pasa el titulo al componente AlertErrorList
      expect(screen.getByTestId("mock-alert-title")).toHaveTextContent(
        "There are errors in the form, please note the following:",
      );
      expect(screen.getByText("Name error")).toBeInTheDocument();
      expect(screen.getByText("Birthday error")).toBeInTheDocument();

      // Restaurar el mock
      vi.restoreAllMocks();
    });
  });

  describe("Interactions", () => {
    it("calls handleChange when nickname input is changed", async () => {
      render(<CreatePlayerForm handleCreatePlayer={mockHandleCreatePlayer} />);

      const nicknameInput = screen.getByLabelText(/Nickname */i);
      await user.type(nicknameInput, "NewName");

      expect(defaultHookValues.handleChange).toHaveBeenCalled();
    });

    it("calls handleAvatarChange when an avatar image is clicked", async () => {
      render(<CreatePlayerForm handleCreatePlayer={mockHandleCreatePlayer} />);

      const firstAvatar = screen.getAllByRole("img")[0];

      await user.click(firstAvatar);

      expect(defaultHookValues.handleAvatarChange).toHaveBeenCalledWith(
        expect.any(String),
      ); // Verifica que se pasa la URL del path
    });

    it("disables the submit button when isSubmitting is true", () => {
      defaultHookValues.isSubmitting = true;
      render(<CreatePlayerForm handleCreatePlayer={mockHandleCreatePlayer} />);

      expect(screen.getByTestId("submit-button")).toBeDisabled();
    });

    it("disables the submit button when haveError is true", () => {
      defaultHookValues.haveError = true;
      render(<CreatePlayerForm handleCreatePlayer={mockHandleCreatePlayer} />);

      expect(screen.getByTestId("submit-button")).toBeDisabled();
    });
  });

  describe("Styling", () => {
    it("applies the error class name returned by getInputErrorClassName", () => {
      const mockErrorClass = "border-red-500";

      defaultHookValues.getInputErrorClassName = vi.fn((fieldName: string) =>
        fieldName === "name" ? mockErrorClass : "",
      );

      render(<CreatePlayerForm handleCreatePlayer={mockHandleCreatePlayer} />);

      const nicknameInput = screen.getByTestId("input-name");
      const birthdayInput = screen.getByTestId("input-birthday");

      // El input 'name' debe tener la clase de error
      expect(nicknameInput).toHaveClass(mockErrorClass);
      // El input 'birthday' NO debe tener la clase de error
      expect(birthdayInput).not.toHaveClass(mockErrorClass);
    });

    it("applies the blue border class to the selected avatar based on formData", async () => {
      // Mockear el hook para simular que el primer avatar está seleccionado
      defaultHookValues.formData = {
        ...defaultHookValues.formData,
        avatar: "/src/assets/avatars/icono1.png",
      };

      render(<CreatePlayerForm handleCreatePlayer={mockHandleCreatePlayer} />);

      const allAvatars = screen.getAllByRole("img");

      // Asumimos que el primer elemento corresponde al path mockeado
      const selectedAvatar = allAvatars[0];
      const otherAvatar = allAvatars[1];

      // El avatar seleccionado debe tener la clase del borde azul
      expect(selectedAvatar).toHaveClass("border-blue-500");
      expect(selectedAvatar).not.toHaveClass("border-transparent");

      // Los otros avatares NO deben tener la clase del borde azul
      expect(otherAvatar).toHaveClass("border-transparent");
      expect(otherAvatar).not.toHaveClass("border-blue-500");
    });
  });
});
