"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ICustomer } from "../../types/customer"
import { useUpdateCustomer } from "../../hooks/useCustomers"
import { Textarea } from "@/components/ui/textarea"

// Schema validasi dengan Zod
const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number too short."),
  address: z.string().min(5, "Address must be at least 5 characters."),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface CustomerEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: ICustomer | null
}

export function CustomerEditDialog({ open, onOpenChange, customer }: CustomerEditDialogProps) {

const updateMutation = useUpdateCustomer()
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  })

  // Sinkronisasi data saat customer dipilih
  React.useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
      })
    }
  }, [customer, form])

  const onSubmit = (data: CustomerFormValues) => {
    if (!customer?.id) return

    updateMutation.mutate(
      { id: customer.id, updates: data },
      {
        onSuccess: () => {
          onOpenChange(false) // Tutup modal hanya jika berhasil
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Make changes to the customer profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form id="edit-customer-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            {/* Field Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                  <Input {...field} id="edit-name" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Field Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                  <Input {...field} id="edit-email" type="email" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Field Phone */}
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-phone">Phone</FieldLabel>
                  <Input {...field} id="edit-phone" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-address">Address</FieldLabel>
                  <Textarea {...field} id="edit-address" placeholder="123 Main St" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
          </FieldGroup>
        </form>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending} form="edit-customer-form">
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}