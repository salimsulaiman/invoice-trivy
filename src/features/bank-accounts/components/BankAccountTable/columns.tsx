"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import type { IBankAccount } from "../../types/bank-account"

export const bankAccountColumns = (
  onEdit: (data: IBankAccount) => void,
  onDelete: (data: IBankAccount) => void,
  onToggle: (data: IBankAccount) => void,
  isToggling: boolean
): ColumnDef<IBankAccount>[] => [
  {
    accessorKey: "bank_name",
    id: "bank_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Bank
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.bank_name}</span>
        {row.original.branch && (
          <span className="text-xs text-muted-foreground">{row.original.branch}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "account_number",
    header: "Account Number",
    cell: ({ row }) => <span className="font-mono">{row.original.account_number}</span>,
  },
  {
    accessorKey: "account_holder",
    header: "Account Holder",
  },
  {
    accessorKey: "swift_code",
    header: "SWIFT",
    cell: ({ row }) => <span>{row.original.swift_code || "-"}</span>,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Switch
          checked={row.original.is_active}
          disabled={isToggling}
          onCheckedChange={() => onToggle(row.original)}
        />
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const bankAccount = row.original

      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(bankAccount)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(bankAccount)}>
            Delete
          </Button>
        </div>
      )
    },
  },
]