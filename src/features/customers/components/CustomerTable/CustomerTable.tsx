"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, FilterX, Loader2 } from "lucide-react" // Tambah Loader2
import { DataTable } from "@/components/data-table"
import { useCustomers } from "../../hooks/useCustomers"
import { customerColumns } from "./columns"
import { CustomerEditDialog } from "./CustomerEditDialog"
import { CustomerDeleteDialog } from "./CustomerDeleteDialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { useCustomerFilters } from "../../hooks/useCustomerFilter"

export function CustomerTable() {
  const { data, isLoading: isDataLoading } = useCustomers()
  
  const {
    searchValue,
    date,
    filteredData,
    isDebouncing,
    setSearchValue,
    setDate,
  } = useCustomerFilters(data)

  const [selectedCustomer, setSelectedCustomer] = React.useState(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  const onEdit = (customer: any) => {
    setSelectedCustomer(customer)
    setIsEditOpen(true)
  }

  const onDelete = (customer: any) => {
    setSelectedCustomer(customer)
    setIsDeleteOpen(true)
  }

  const columns = React.useMemo(() => customerColumns(onEdit, onDelete), [])

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-60">
          <Input
            placeholder="Search customer name..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pr-10"
          />
          {isDebouncing && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {date?.from && (
            <Button 
              variant="ghost" 
              onClick={() => setDate(undefined)}
              className="h-9 px-2 lg:px-3"
            >
              Reset <FilterX className="ml-2 h-4 w-4" />
            </Button>
          )}
          <div className={cn("grid gap-2")}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  size="sm"
                  className={cn(
                    "w-[260px] justify-start text-left font-normal h-9",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Filter by date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isDataLoading}
      />

      <CustomerEditDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        customer={selectedCustomer} 
      />

      <CustomerDeleteDialog 
        open={isDeleteOpen} 
        onOpenChange={setIsDeleteOpen} 
        customer={selectedCustomer} 
      />
    </div>
  )
}