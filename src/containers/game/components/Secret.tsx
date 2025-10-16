import { twMerge } from "tailwind-merge";

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

interface SecretProps {
  onSelectTargetEvent?: (target: GamePlayer | GameSecret) => void;

  secret: GameSecret | null;

  isTargetSecret: boolean;
  target: GamePlayer | GameSecret | null;
}

export default function Secret({
  onSelectTargetEvent,

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

  const isCurrPlayerSecretReveled = isRevealed && isSessionPlayer;
  const isCurrPlayerSelectingSecret = !isSessionPlayer && isTargetSecret;

  return (
    <div className="relative">
      <div
        onClick={handleClickSecret}
        className={twMerge(
          "rounded-lg overflow-hidden",
          !isSessionPlayer ? "w-15 h-22.5" : "w-20 h-30",
          isCurrPlayerSecretReveled &&
            isSelectingTarget &&
            "border-4 border-red-500 shadow-lg shadow-red-500/50 w-21 h-31",
          isCurrPlayerSelectingSecret &&
            isSelectingTarget &&
            "border-red-400 border-2 shadow-lg shadow-red-400/50 animate-pulse",
          isCurrPlayerSelectingSecret &&
            isTarget &&
            "border-blue-400 border-2 shadow-lg shadow-blue-400/50 animate-none",
          !isSessionPlayer &&
            isTargetSecret &&
            !isTarget &&
            !isSelectingTarget &&
            "border-2 border-transparent shadow-none animate-none brightness-50",
        )}
      >
        <img
          data-testid="secret"
          src={imagePath}
          alt={
            canViewSecret
              ? `Secret card: ${secret.type}`
              : "Secret card (hidden)"
          }
          className={twMerge(
            "object-cover w-full h-full",
            isCurrPlayerSecretReveled && "brightness-50",
          )}
        />
      </div>
      {isCurrPlayerSecretReveled && (
        <div className="absolute -top-[3px] -right-[3px] bg-red-500 rounded-full p-1.5 shadow-lg">
          <RiEyeLine size={14} color="white" />
        </div>
      )}
    </div>
  );
}
