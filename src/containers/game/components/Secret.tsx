import { twJoin } from "tailwind-merge";

import { usePlayer } from "@/contexts/PlayerContext";
import { RiCloseLargeFill, RiEyeLine } from "@remixicon/react";

import secretFront from "@/assets/06-secret_front.png";
import secretAccomplice from "@/assets/04-secret_accomplice.png";
import secretMurder from "@/assets/03-secret_murderer.png";
import secretBack from "@/assets/05-secret_back.png";

import type { GameSecret, Secret, SecretType } from "@/types/secret";
import type { GamePlayer } from "@/types/player";
import type { MatchSet } from "@/types/set";

import { getBoderClass } from "../utils/secretClassName";

const SECRET_IMAGE_PATHS: Record<SecretType, string> = {
  INNOCENT: secretFront,
  ACCOMPLICE: secretAccomplice,
  MURDERER: secretMurder,
};

interface SecretProps {
  onSelectTargetEvent?: (target: GamePlayer | GameSecret | MatchSet) => void;
  isSelectableSecret: (secret: GameSecret) => boolean;

  secret: GameSecret | null;

  isTargetSecret: boolean;
  target: GamePlayer | GameSecret | MatchSet | null;
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
    return <EmptySecret />;
  }

  if (!Object.keys(SECRET_IMAGE_PATHS).includes(secret.type)) {
    console.warn("Secret component: invalid secret type");
    return null;
  }

  const isSelectable = isSelectableSecret(secret);

  const handleClickSecret = () => {
    if (typeof onSelectTargetEvent !== "function" || !isSelectable) return;

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

  const isSelfRevealed = isRevealed && isSessionPlayer;

  // Cartas que NO son la propia y NO están reveladas
  const isSelectionMode = !isSelfRevealed && isTargetSecret;

  // ClassNames
  const baseClasses =
    "w-15 h-22.5 rounded-lg overflow-hidden transition-all duration-200";

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
        className={twJoin(baseClasses, boderClass)}
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

function EmptySecret() {
  return (
    <div
      data-testid="empty-secret"
      className="w-15 h-22.5 flex items-center justify-center border-2 border-dashed border-gray-400 text-gray-400 rounded-lg"
    >
      <RiCloseLargeFill />
    </div>
  );
}
