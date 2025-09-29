import type { UUID } from "@/types/common";

/**
 * Verificar si una cadena es un UUID válido.
 * @param value La cadena a verificar.
 * @returns `true` si la cadena es un UUID válido, `false` en caso contrario.
 * @example
 * console.log(isUUID("123e4567-e89b-12d3-a456-426614174000")); // true
 * console.log(isUUID("invalid-uuid-string")); // false
 */
export const isUUID = (value: string): value is UUID => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return uuidRegex.test(value);
}