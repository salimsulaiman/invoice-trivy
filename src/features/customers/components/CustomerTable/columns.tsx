"use client"

import { type ColumnDef } from "@tanstack/react-table"
import type { ICustomer } from "@/features/customers/types/customer"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

export const customerColumns = (
  onEdit: (data: ICustomer) => void,
  onDelete: (data: ICustomer) => void
): ColumnDef<ICustomer>[] => [
  {
    accessorKey: "name",
    id: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    enableColumnFilter: true,
    filterFn: "includesString",
  },
  {
    accessorKey: "email",
    id: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span>{row.original.email || "-"}</span>,
    enableColumnFilter: true,
    filterFn: "includesString",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <span>{row.original.phone || "-"}</span>,
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => <span>{row.original.address || "-"}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
        const customer = row.original

        return (
         <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(customer)}
            >
              Edit
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(customer)}
            >
              Delete
            </Button>
          </div>
        )
    },
  },
]