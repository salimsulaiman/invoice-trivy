import * as React from "react"
import { useDebounce } from "use-debounce"
import { startOfDay, endOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import type { IInvoice, InvoiceStatus } from "../types/invoice"
import { useFilterState } from "@/hooks/use-query-params"

export function useInvoiceFilters(data: IInvoice[] | undefined) {
  const { searchValue, setSearchValue, debouncedSearch, updateParams, searchParams } = useFilterState();

  const [statusFilter, setStatusFilter] = React.useState<InvoiceStatus | "all">(
    (searchParams.get("status") as InvoiceStatus) || "all"
  )

  const [date, setDate] = React.useState<DateRange | undefined>(undefined)
  const [page, setPage] = React.useState(1)
  
  const [debouncedDate] = useDebounce(date, 500)
  const [isDebouncing, setIsDebouncing] = React.useState(false)

  React.useEffect(() => {
    updateParams({
      q: debouncedSearch,
      status: statusFilter !== "all" ? statusFilter : null
    })
    setIsDebouncing(false)
  }, [debouncedSearch, statusFilter, updateParams])

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, debouncedDate])

  const filteredData = React.useMemo(() => {
    if (!data) return []

    let result = data

    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase()
      result = result.filter((item) =>
        item.invoice_number.toLowerCase().includes(search) ||
        item.customers?.name.toLowerCase().includes(search) ||
        item.title?.toLowerCase().includes(search)
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter)
    }

    if (debouncedDate?.from) {
      const start = startOfDay(debouncedDate.from)
      const end = debouncedDate.to
        ? endOfDay(debouncedDate.to)
        : endOfDay(debouncedDate.from)

      result = result.filter((item) => {
        const itemDate = new Date(item.issue_date)
        return itemDate >= start && itemDate <= end
      })
    }

    return result
  }, [data, debouncedSearch, statusFilter, debouncedDate])

  const handleSearchChange = (value: string) => {
    setIsDebouncing(true)
    setSearchValue(value)
  }

  const handleStatusChange = (value: InvoiceStatus | "all") => {
    setIsDebouncing(true)
    setStatusFilter(value)
    setTimeout(() => setIsDebouncing(false), 500)
  }

  const handleDateChange = (value: DateRange | undefined) => {
    setIsDebouncing(true)
    setDate(value)
    setTimeout(() => setIsDebouncing(false), 500)
  }

  const resetFilters = () => {
    setSearchValue("")
    setStatusFilter("all")
    setDate(undefined)
    setPage(1)
    setIsDebouncing(false)
  }

  return {
    searchValue,
    statusFilter,
    date,
    page,
    filteredData,
    isDebouncing,
    setSearchValue: handleSearchChange,
    setStatusFilter: handleStatusChange,
    setDate: handleDateChange,
    setPage,
    resetFilters,
  }
}