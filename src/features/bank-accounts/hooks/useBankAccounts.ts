import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createBankAccount,
  deleteBankAccount,
  getBankAccounts,
  reorderBankAccounts,
  toggleBankAccountActive,
  updateBankAccount,
} from "../api/bank-account-api"
import type { IBankAccount } from "../types/bank-account"

const QUERY_KEY = ["bank-accounts"]

export function useBankAccounts() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getBankAccounts,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: any) => createBankAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success("Success", { description: "Rekening bank berhasil ditambahkan" })
    },
    onError: (error: any) => {
      toast.error("Failed to add bank account", {
        description: error?.message ?? "Terjadi kesalahan",
      })
    },
  })
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateBankAccount(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success("Bank account updated successfully", {
        description: "Data rekening bank berhasil diperbarui",
      })
    },
    onError: (error: any) => {
      toast.error("Failed to update bank account", {
        description: error?.message ?? "Terjadi kesalahan",
      })
    },
  })
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success("Bank account deleted", {
        description: "Data rekening bank telah dihapus secara permanen.",
      })
    },
    onError: (error: any) => {
      toast.error("Failed to delete bank account", {
        description: error?.message ?? "Terjadi kesalahan saat menghapus data.",
      })
    },
  })
}

export function useToggleBankAccountActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleBankAccountActive(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success(data?.is_active ? "Rekening diaktifkan" : "Rekening dinonaktifkan")
    },
    onError: (error: any) => {
      toast.error("Failed to change status", {
        description: error?.message ?? "Terjadi kesalahan",
      })
    },
  })
}

export function useReorderBankAccounts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => reorderBankAccounts(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData<IBankAccount[]>(QUERY_KEY)

      if (previous) {
        const map = new Map(previous.map((b) => [b.id, b]))
        const reordered = ids
          .map((id, index) => {
            const item = map.get(id)
            return item ? { ...item, sort_order: index } : null
          })
          .filter(Boolean) as IBankAccount[]
        queryClient.setQueryData(QUERY_KEY, reordered)
      }

      return { previous }
    },
    onError: (error: any, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEY, context.previous)
      toast.error("Failed to reorder", {
        description: error?.message ?? "Terjadi kesalahan",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}