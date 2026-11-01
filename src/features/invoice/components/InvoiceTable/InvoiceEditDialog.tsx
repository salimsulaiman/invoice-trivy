import * as React from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useUpdateInvoice } from "../../hooks/useInvoice"
import type { IInvoice } from "../../types/invoice"

const itemSchema = z.object({
  description: z.string().min(1, "Required"),
  quantity: z.number().int("Quantity must be an integer").min(1),
  price: z.number().min(0),
})

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  title: z.string().min(1, "Title is required"),
  status: z.enum(['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled']),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

interface InvoiceEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: IInvoice | null
}

export function InvoiceEditDialog({ open, onOpenChange, invoice }: InvoiceEditDialogProps) {
  const updateMutation = useUpdateInvoice()
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_number: "",
      title: "",
      status: "draft",
      notes: "",
      items: [{ description: "", quantity: 1, price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  React.useEffect(() => {
    if (invoice) {
      form.reset({
        invoice_number: invoice.invoice_number,
        title: invoice.title || "",
        status: invoice.status,
        notes: invoice.notes || "",
        // MAPPING: Ambil dari invoice_items (DB) ke items (Form)
        items: (invoice as any).invoice_items && (invoice as any).invoice_items.length > 0 
          ? (invoice as any).invoice_items.map((item: any) => ({
              description: item.description,
              quantity: Math.round(Number(item.quantity)),
              price: Number(item.price)
            }))
          : [{ description: "", quantity: 1, price: 0 }],
      })
    }
  }, [invoice, form])

  const watchedItems = form.watch("items")
  const total = watchedItems?.reduce(
    (acc, item) => acc + (Number(item.quantity) * Number(item.price) || 0),
    0
  )

  const onSubmit = (data: InvoiceFormValues) => {
    if (!invoice?.id) return
    
    // Hitung total kembali sebelum dikirim
    const totalAmount = data.items.reduce(
      (acc, item) => acc + (item.quantity * item.price), 
      0
    )

    const payload = {
      ...data,
      subtotal: totalAmount,
      total: totalAmount,
    }

    updateMutation.mutate(
      { id: invoice.id, updates: payload },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Modify invoice details and line items for {invoice?.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <form 
          id="edit-invoice-form" 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="invoice_number"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Invoice Number</FieldLabel>
                  <Input {...field} />
                </Field>
              )}
            />

            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          <Controller
            name="title"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Title / Project</FieldLabel>
                <Input {...field} />
              </Field>
            )}
          />

          <Separator />

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Line Items</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => append({ description: "", quantity: 1, price: 0 })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <Card key={field.id} className="border-slate-200 dark:border-slate-800 shadow-none">
                  <CardContent className="p-3 grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-12 md:col-span-6">
                      <Controller
                        name={`items.${index}.description`}
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel className="text-[10px] uppercase">Description</FieldLabel>
                            <Input {...field} className="h-8 text-sm" />
                          </Field>
                        )}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <Controller
                        name={`items.${index}.quantity`}
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel className="text-[10px] uppercase">Qty</FieldLabel>
                            <Input
                              {...field}
                              type="number"
                              step="1"
                              className="h-8 text-sm"
                              onChange={(e) => field.onChange(Math.round(e.target.valueAsNumber))}
                            />
                          </Field>
                        )}
                      />
                    </div>
                    <div className="col-span-5 md:col-span-3">
                      <Controller
                        name={`items.${index}.price`}
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel className="text-[10px] uppercase">Price</FieldLabel>
                            <Input
                              {...field}
                              type="number"
                              className="h-8 text-sm"
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </Field>
                        )}
                      />
                    </div>
                    <div className="col-span-3 md:col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Controller
            name="notes"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Notes</FieldLabel>
                <Textarea {...field} className="resize-none h-20" />
              </Field>
            )}
          />

          {/* Total Preview */}
          <div className="bg-shark-50 dark:bg-shark-800 p-4 rounded-lg flex justify-between items-center border">
            <span className="text-sm font-medium">New Total Amount:</span>
            <span className="text-lg font-bold text-shark-800 dark:text-white">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total)}
            </span>
          </div>
        </form>

        <DialogFooter className="p-6 pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="edit-invoice-form" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}