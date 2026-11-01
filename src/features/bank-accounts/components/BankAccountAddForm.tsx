import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { useCreateBankAccount } from "../hooks/useBankAccounts"
import {
  bankAccountSchema,
  type BankAccountFormValues,
} from "../schemas/bank-account-schema"

export function BankAccountAddForm() {
  const createMutation = useCreateBankAccount()

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

  const onSubmit = (data: BankAccountFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => form.reset(),
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="space-y-4">
        <Controller
          name="bank_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Bank Name</FieldLabel>
              <Input {...field} placeholder="BCA" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="account_number"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Account Number</FieldLabel>
              <Input
                {...field}
                inputMode="numeric"
                placeholder="1234567890"
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
              <FieldLabel>Account Holder</FieldLabel>
              <Input {...field} placeholder="Trivy Infinity Solutions" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="branch"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Branch (optional)</FieldLabel>
              <Input {...field} placeholder="Tegal" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="swift_code"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>SWIFT Code (optional)</FieldLabel>
              <Input {...field} placeholder="CENAIDJA" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Notes (optional)</FieldLabel>
              <Textarea {...field} placeholder="Catatan tambahan..." aria-invalid={fieldState.invalid} />
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

        <Button type="submit" className="w-full" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Adding..." : "Add Bank Account"}
        </Button>
      </FieldGroup>
    </form>
  )
}