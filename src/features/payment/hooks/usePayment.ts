import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { CreatePaymentInput, IPayment } from "../types/payment";
import { createPayment, deletePayment, getAllPayments, getPaymentsByInvoice } from "../api/payment-api";

export function useAllPayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: getAllPayments,
  });
}

export function useInvoicePayments(invoiceId: string) {
  return useQuery({
    queryKey: ["payments", "invoice", invoiceId],
    queryFn: () => getPaymentsByInvoice(invoiceId),
    enabled: !!invoiceId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  // Generic: <TipeResponse, TipeError, TipeInput>
  return useMutation<IPayment, Error, CreatePaymentInput>({ // <-- Tambahkan IPayment di sini
    mutationFn: createPayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", data.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ["payments", "invoice", data.invoice_id] });
      
      const formattedAmount = new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR' 
      }).format(data.amount_paid);

      toast.success("Payment recorded", {
        description: `Pembayaran sebesar ${formattedAmount} berhasil dicatat.`,
      });
    },
    onError: (error: any) => {
      toast.error("Payment failed", {
        description: error?.message ?? "Gagal mencatat pembayaran",
      });
    }
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Payment deleted", {
        description: "Catatan pembayaran telah dihapus",
      });
    },
  });
}