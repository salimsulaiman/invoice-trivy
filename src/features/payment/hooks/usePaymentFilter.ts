import * as React from "react"
import { useDebounce } from "use-debounce"
import { startOfDay, endOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { useFilterState } from "@/hooks/use-query-params"

type PaymentMethod = "Transfer Bank" | "Cash" | "E-Wallet" | "all"

export function usePaymentFilters(data: any[] | undefined) {
  const { searchValue, setSearchValue, debouncedSearch, updateParams, searchParams } = useFilterState();

  const [methodFilter, setMethodFilter] = React.useState<PaymentMethod>(
    (searchParams.get("method") as PaymentMethod) || "all"
  )

  const [date, setDate] = React.useState<DateRange | undefined>(undefined)
  const [page, setPage] = React.useState(1)
  
  const [debouncedDate] = useDebounce(date, 500)
  const [isDebouncing, setIsDebouncing] = React.useState(false)

  React.useEffect(() => {
    updateParams({
      q: debouncedSearch,
      method: methodFilter !== "all" ? methodFilter : null
    })
    setIsDebouncing(false)
  }, [debouncedSearch, methodFilter, updateParams])

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, methodFilter, debouncedDate])

  const filteredData = React.useMemo(() => {
    if (!data) return []

    let result = data

    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase()
      result = result.filter((item) =>
        item.invoices?.invoice_number?.toLowerCase().includes(search) ||
        item.note?.toLowerCase().includes(search)
      )
    }

    if (methodFilter !== "all") {
      result = result.filter((item) => item.method === methodFilter)
    }

    if (debouncedDate?.from) {
      const start = startOfDay(debouncedDate.from)
      const end = debouncedDate.to
        ? endOfDay(debouncedDate.to)
        : endOfDay(debouncedDate.from)

      result = result.filter((item) => {
        const itemDate = new Date(item.payment_date)
        return itemDate >= start && itemDate <= end
      })
    }

    return result
  }, [data, debouncedSearch, methodFilter, debouncedDate])

  const handleSearchChange = (value: string) => {
    setIsDebouncing(true)
    setSearchValue(value)
  }

  const handleMethodChange = (value: PaymentMethod) => {
    setIsDebouncing(true)
    setMethodFilter(value)
    setTimeout(() => setIsDebouncing(false), 500)
  }

  const handleDateChange = (value: DateRange | undefined) => {
    setIsDebouncing(true)
    setDate(value)
    setTimeout(() => setIsDebouncing(false), 500)
  }

  const resetFilters = () => {
    setSearchValue("")
    setMethodFilter("all")
    setDate(undefined)
    setPage(1)
    setIsDebouncing(false)
  }

  return {
    searchValue,
    methodFilter,
    date,
    page,
    filteredData,
    isDebouncing,
    setSearchValue: handleSearchChange,
    setMethodFilter: handleMethodChange,
    setDate: handleDateChange,
    setPage,
    resetFilters,
  }
}