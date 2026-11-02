"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, FilterX, Loader2, ListFilter } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { InvoiceEditDialog } from "./InvoiceEditDialog"
import { InvoiceDeleteDialog } from "./InvoiceDeleteDialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useInvoices } from "../../hooks/useInvoice"
import { useInvoiceFilters } from "../../hooks/useInvoiceFilter"
import { invoiceColumns } from "./columns"
import { InvoiceViewDialog } from "./InvoiceViewDialog"

export function InvoiceTable() {
  const { data, isLoading: isDataLoading } = useInvoices()
  
  const {
    searchValue,
    statusFilter,
    date,
    filteredData,
    isDebouncing,
    setSearchValue,
    setStatusFilter,
    setDate,
  } = useInvoiceFilters(data)

  const [selectedInvoice, setSelectedInvoice] = React.useState<any>(null)
  const [isViewOpen, setIsViewOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  const onView = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsViewOpen(true)
  }

  const onEdit = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsEditOpen(true)
  }

  const onDelete = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsDeleteOpen(true)
  }

  const columns = React.useMemo(() => invoiceColumns(onView, onEdit, onDelete), [])

  const resetFilters = () => {
    setSearchValue("")
    setStatusFilter("all")
    setDate(undefined)
  }

  // Supabase signature code removed. Signature is now dynamically and securely handled by InvoiceViewDialog.

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:max-w-60">
            <Input
              placeholder="Search invoice or customer..."
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

          <Select 
            value={statusFilter} 
            onValueChange={(value: any) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-full sm:w-37.5">
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          {(date?.from || statusFilter !== "all" || searchValue) && (
            <Button 
              variant="ghost" 
              onClick={resetFilters}
              className="h-9 px-2 lg:px-3 text-muted-foreground"
            >
              Reset <FilterX className="ml-2 h-4 w-4" />
            </Button>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                size="sm"
                className={cn(
                  "w-full sm:w-65 justify-start text-left font-normal h-9",
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
                  <span>Filter by date</span>
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

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isDataLoading}
      />

      <InvoiceViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        invoice={selectedInvoice}
      />

      <InvoiceEditDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        invoice={selectedInvoice} 
      />

      <InvoiceDeleteDialog 
        open={isDeleteOpen} 
        onOpenChange={setIsDeleteOpen} 
        invoice={selectedInvoice} 
      />
    </div>
  )
}