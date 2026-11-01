import { useState, useMemo } from "react"
import { Navigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, ListFilter, Search, Edit2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useAuthStore } from "@/store/use-auth-store"
import { getUsers, createUser, updateUser, deleteUser, type IUserModel } from "@/features/users/api/users-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { AddWorkerDialog, EditWorkerDialog, DeleteWorkerDialog } from "./WorkerDialogs"

export default function WorkersPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  // Guard: Hanya role owner yang boleh mengakses halaman ini
  if (user?.role !== "owner") {
    return <Navigate to="/dashboard" replace />
  }

  // State
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "worker">("all")
  
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<IUserModel | null>(null)

  // React Query Fetch
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  })

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User baru berhasil ditambahkan!")
      setIsAddOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menambahkan user baru")
    },
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: any }) => updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Data user berhasil diperbarui!")
      setIsEditOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal memperbarui user")
    },
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User berhasil dihapus!")
      setIsDeleteOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menghapus user")
    },
  })

  // Filter & Search Logic
  const filteredUsers = useMemo(() => {
    if (!users) return []
    return users.filter((u) => {
      // 1. Tampilkan hanya yang memiliki role admin atau worker
      const isTargetRole = u.role === "admin" || u.role === "worker"
      if (!isTargetRole) return false

      // 2. Filter Peran (Role Filter)
      if (roleFilter !== "all" && u.role !== roleFilter) return false

      // 3. Filter Search (Nama & Email)
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchName = u.name.toLowerCase().includes(query)
        const matchEmail = u.email.toLowerCase().includes(query)
        return matchName || matchEmail
      }

      return true
    })
  }, [users, roleFilter, search])

  // Table Column Definitions
  const columns: ColumnDef<IUserModel>[] = [
    {
      accessorKey: "name",
      header: "Nama Lengkap",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border text-amber-600 dark:text-amber-400 font-semibold text-sm">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Alamat Email",
      cell: ({ row }) => <span>{row.original.email}</span>,
    },
    {
      accessorKey: "role",
      header: "Peran (Role)",
      cell: ({ row }) => {
        const role = row.original.role
        const isMinAdmin = role === "admin"
        return (
          <Badge
            variant="outline"
            className={
              isMinAdmin
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900"
            }
          >
            {role}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedWorker(row.original)
              setIsEditOpen(true)
            }}
            className="h-8 w-8 text-muted-foreground hover:text-amber-600"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedWorker(row.original)
              setIsDeleteOpen(true)
            }}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="container mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Worker</h2>
          <p className="text-sm text-muted-foreground">
            Kelola data dan peran pengguna (Admin dan Worker) sistem Anda.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Worker
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground hidden sm:inline">Filter:</span>
          <Select value={roleFilter} onValueChange={(val: any) => setRoleFilter(val)}>
            <SelectTrigger className="w-full sm:w-[160px] focus-visible:ring-amber-600">
              <SelectValue placeholder="Semua Peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Peran</SelectItem>
              <SelectItem value="worker">Worker Only</SelectItem>
              <SelectItem value="admin">Admin Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable columns={columns} data={filteredUsers} isLoading={isLoading} />

      {/* Dialogs */}
      <AddWorkerDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />

      <EditWorkerDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        worker={selectedWorker}
        onSuccess={(data) => {
          if (selectedWorker) {
            updateMutation.mutate({ id: selectedWorker.id, payload: data })
          }
        }}
        isPending={updateMutation.isPending}
      />

      <DeleteWorkerDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        worker={selectedWorker}
        onConfirm={() => {
          if (selectedWorker) {
            deleteMutation.mutate(selectedWorker.id)
          }
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
