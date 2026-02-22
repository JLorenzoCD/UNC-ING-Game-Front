import type { ReactNode } from "react";

import Loading from "@/components/Loading";

interface MatchListProps {
  title: string;
  emptyText?: string;
  type?: "ONGOING_MATCH" | "MATCH";
  isLoading: boolean;
  children: ReactNode;
}

export default function MatchList({
  isLoading,
  children,
  title,
  type = "MATCH",
  emptyText = "There are no games available",
}: MatchListProps) {
  const isEmpty =
    !isLoading &&
    (!children || (Array.isArray(children) && children.length === 0));

  return (
    <div
      data-testid="match-list"
      className="bg-white rounded-xl p-4 max-w-3xl mx-auto mb-5"
    >
      <h1 className="text-center text-3xl font-bold">{title}</h1>
      <hr className="my-2" />
      <ul
        className={`${type === "MATCH" ? "min-h-[40vh]" : "max-h-[20vh]"}  bg-[#f3f3f3] rounded-xl p-1 flex flex-col overflow-y-auto`}
      >
        {isLoading ? (
          <div className="flex justify-center items-center grow">
            <Loading />
          </div>
        ) : isEmpty ? (
          <div className="flex justify-center items-center grow">
            <p>{emptyText}</p>
          </div>
        ) : (
          children
        )}
      </ul>
    </div>
  );
}
