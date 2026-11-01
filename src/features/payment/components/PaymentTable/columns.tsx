"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Eye, Trash2, Wallet, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { IPayment } from "../../types/payment"

export const paymentColumns = (
  onView: (data: IPayment) => void,
  onDelete: (data: IPayment) => void
): ColumnDef<IPayment>[] => [
  {
    accessorKey: "payment_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.payment_date
      return (
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{format(new Date(date), "dd MMM yyyy")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "invoices.invoice_number",
    id: "invoice_number",
    header: "Invoice #",
    cell: ({ row }) => (
      <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
        {row.original.invoices?.invoice_number || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) => {
      const method = row.getValue("method") as string
      return (
        <Badge variant="outline" className="font-normal border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {method}
        </Badge>
      )
    },
  },
  {
    accessorKey: "amount_paid",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount_paid") as string)
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount)
      
      return (
        <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-500">
          <Wallet className="h-3.5 w-3.5" />
          {formatted}
        </div>
      )
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm truncate max-w-37.5 inline-block">
        {row.getValue("note") || "-"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const payment = row.original

      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onView(payment)}
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(payment)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]