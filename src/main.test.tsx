import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockCreateRoot, mockRootElement } = vi.hoisted(() => {
  const mockCreateRoot = vi.fn(() => ({
    render: vi.fn(),
  }));

  // Se mockea el document.getElementById para simular el elemento raíz
  const mockRootElement = document.createElement("div");
  mockRootElement.id = "root";

  return {
    mockCreateRoot,
    mockRootElement,
  };
});

vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}));

vi.spyOn(document, "getElementById").mockImplementation((id) => {
  if (id === "root") {
    return mockRootElement;
  }
  return null;
});

describe("main initialization", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Importamos el archivo main *dentro* del test.
    // Esto asegura que la función createRoot se llame *después* de que haya sido mockeada.
    await import("../src/main");
  });

  it("should call createRoot with the correct DOM element", () => {
    expect(document.getElementById).toHaveBeenCalledWith("root");
    expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
  });
});
