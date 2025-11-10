import { useMemo, useState } from "react";

export function useCarousel<T>(items: T[], itemsPerPage: number) {
  const [page, setPage] = useState<number>(0);

  const startIndex = page * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const displayedItems: Array<T | null> = useMemo(() => {
    let slicedItems = items.slice(startIndex, endIndex);

    if (slicedItems.length < itemsPerPage) {
      slicedItems = [
        ...slicedItems,
        ...Array(itemsPerPage - slicedItems.length).fill(null),
      ];
    }

    return slicedItems;
  }, [items, startIndex, endIndex, itemsPerPage]);

  const canGoPrevPage = page > 0;
  const canGoNextPage = endIndex < items.length;

  const handlePrevPage = () => {
    if (canGoPrevPage) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNextPage) {
      setPage(page + 1);
    }
  };

  return {
    displayedItems,
    canGoPrevPage,
    canGoNextPage,
    handlePrevPage,
    handleNextPage,
  };
}
