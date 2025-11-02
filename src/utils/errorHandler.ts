import { toast } from "sonner";

/**
 * Maneja errores de API mostrando un toast al usuario y loggeando en consola.
 *
 * @param error - El error capturado
 * @param message - Mensaje amigable para mostrar al usuario
 * @param context - Contexto adicional para debugging (opcional)
 *
 * @example
 * try {
 *   await httpService.putTakeCards(matchId, playerId, cardIds);
 * } catch (error) {
 *   handleApiError(error, "Failed to take cards");
 *   throw error; // Re-throw si el caller necesita manejarlo
 * }
 */
export function handleApiError(
  error: unknown,
  message: string,
  context?: Record<string, unknown>,
): void {
  // Log completo para debugging
  console.error("[API Error]", message, {
    error,
    context,
    timestamp: new Date().toISOString(),
  });

  // Toast para el usuario
  toast.error(message);
}

/**
 * Maneja errores inesperados en componentes.
 * Similar a handleApiError pero sin mostrar toast (para casos donde ya hay UI de error).
 *
 * @param error - El error capturado
 * @param context - Contexto para debugging
 */
export function logError(
  error: unknown,
  context: string,
  additionalInfo?: Record<string, unknown>,
): void {
  console.error(`[Error] ${context}`, {
    error,
    additionalInfo,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Extrae un mensaje de error legible de diferentes tipos de errores.
 *
 * @param error - Error de cualquier tipo
 * @returns Mensaje de error como string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Unknown error occurred";
}
