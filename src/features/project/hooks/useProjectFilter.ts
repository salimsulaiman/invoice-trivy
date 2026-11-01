"use client"

import * as React from "react"
import { useDebounce } from "use-debounce"
import { startOfDay, endOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { useFilterState } from "@/hooks/use-query-params"

type ProjectStatus = "pending" | "in_progress" | "revision" | "completed" | "cancelled" | "all"

export function useProjectFilters(data: any[] | undefined) {
  const { searchValue, setSearchValue, debouncedSearch, updateParams, searchParams } = useFilterState();

  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus>(
    (searchParams.get("status") as ProjectStatus) || "all"
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
        result = result.filter((item) => {
          const titleMatch = item.title?.toLowerCase().includes(search);
          const invoiceMatch = item.invoices?.invoice_number?.toLowerCase().includes(search);
          const descriptionMatch = item.description?.toLowerCase().includes(search);

          return titleMatch || invoiceMatch || descriptionMatch;
        }  
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
        const itemDate = new Date(item.deadline || item.created_at)
        return itemDate >= start && itemDate <= end
      })
    }

    return result
  }, [data, debouncedSearch, statusFilter, debouncedDate])

  const handleSearchChange = (value: string) => {
    setIsDebouncing(true)
    setSearchValue(value)
  }

  const handleStatusChange = (value: ProjectStatus) => {
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