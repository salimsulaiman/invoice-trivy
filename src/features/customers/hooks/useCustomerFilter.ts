import * as React from "react"
import { useDebounce } from "use-debounce"
import { startOfDay, endOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import type { ICustomer } from "../types/customer"
import { useFilterState } from "@/hooks/use-query-params"

export function useCustomerFilters(data: ICustomer[] | undefined) {
  const { searchValue, setSearchValue, debouncedSearch } = useFilterState();

  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [page, setPage] = React.useState(1);
  const [debouncedDate] = useDebounce(date, 500);
  const [isDebouncing, setIsDebouncing] = React.useState(false);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, debouncedDate]);

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    let result = data;

    if (debouncedSearch) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (debouncedDate?.from) {
      const start = startOfDay(debouncedDate.from);
      const end = debouncedDate.to ? endOfDay(debouncedDate.to) : endOfDay(debouncedDate.from);

      result = result.filter((item) => {
        if (!item.created_at) return false;
        const itemDate = new Date(item.created_at);
        return itemDate >= start && itemDate <= end;
      });
    }

    return result;
  }, [data, debouncedSearch, debouncedDate]);

  const handleSearchChange = (value: string) => {
    setIsDebouncing(true);
    setSearchValue(value);
    setTimeout(() => setIsDebouncing(false), 500);
  };

  const handleDateChange = (value: DateRange | undefined) => {
    setIsDebouncing(true);
    setDate(value);
    setTimeout(() => setIsDebouncing(false), 500);
  };

  const resetFilters = () => {
    setSearchValue("");
    setDate(undefined);
    setPage(1);
  };

  return {
    searchValue,
    date,
    page,
    filteredData,
    isDebouncing,
    setSearchValue: handleSearchChange,
    setDate: handleDateChange,
    setPage,
    resetFilters,
  };
}