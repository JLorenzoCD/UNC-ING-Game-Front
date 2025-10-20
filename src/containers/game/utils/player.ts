export const truncateName = (name: string, maxLength = 15) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

export function getBoderPlayer(
  hasCurrentTurn: boolean,
  isActivePlayerSelection: boolean,
  isSelectable: boolean,
  isTarget: boolean,
  isSelectingTarget: boolean,
) {
  let borderClass = "border-transparent";

  if (isActivePlayerSelection) {
    // Modo Selección de Jugador

    if (isSelectable) {
      if (isTarget) {
        // Es el objetivo ya seleccionado (Borde fijo)
        borderClass =
          "border-red-400 border-10 shadow-lg shadow-red-400/50 animate-none";
      } else if (isSelectingTarget) {
        // Es una opción válida y se está esperando la selección (Pulso)
        borderClass =
          "border-blue-400 border-10 shadow-lg shadow-blue-400/50 animate-pulse cursor-pointer";
      }
    } else {
      // NO Seleccionable (Atenuado)
      borderClass =
        "border-4 border-transparent shadow-none brightness-50 cursor-default";
    }
  } else if (hasCurrentTurn) {
    borderClass =
      "border-green-400 shadow-lg shadow-green-400/50 animate-pulse";
  }

  return borderClass;
}
