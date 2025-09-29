import type { ReactNode } from "react";

import Loading from "@/components/Loading";

interface ListMatchesProps {
  isLoading: boolean;
  children: ReactNode;
}

function ListMatches({ isLoading, children }: ListMatchesProps) {
  const isEmpty =
    !isLoading &&
    (!children || (Array.isArray(children) && children.length === 0));
  
  console.log({ isEmpty, isLoading, children });

  return (
    <div data-testid="list-matches" className="bg-white rounded-xl p-6 max-w-3xl mx-auto">
      <h1 className="text-center text-4xl font-bold">List of matches</h1>
      <hr className="my-2" />
      <ul className="min-h-[40vh] bg-[#f3f3f3] rounded-xl p-1 flex flex-col">
        {isLoading ? (
          <div className="flex justify-center items-center flex-grow">
            <Loading />
          </div>
        ) : isEmpty ? (
          <div className="flex justify-center items-center flex-grow">
            <p>There are no games available, why don&apos;t you create one?</p>
          </div>
        ) : (
          children
        )}
      </ul>
    </div>
  );
}

export default ListMatches;
