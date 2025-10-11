import type { GameSecret, Secret, SecretType } from "@/types/secret";

import { usePlayer } from "@/contexts/PlayerContext";
import { RiEyeLine } from "@remixicon/react";

import secretFront from "@/assets/06-secret_front.png";
import secretAccomplice from "@/assets/04-secret_accomplice.png";
import secretMurder from "@/assets/03-secret_murderer.png";
import secretBack from "@/assets/05-secret_back.png";

const SECRET_IMAGE_PATHS: Record<SecretType, string> = {
  INNOCENT: secretFront,
  ACCOMPLICE: secretAccomplice,
  MURDERER: secretMurder,
};

interface SecretProps {
  secret: GameSecret | null;
}

export default function Secret({ secret }: SecretProps) {
  const { player } = usePlayer();

  if (!secret) {
    console.warn("Secret component: secret prop is missing");

    return null;
  }

  if (!Object.keys(SECRET_IMAGE_PATHS).includes(secret.type)) {
    console.warn("Secret component: invalid secret type");
    return null;
  }

  const isSessionPlayer = player?.id === secret.player_id;
  const isRevealed = secret.is_revealed;
  const canViewSecret = isSessionPlayer || isRevealed;

  const imagePath = canViewSecret
    ? SECRET_IMAGE_PATHS[secret.type]
    : secretBack;

  if (!imagePath) return null;

  const cardSize = !isSessionPlayer ? "w-15 h-22.5" : "w-20 h-30";

  const borderStyle =
    isRevealed && isSessionPlayer
      ? "border-4 border-red-500 shadow-lg shadow-red-500/50 w-21 h-31"
      : "";

  const brightness = isRevealed && isSessionPlayer ? "brightness-50" : "";

  return (
    <div className="relative">
      <div className={`rounded-lg overflow-hidden ${cardSize} ${borderStyle}`}>
        <img
          data-testid="secret"
          src={imagePath}
          alt={
            canViewSecret
              ? `Secret card: ${secret.type}`
              : "Secret card (hidden)"
          }
          className={`object-cover ${cardSize} ${brightness}`}
        />
      </div>
      {isRevealed && isSessionPlayer && (
        <div className="absolute -top-[3px] -right-[3px] bg-red-500 rounded-full p-1.5 shadow-lg">
          <RiEyeLine size={14} color="white" />
        </div>
      )}
    </div>
  );
}
