"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  Calendar as CalendarIcon,
  FilterX,
  ListFilter,
  Plus,
  Download,
  Wallet,
} from "lucide-react"
import { DataTable } from "@/components/data-table"
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
  SelectValue,
} from "@/components/ui/select"

import { paymentColumns } from "./columns"
import { useAllPayments, useDeletePayment } from "../../hooks/usePayment"
import { PaymentDetailDialog } from "./PaymentDetailDialog"
import { CreatePaymentDialog } from "./PaymentCreateDialog"
import { usePaymentFilters } from "../../hooks/usePaymentFilter"

export function PaymentTable() {
  const { data, isLoading: isDataLoading } = useAllPayments()

  const {
    searchValue,
    methodFilter,
    date,
    filteredData,
    isDebouncing,
    setSearchValue,
    setMethodFilter,
    setDate,
    resetFilters,
  } = usePaymentFilters(data)

  const [selectedPayment, setSelectedPayment] = React.useState<any>(null)
  const [isViewOpen, setIsViewOpen] = React.useState(false)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  const onView = (payment: any) => {
    setSelectedPayment(payment)
    setIsViewOpen(true)
  }

  const { mutate: deletePayment } = useDeletePayment()

  const columns = React.useMemo(
    () => paymentColumns(onView, (payment) => deletePayment(payment.id)),
    [onView, deletePayment]
  )

  const hasActiveFilters = date?.from || methodFilter !== "all" || searchValue

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">Kelola dan pantau riwayat uang masuk dari client.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Payment
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:max-w-60">
            <Input
              placeholder="Search by Invoice #..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <Select value={methodFilter} onValueChange={(value) => setMethodFilter(value as any)}>
            <SelectTrigger className="w-full sm:w-40">
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
                <SelectValue placeholder="Method" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="E-Wallet">E-Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="h-9 px-2 lg:px-3 text-destructive hover:text-destructive"
            >
              Reset <FilterX className="ml-2 h-4 w-4" />
            </Button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
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
                initialFocus
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
        isLoading={isDataLoading || isDebouncing}
      />

      <PaymentDetailDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        payment={selectedPayment}
      />

      <CreatePaymentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}