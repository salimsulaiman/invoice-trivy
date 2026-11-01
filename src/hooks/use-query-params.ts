import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import * as React from "react";

export function useFilterState(initialQuery: string = "") {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = React.useState(searchParams.get("q") || initialQuery);
  const [debouncedSearch] = useDebounce(searchValue, 500);

  const updateParams = React.useCallback((params: Record<string, string | number | undefined | null>) => {
    const next = new URLSearchParams(window.location.search);
    let hasChanged = false;

    Object.entries(params).forEach(([key, value]) => {
      const newVal = (value === null || value === undefined || value === "" || value === "all") ? null : String(value);
      if (newVal === null) {
        if (next.has(key)) {
          next.delete(key);
          hasChanged = true;
        }
      } else if (next.get(key) !== newVal) {
        next.set(key, newVal);
        hasChanged = true;
      }
    });

    if (hasChanged) {
      setSearchParams(next, { replace: true });
    }
  }, [setSearchParams]);

  return { 
    searchValue, 
    setSearchValue, 
    debouncedSearch, 
    updateParams,
    searchParams 
  };
}