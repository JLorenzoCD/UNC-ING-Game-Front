import { twMerge } from "tailwind-merge";

export const truncateName = (name: string, maxLength = 15) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

export function getPlayerBorderClass(
  isTarget: boolean,
  isSelectable: boolean,
  isSelectingTarget: boolean,
  hasCurrentTurn: boolean,
  shouldHighlightRole: boolean,
  isActivePlayerSelection: boolean,
) {
  let borderClass = "border-transparent";

  if (isActivePlayerSelection) {
    borderClass = twMerge(borderClass, "border-10 shadow-lg");

    if (isSelectable) {
      if (isTarget) {
        // Es el objetivo ya seleccionado (Borde fijo)
        borderClass = twMerge(
          borderClass,
          "border-red-400 shadow-red-400/50 animate-none",
        );
      } else if (isSelectingTarget) {
        // Es una opción válida y se está esperando la selección (Pulso)
        borderClass = twMerge(
          borderClass,
          "border-blue-400 shadow-blue-400/50 animate-pulse cursor-pointer",
        );
      }
    } else {
      // NO Seleccionable (Atenuado)
      borderClass = twMerge(
        borderClass,
        "border-4 border-transparent shadow-none brightness-50 cursor-default",
      );
    }
  } else if (hasCurrentTurn) {
    borderClass = twMerge(
      borderClass,
      "border-green-400 shadow-lg shadow-green-400/50 animate-pulse",
    );
  } else if (shouldHighlightRole) {
    borderClass = twMerge(
      borderClass,
      "border-yellow-400 shadow-lg shadow-yellow-400/50",
    );
  }

  return borderClass;
}
