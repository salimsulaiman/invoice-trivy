"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { IBankAccount } from "../../types/bank-account"
import { useUpdateBankAccount } from "../../hooks/useBankAccounts"
import {
  bankAccountSchema,
  type BankAccountFormValues,
} from "../../schemas/bank-account-schema"

interface BankAccountEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bankAccount: IBankAccount | null
}

export function BankAccountEditDialog({
  open,
  onOpenChange,
  bankAccount,
}: BankAccountEditDialogProps) {
  const updateMutation = useUpdateBankAccount()

  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bank_name: "",
      account_number: "",
      account_holder: "",
      branch: "",
      swift_code: "",
      notes: "",
      is_active: true,
    },
  })

  React.useEffect(() => {
    if (bankAccount) {
      form.reset({
        bank_name: bankAccount.bank_name,
        account_number: bankAccount.account_number,
        account_holder: bankAccount.account_holder,
        branch: bankAccount.branch || "",
        swift_code: bankAccount.swift_code || "",
        notes: bankAccount.notes || "",
        is_active: bankAccount.is_active,
      })
    }
  }, [bankAccount, form])

  const onSubmit = (data: BankAccountFormValues) => {
    if (!bankAccount?.id) return

    updateMutation.mutate(
      { id: bankAccount.id, updates: data },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Bank Account</DialogTitle>
          <DialogDescription>
            Make changes to the bank account here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form id="edit-bank-account-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            <Controller
              name="bank_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-bank-name">Bank Name</FieldLabel>
                  <Input {...field} id="edit-bank-name" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="account_number"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-account-number">Account Number</FieldLabel>
                  <Input
                    {...field}
                    id="edit-account-number"
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="account_holder"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-account-holder">Account Holder</FieldLabel>
                  <Input {...field} id="edit-account-holder" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="branch"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-branch">Branch (optional)</FieldLabel>
                  <Input {...field} id="edit-branch" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="swift_code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-swift">SWIFT Code (optional)</FieldLabel>
                  <Input {...field} id="edit-swift" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-notes">Notes (optional)</FieldLabel>
                  <Textarea {...field} id="edit-notes" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="is_active"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5">
                    <FieldLabel>Active</FieldLabel>
                    <p className="text-xs text-muted-foreground">
                      Rekening aktif akan ditampilkan di invoice.
                    </p>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-bank-account-form"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}