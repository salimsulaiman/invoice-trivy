import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Check, ChevronsUpDown, Loader2, Wallet } from "lucide-react"
import { useDebounce } from "use-debounce"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuthStore } from "@/store/use-auth-store"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useCreatePayment } from "../../hooks/usePayment"
import { getInvoices, updateInvoiceStatus } from "@/features/invoice/api/invoice-api"

const paymentSchema = z.object({
  invoice_id: z.string().min(1, "Pilih invoice terlebih dahulu"),
  amount_paid: z.number().min(1, "Jumlah harus lebih dari 0"),
  method: z.string().min(1, "Pilih metode pembayaran"),
  payment_date: z.string().min(1),
  reference_number: z.string().optional(),
  note: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

interface CreatePaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePaymentDialog({ open, onOpenChange }: CreatePaymentDialogProps) {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch] = useDebounce(search, 400)
  const [invoices, setInvoices] = React.useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = React.useState(false)
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [selectedInvoiceObj, setSelectedInvoiceObj] = React.useState<any | null>(null)

  const user = useAuthStore((state) => state.user)
  
  const createMutation = useCreatePayment()

  React.useEffect(() => {
    if (!open) {
      setSelectedInvoiceObj(null)
      setSearch("")
      setInvoices([])
    }
  }, [open])

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount_paid: 0,
      method: "Transfer Bank",
      payment_date: new Date().toISOString().split("T")[0],
      reference_number: "",
      note: "",
    },
  })

  React.useEffect(() => {
    if (!debouncedSearch) return
    const fetchInvoices = async () => {
      setLoadingInvoices(true)
      try {
        const data = await getInvoices()
        const filtered = (data || []).filter(inv => 
          inv.invoice_number.toLowerCase().includes(debouncedSearch.toLowerCase())
        ).slice(0, 5)
        setInvoices(filtered)
      } catch (err) {
        console.error("Gagal memuat invoice untuk payment:", err)
      } finally {
        setLoadingInvoices(false)
      }
    }
    fetchInvoices()
  }, [debouncedSearch])

  const onSubmit = (data: PaymentFormValues) => {
    if (!user?.id) return

    createMutation.mutate(
      { ...data, user_id: String(user.id) },
      {
        onSuccess: async () => {
          if (selectedInvoiceObj) {
            const previousPaymentsSum = selectedInvoiceObj.payments?.reduce(
              (sum: number, p: any) => sum + Number(p.amount_paid),
              0
            ) || 0
            const totalPaidNew = previousPaymentsSum + Number(data.amount_paid)
            const isPaid = totalPaidNew >= Number(selectedInvoiceObj.total)
            const newStatus = isPaid ? "paid" : "partial"

            try {
              await updateInvoiceStatus(selectedInvoiceObj.id, newStatus)
            } catch (err) {
              console.error("Gagal mengupdate status invoice:", err)
            }
          }
          form.reset()
          setSelectedInvoiceObj(null)
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            Record New Payment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <Controller
            name="invoice_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Search Invoice</FieldLabel>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between font-normal">
                      {field.value 
                        ? selectedInvoiceObj?.invoice_number || invoices.find(i => i.id === field.value)?.invoice_number || "Selected" 
                        : "Type invoice number..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder="Search INV-..." value={search} onValueChange={setSearch} />
                      <CommandList>
                        {loadingInvoices && <div className="p-4 text-center"><Loader2 className="animate-spin h-4 w-4 mx-auto"/></div>}
                        <CommandEmpty>No invoice found.</CommandEmpty>
                        <CommandGroup>
                          {invoices.map((inv) => (
                            <CommandItem
                              key={inv.id}
                              value={inv.id}
                              onSelect={() => {
                                field.onChange(inv.id)
                                setSelectedInvoiceObj(inv)

                                const totalPaid = inv.payments?.reduce(
                                  (sum: number, p: any) => sum + Number(p.amount_paid),
                                  0
                                ) || 0

                                const remaining = Number(inv.total) - totalPaid

                                form.setValue("amount_paid", remaining > 0 ? remaining : 0)

                                setPopoverOpen(false)
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{inv.invoice_number}</span>
                                <span className="text-xs text-muted-foreground">{inv.title}</span>
                              </div>
                              {field.value === inv.id && <Check className="ml-auto h-4 w-4" />}
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

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="amount_paid" // Update name
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Amount (IDR)</FieldLabel>
                  <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                </Field>
              )}
            />
            <Controller
              name="payment_date"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Payment Date</FieldLabel>
                  <Input type="date" {...field} />
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
             <Controller
              name="method"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Method</FieldLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          <Controller
            name="note"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Notes</FieldLabel>
                <Textarea {...field} placeholder="Keterangan tambahan..." />
              </Field>
            )}
          />

          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Recording..." : "Record Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}