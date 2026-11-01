"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { IInvoice } from "../../types/invoice"
import { useDeleteInvoice } from "../../hooks/useInvoice"

interface InvoiceDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: IInvoice | null
}

export function InvoiceDeleteDialog({ open, onOpenChange, invoice }: InvoiceDeleteDialogProps) {
  const deleteMutation = useDeleteInvoice()

  const handleDelete = () => {
    if (!invoice?.id) return
    deleteMutation.mutate(invoice.id, {
      onSuccess: () => onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Invoice</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold text-destructive">{invoice?.invoice_number}</span>?
            This action will also delete all associated items and payments.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}