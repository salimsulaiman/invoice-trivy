"use client"

import * as React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Row,
  type SortingState,
} from "@tanstack/react-table"
import { FilterX, GripVertical, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { IBankAccount } from "../../types/bank-account"
import {
  useBankAccounts,
  useReorderBankAccounts,
  useToggleBankAccountActive,
} from "../../hooks/useBankAccounts"
import {
  useBankAccountFilters,
  type BankStatusFilter,
} from "../../hooks/useBankAccountFilter"
import { bankAccountColumns } from "./columns"
import { BankAccountEditDialog } from "./BankAccountEditDialog"
import { BankAccountDeleteDialog } from "./BankAccountDeleteDialog"

const STATUS_OPTIONS: { label: string; value: BankStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

function SortableRow({
  row,
  disabled,
}: {
  row: Row<IBankAccount>
  disabled: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.original.id, disabled })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && "bg-muted shadow-md",
        !row.original.is_active && "opacity-60"
      )}
    >
      <TableCell className="w-10">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={cn("h-8 w-8", disabled ? "cursor-not-allowed" : "cursor-grab")}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </TableCell>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function BankAccountTable() {
  const { data, isLoading } = useBankAccounts()
  const {
    searchValue,
    status,
    filteredData,
    isFiltering,
    setSearchValue,
    setStatus,
    resetFilters,
  } = useBankAccountFilters(data)

  const toggleMutation = useToggleBankAccountActive()
  const reorderMutation = useReorderBankAccounts()

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [selected, setSelected] = React.useState<IBankAccount | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  const dragDisabled = isFiltering || sorting.length > 0 || reorderMutation.isPending

  const columns = React.useMemo(
    () =>
      bankAccountColumns(
        (bank) => {
          setSelected(bank)
          setIsEditOpen(true)
        },
        (bank) => {
          setSelected(bank)
          setIsDeleteOpen(true)
        },
        (bank) => toggleMutation.mutate(bank.id),
        toggleMutation.isPending
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toggleMutation.isPending]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const rowIds = React.useMemo(() => filteredData.map((b) => b.id), [filteredData])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || dragDisabled) return

    const oldIndex = rowIds.indexOf(String(active.id))
    const newIndex = rowIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    reorderMutation.mutate(arrayMove(rowIds, oldIndex, newIndex))
  }

  const rows = table.getRowModel().rows

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Input
          placeholder="Search bank, holder, or number..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full max-w-72"
        />

        <div className="flex items-center gap-2">
          {isFiltering && (
            <Button variant="ghost" onClick={resetFilters} className="h-9 px-2 lg:px-3">
              Reset <FilterX className="ml-2 h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-1 rounded-md border p-1">
            {STATUS_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={status === opt.value ? "default" : "ghost"}
                className="h-7 px-3 text-xs"
                onClick={() => setStatus(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {dragDisabled && !reorderMutation.isPending && (
        <p className="text-xs text-muted-foreground">
          Urutan hanya bisa diubah saat tidak ada filter pencarian/status dan tidak sedang sorting kolom.
        </p>
      )}

      <div className="rounded-md border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <TableHead className="w-10" />
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No bank accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                  {rows.map((row) => (
                    <SortableRow key={row.id} row={row} disabled={dragDisabled} />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <BankAccountEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        bankAccount={selected}
      />

      <BankAccountDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        bankAccount={selected}
      />
    </div>
  )
}