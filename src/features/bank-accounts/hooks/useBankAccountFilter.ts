import * as React from "react"
import type { IBankAccount } from "../types/bank-account"
import { useFilterState } from "@/hooks/use-query-params"

export type BankStatusFilter = "all" | "active" | "inactive"

export function useBankAccountFilters(data: IBankAccount[] | undefined) {
  const { searchValue, setSearchValue, debouncedSearch } = useFilterState()

  const [status, setStatus] = React.useState<BankStatusFilter>("all")

  const filteredData = React.useMemo(() => {
    if (!data) return []
    let result = data

    if (debouncedSearch) {
      const keyword = debouncedSearch.toLowerCase()
      result = result.filter(
        (item) =>
          item.bank_name.toLowerCase().includes(keyword) ||
          item.account_holder.toLowerCase().includes(keyword) ||
          item.account_number.includes(keyword)
      )
    }

    if (status !== "all") {
      result = result.filter((item) =>
        status === "active" ? item.is_active : !item.is_active
      )
    }

    return result
  }, [data, debouncedSearch, status])

  const isFiltering = Boolean(debouncedSearch) || status !== "all"

  const resetFilters = () => {
    setSearchValue("")
    setStatus("all")
  }

  return {
    searchValue,
    status,
    filteredData,
    isFiltering,
    setSearchValue,
    setStatus,
    resetFilters,
  }
}