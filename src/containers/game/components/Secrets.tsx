import type { GameSecret } from "@/types/secret";
import Secret from "./Secret";

type SecretsProps = {
  secrets: GameSecret[]
}

export default function Secrets({ secrets }: SecretsProps) {
  return (
    <div data-testid="secrets" className="flex space-x-4">
      {secrets.map(secret => (
        <Secret key={secret.id} secret={secret}/>
      ))}
    </div>
  )
}