import type { HandSecret } from "@/types/secret";
import Secret from "./Secret";

type SecretsProps = {
  secrets: HandSecret[];
};

export default function Secrets({ secrets }: SecretsProps) {
  return (
    <div className="flex space-x-4">
      {secrets.map((secret) => (
        <Secret key={secret.id} secret={secret} />
      ))}
    </div>
  );
}
