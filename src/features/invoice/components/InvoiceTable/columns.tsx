"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Eye, Trash2, Edit } from "lucide-react"
import { format } from "date-fns"
import type { IInvoice } from "../../types/invoice"
import { toast } from "sonner"

export const invoiceColumns = (
  onView: (data: IInvoice) => void,
  onEdit: (data: IInvoice) => void,
  onDelete: (data: IInvoice) => void
): ColumnDef<IInvoice>[] => [
  {
    accessorKey: "invoice_number",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Invoice #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const invoiceNumber = row.original.invoice_number
      const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(invoiceNumber)
        toast.success("Copied", {
          description: `Invoice number ${invoiceNumber} copied to clipboard`,
        })
      }
      return (
        <span 
          onClick={handleCopy} 
          className="cursor-pointer hover:underline font-medium text-blue-600 dark:text-blue-400"
        >
          {invoiceNumber}
        </span>
      )
    }
  },
  {
    accessorKey: "customers.name",
    id: "customer",
    header: "Customer",
    cell: ({ row }) => row.original.customers?.name || "No Customer",
  },
  {
    accessorKey: "issue_date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.issue_date), "dd MMM yyyy"),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        paid: "default",
        draft: "secondary",
        overdue: "destructive",
        cancelled: "outline",
        sent: "outline",
        partial: "secondary",
      }

      return (
        <Badge variant={variants[status] || "default"} className="capitalize">
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const invoice = row.original

      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(invoice)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(invoice)}
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(invoice)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]