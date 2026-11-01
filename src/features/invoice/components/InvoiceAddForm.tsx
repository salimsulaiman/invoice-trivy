import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, ChevronsUpDown, Check, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { useCreateInvoice } from "../hooks/useInvoice"
import type { ICustomer } from "@/features/customers/types/customer"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { getCustomers } from "@/features/customers/api/customer-api"

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int("Quantity must be an integer").min(1),
  price: z.number().min(0),
})

const invoiceFormSchema = z.object({
  customer_id: z.string().min(1),
  invoice_number: z.string().min(1),
  title: z.string().min(1),
  issue_date: z.string().min(1),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1),
})

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

export function InvoiceAddForm() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [allCustomers, setAllCustomers] = useState<ICustomer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null)
  const [loading, setLoading] = useState(false)

  const createMutation = useCreateInvoice()

  function generateInvoiceNumber() {
    const date = new Date()
    const yy = String(date.getFullYear()).slice(-2)
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")

    const random = Math.floor(Math.random() * 9000 + 1000)

    return `INV-TRIVY-${yy}${mm}${dd}-${random}`
  }

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customer_id: "",
      invoice_number: generateInvoiceNumber(),
      title: "",
      issue_date: new Date().toISOString().split("T")[0],
      items: [{ description: "", quantity: 1, price: 0 }],
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchedItems = form.watch("items")
  const subtotal = watchedItems.reduce(
    (acc, item) => acc + (item.quantity * item.price || 0),
    0
  )

 useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      try {
        const data = await getCustomers()
        setAllCustomers(data || [])
      } catch (err) {
        console.error("Gagal memuat customer untuk invoice:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const customers = search
    ? allCustomers.filter((c) =>
        `${c.name} ${c.phone ?? ""} ${c.email ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : allCustomers.slice(0, 10)

  const onSubmit = (data: InvoiceFormValues) => {
    const payload = {
      ...data,
      subtotal: subtotal,
      total: subtotal,
      status: "draft" as const,
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        form.reset({
          customer_id: "",
          invoice_number: generateInvoiceNumber(),
          title: "",
          issue_date: new Date().toISOString().split("T")[0],
          items: [{ description: "", quantity: 1, price: 0 }],
          notes: "",
        })
        setSelectedCustomer(null)
        setSearch("")
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Controller
            name="customer_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Customer</FieldLabel>

                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                        {selectedCustomer ? selectedCustomer.name : "Select a customer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-(--radix-popover-trigger-width) h-fit p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search customer..."
                        value={search}
                        onValueChange={setSearch}
                      />

                      <CommandList>
                        {loading && (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        )}

                        {!loading && customers.length === 0 && (
                          <CommandEmpty>No customer found.</CommandEmpty>
                        )}

                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.id}
                              onSelect={() => {
                                field.onChange(customer.id)
                                setSelectedCustomer(customer)
                                setOpen(false)
                                setSearch("")
                              }}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-md"
                            >
                              <div className="flex-1 min-w-0 w-full">
                                <div className="flex w-full items-center justify-between gap-2">
                                  <span className="text-sm font-medium truncate">{customer.name}</span>
                                  {field.value === customer.id && (
                                    <Check className="shrink-0 h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <div className="mt-0.5 space-y-0.5">
                                  <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                                    {customer.address || "No address"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {customer.phone || "No phone number"}
                                  </p>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Project Title</FieldLabel>
                <Input {...field} placeholder="Web Development Service" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="space-y-4">
          <Controller
            name="invoice_number"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Invoice Number</FieldLabel>
                <Input {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="issue_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Issue Date</FieldLabel>
                <Input {...field} type="date" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Dynamic Invoice Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Invoice Items</h3>
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
           <Card key={field.id} className="transition-colors">
            <CardContent className="p-4 grid grid-cols-12 gap-4 items-end">
              <div className="col-span-12 md:col-span-6">
                <Controller
                  name={`items.${index}.description`}
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs text-slate-500 dark:text-slate-400">Description</FieldLabel>
                      <Input {...field} placeholder="Item description" className="bg-transparent" />
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
                      <FieldLabel className="text-xs text-slate-500 dark:text-slate-400">Qty</FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        step="1"
                        className="bg-transparent"
                        onChange={(e) => field.onChange(Math.round(e.target.valueAsNumber))}
                      />
                    </Field>
                  )}
                />
              </div>
              <div className="col-span-6 md:col-span-3">
                <Controller
                  name={`items.${index}.price`}
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs text-slate-500 dark:text-slate-400">Price</FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        className="bg-transparent"
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </Field>
                  )}
                />
              </div>
              <div className="col-span-2 md:col-span-1 flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
        {/* Summary and Notes */}
        <div className="w-full gap-8 pt-4">
          <Controller
            name="notes"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Notes</FieldLabel>
                <Textarea {...field} placeholder="Payment instructions or terms..." className="h-24" />
              </Field>
            )}
          />
      </div>

      

        <div className="bg-card text-card-foreground p-6 rounded-lg space-y-3 border transition-colors">
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(subtotal)}
            </span>
          </div>

          <Separator className="bg-slate-200 dark:bg-slate-800" />

          <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white">
            <span>Total Amount</span>
            <span>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(subtotal)}
            </span>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-4" 
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating Invoice..." : "Create Invoice"}
          </Button>
        </div>
      </div>
    </form>
  )
}