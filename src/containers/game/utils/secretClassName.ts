export function getBoderClass(
  isSelfRevealed: boolean,
  isSelectionMode: boolean,
  isSelectable: boolean,
  isTarget: boolean,
  isSelectingTarget: boolean,
) {
  let borderClass = "";
  if (isSelfRevealed) {
    borderClass =
      "border-4 border-red-500 shadow-lg shadow-red-500/50 w-21 h-31";

    if (isSelectable && isSelectingTarget) {
      borderClass += " animate-pulse cursor-pointer";
    } else if (isSelectable && isTarget) {
      borderClass =
        "border-4 border-blue-500 shadow-lg shadow-blue-500/50 w-21 h-31";
    }
  } else if (isSelectionMode) {
    if (isSelectable) {
      if (isTarget) {
        // Secreto seleccionado
        borderClass =
          "border-2 border-red-400 shadow-lg shadow-red-400/50 animate-none";
      } else if (isSelectingTarget) {
        // Aún no se ha seleccionado y es una opción válida
        borderClass =
          "border-2 border-blue-400 shadow-lg shadow-blue-400/50 animate-pulse cursor-pointer";
      } else {
        borderClass = "border-2 border-transparent shadow-none brightness-50";
      }
    } else {
      // NO Seleccionable (Atenuado)
      borderClass = "border-2 border-transparent shadow-none brightness-50";
    }
  }

  return borderClass;
}
