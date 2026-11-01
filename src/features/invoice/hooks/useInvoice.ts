import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createInvoice, deleteInvoice, getInvoiceById, getInvoices, updateInvoice } from "../api/invoice-api";
import type { CreateInvoiceInput, IInvoice } from "../types/invoice";


export function useInvoices() {
  const query = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newInvoice: CreateInvoiceInput) => createInvoice(newInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created", {
        description: "Invoice baru berhasil diterbitkan",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to create invoice", {
        description: error?.message ?? "Terjadi kesalahan",
      });
    }
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<IInvoice> }) =>
      updateInvoice(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] });
      toast.success("Invoice updated", {
        description: "Perubahan invoice berhasil disimpan",
      });
    },
    onError: (error: any) => {
      toast.error("Update failed", {
        description: error?.message ?? "Gagal memperbarui data",
      });
    }
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted", {
        description: "Invoice telah berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast.error("Delete failed", {
        description: error?.message ?? "Gagal menghapus invoice",
      });
    }
  });
}