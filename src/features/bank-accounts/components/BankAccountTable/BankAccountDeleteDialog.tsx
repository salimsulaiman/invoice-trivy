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
import { useDeleteBankAccount } from "../../hooks/useBankAccounts"
import type { IBankAccount } from "../../types/bank-account"

interface BankAccountDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bankAccount: IBankAccount | null
}

export function BankAccountDeleteDialog({
  open,
  onOpenChange,
  bankAccount,
}: BankAccountDeleteDialogProps) {
  const deleteMutation = useDeleteBankAccount()

  const handleDelete = () => {
    if (!bankAccount?.id) return

    deleteMutation.mutate(bankAccount.id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Bank Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {bankAccount?.bank_name} - {bankAccount?.account_number}
            </span>
            ? This action cannot be undone.
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
            {deleteMutation.isPending ? "Deleting..." : "Delete Bank Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}