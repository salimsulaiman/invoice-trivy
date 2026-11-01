"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Check, ChevronsUpDown, Loader2, Briefcase } from "lucide-react"
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

import { getInvoices } from "@/features/invoice/api/invoice-api"
import { useCreateProject } from "../../hooks/useProject"
import { useAuthStore } from "@/store/use-auth-store"

const projectSchema = z.object({
  title: z.string().min(1, "Judul project wajib diisi"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "revision", "completed", "cancelled"]),
  invoice_id: z.string().min(1, "Project harus terhubung dengan invoice"),
  start_date: z.string().optional(),
  deadline: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch] = useDebounce(search, 400)
  const [invoices, setInvoices] = React.useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = React.useState(false)
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const user = useAuthStore((state) => state.user)
  const createMutation = useCreateProject()

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      invoice_id: "",
      start_date: new Date().toISOString().split("T")[0],
      deadline: "",
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
        console.error("Gagal memuat invoice untuk project:", err)
      } finally {
        setLoadingInvoices(false)
      }
    }
    fetchInvoices()
  }, [debouncedSearch])

  const onSubmit = (data: ProjectFormValues) => {
    if (!user?.id) return

    createMutation.mutate(
      { 
        ...data,
        description: data.description ?? null,
        start_date: data.start_date ?? null,
        deadline: data.deadline ?? null,
      },
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Create New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Project Title</FieldLabel>
                <Input {...field} placeholder="e.g. Redesign Landing Page" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="invoice_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Connect to Invoice</FieldLabel>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between font-normal">
                      {field.value 
                        ? invoices.find(i => i.id === field.value)?.invoice_number || "Selected" 
                        : "Search invoice number..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder="Type INV-..." value={search} onValueChange={setSearch} />
                      <CommandList>
                        {loadingInvoices && (
                          <div className="p-4 text-center">
                            <Loader2 className="animate-spin h-4 w-4 mx-auto"/>
                          </div>
                        )}
                        <CommandEmpty>No invoice found.</CommandEmpty>
                        <CommandGroup>
                          {invoices.map((inv) => (
                            <CommandItem
                              key={inv.id}
                              value={inv.id}
                              onSelect={() => {
                                field.onChange(inv.id)
                                // Otomatis isi title project jika masih kosong
                                if (!form.getValues("title")) {
                                  form.setValue("title", inv.title || "")
                                }
                                setPopoverOpen(false)
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{inv.invoice_number}</span>
                                <span className="text-xs text-muted-foreground">{inv.client_name || inv.title}</span>
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
              name="start_date"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Start Date</FieldLabel>
                  <Input type="date" {...field} />
                </Field>
              )}
            />
            <Controller
              name="deadline"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Deadline</FieldLabel>
                  <Input type="date" {...field} />
                </Field>
              )}
            />
          </div>

          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Initial Status</FieldLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="revision">Revision</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Description (Optional)</FieldLabel>
                <Textarea {...field} placeholder="Brief details about the project scope..." />
              </Field>
            )}
          />

          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}