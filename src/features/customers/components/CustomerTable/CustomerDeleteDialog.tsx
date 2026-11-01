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
import { useDeleteCustomer } from "../../hooks/useCustomers"
import type { ICustomer } from "../../types/customer"

interface CustomerDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: ICustomer | null
}

export function CustomerDeleteDialog({ open, onOpenChange, customer }: CustomerDeleteDialogProps) {
  const deleteMutation = useDeleteCustomer()

  const handleDelete = () => {
    if (!customer?.id) return

    deleteMutation.mutate(customer.id, {
      onSuccess: () => {
        onOpenChange(false) // Tutup modal jika sukses
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold text-white">{customer?.name}</span>? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
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
            {deleteMutation.isPending ? "Deleting..." : "Delete Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}