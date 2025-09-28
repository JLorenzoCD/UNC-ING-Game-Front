import type { GameSecret, Secret, SecretType } from "@/types/secret";

import { usePlayer } from "@/contexts/PlayerContext";

import secretFront from "@/assets/06-secret_front.png"
import secretAccomplice from "@/assets/04-secret_accomplice.png"
import secretMurder from "@/assets/03-secret_murderer.png"

const SECRET_IMAGE_PATHS : Record <SecretType ,string> = {
  "INNOCENT" : secretFront,
  "ACCOMPLICE" : secretAccomplice,
  "MURDERER" : secretMurder
}

interface SecretProps {
  secret: GameSecret
}

export default function Secret({ secret }: SecretProps) {
  const { player } = usePlayer();

  if (!secret) {
    console.warn('Secret component: secret prop is missing');
    
    return null;
  }

  if (!Object.keys(SECRET_IMAGE_PATHS).includes(secret.type)) {
    console.warn('Secret component: invalid secret type');
    return null;
  }

  const imagePath = (player?.id === secret.player_id) ? SECRET_IMAGE_PATHS[secret.type] : null;
  
  if (!imagePath) return null;
  
  return (
    <img data-testid="secret" src={imagePath} alt={`Secret card: ${secret.type}`} className={`object-cover w-40 h-60`} />
  )
}