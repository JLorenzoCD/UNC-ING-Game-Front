import { twJoin } from "tailwind-merge";

import { usePlayer } from "@/contexts/PlayerContext";
import { RiEyeLine } from "@remixicon/react";

import secretFront from "@/assets/06-secret_front.png";
import secretAccomplice from "@/assets/04-secret_accomplice.png";
import secretMurder from "@/assets/03-secret_murderer.png";
import secretBack from "@/assets/05-secret_back.png";

import type { GameSecret, Secret, SecretType } from "@/types/secret";
import type { GamePlayer } from "@/types/player";

const SECRET_IMAGE_PATHS: Record<SecretType, string> = {
  INNOCENT: secretFront,
  ACCOMPLICE: secretAccomplice,
  MURDERER: secretMurder,
};

function getBoderClass(
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
  } else if (isSelectionMode) {
    if (isSelectable) {
      if (isTarget) {
        // Secreto seleccionado
        borderClass =
          "border-2 border-blue-400 shadow-lg shadow-blue-400/50 animate-none";
      } else if (isSelectingTarget) {
        // Aún no se ha seleccionado y es una opción válida
        borderClass =
          "border-2 border-red-400 shadow-lg shadow-red-400/50 animate-pulse cursor-pointer";
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

interface SecretProps {
  onSelectTargetEvent?: (target: GamePlayer | GameSecret) => void;
  isSelectableSecret: (secret: GameSecret) => boolean;

  secret: GameSecret | null;

  isTargetSecret: boolean;
  target: GamePlayer | GameSecret | null;
}

export default function Secret({
  onSelectTargetEvent,
  isSelectableSecret,

  secret,

  isTargetSecret,
  target,
}: SecretProps) {
  const { player } = usePlayer();

  if (!secret) {
    console.warn("Secret component: secret prop is missing");

    return null;
  }

  if (!Object.keys(SECRET_IMAGE_PATHS).includes(secret.type)) {
    console.warn("Secret component: invalid secret type");
    return null;
  }

  const handleClickSecret = () => {
    if (typeof onSelectTargetEvent !== "function") return;

    onSelectTargetEvent(secret);
  };

  const isSessionPlayer = player?.id === secret.player_id;
  const isRevealed = secret.is_revealed;
  const canViewSecret = isSessionPlayer || isRevealed;

  const imagePath = canViewSecret
    ? SECRET_IMAGE_PATHS[secret.type]
    : secretBack;

  const isTarget = target?.id === secret.id;
  const isSelectingTarget = target === null;
  const isSelectable = isSelectableSecret(secret);

  const isSelfRevealed = isRevealed && isSessionPlayer;

  // Cartas que NO son la propia y NO están reveladas
  const isSelectionMode = !isSelfRevealed && isTargetSecret;

  // ClassNames
  const sizeClasses = isSessionPlayer ? "w-20 h-30" : "w-15 h-22.5";
  const baseClasses = "rounded-lg overflow-hidden transition-all duration-200";
  const boderClass = getBoderClass(
    isSelfRevealed,
    isSelectionMode,
    isSelectable,
    isTarget,
    isSelectingTarget,
  );

  return (
    <div className="relative">
      <div
        onClick={handleClickSecret}
        className={twJoin(baseClasses, sizeClasses, boderClass)}
      >
        <img
          data-testid="secret"
          src={imagePath}
          alt={
            canViewSecret
              ? `Secret card: ${secret.type}`
              : "Secret card (hidden)"
          }
          className={twJoin(
            "object-cover w-full h-full",
            isSelfRevealed && "brightness-50",
          )}
        />
      </div>
      {isSelfRevealed && (
        <div className="absolute -top-[3px] -right-[3px] bg-red-500 rounded-full p-1.5 shadow-lg">
          <RiEyeLine size={14} color="white" />
        </div>
      )}
    </div>
  );
}
