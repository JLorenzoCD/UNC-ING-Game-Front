import { useNavigate } from "react-router";

import type { MatchResult } from "@/types/match";

import Button from "@/components/Button";
import { FRONTEND_PATHS } from "@/constants/frontend";
import { RiArrowLeftLine } from "@remixicon/react";

interface ResultProps {
  result: MatchResult | null;
}

export default function Result({ result }: ResultProps) {
  const navigate = useNavigate();

  if (!result) return null;

  const handleReturnToMatchList = () => {
    navigate(FRONTEND_PATHS.MATCH_LIST);
  };

  return (
    <div data-testid="result" className="w-screen h-screen fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-grayscale backdrop-brightness-50 pointer-events-none" />

      <div className="absolute top-16 w-full h-full flex flex-col justify-start items-center">
        <div className="max-w-lg py-6 w-full flex flex-col gap-y-6 bg-white rounded-lg text-center">
          <h2 className="text-2xl font-bold">Match Result</h2>
          <p className="max-w-[24ch] mx-auto text-xl">{result.details}</p>

          <Button
            onClick={handleReturnToMatchList}
            className="mx-auto flex gap-x-2 items-center justify-center"
          >
            <RiArrowLeftLine />
            Return to match list
          </Button>
        </div>
      </div>
    </div>
  );
}
