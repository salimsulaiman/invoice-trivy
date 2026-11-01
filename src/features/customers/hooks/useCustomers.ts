import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from "../api/customer-api"
import { toast } from "sonner"

export function useCustomers() {
  const query = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      updateCustomer(id, updates),
    onSuccess: () => {
      // Ini akan memaksa useQuery(["customers"]) untuk fetch ulang data terbaru
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success("Customer updated successfully", {
        description: "Data customer berhasil diperbarui",
        })
    },
    onError: (error: any) => {
      toast.error("Failed to update customer", {
        description: error?.message ?? "Terjadi kesalahan",
        })
    }
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success("Customer deleted", {
        description: "Data customer telah dihapus secara permanen.",
      })
    },
    onError: (error: any) => {
      toast.error("Failed to delete customer", {
        description: error?.message ?? "Terjadi kesalahan saat menghapus data.",
      })
    }
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newCustomer: any) => createCustomer(newCustomer), // buat API createCustomer
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success("Success", { description: "Customer added successfully" })
    }
  })
}