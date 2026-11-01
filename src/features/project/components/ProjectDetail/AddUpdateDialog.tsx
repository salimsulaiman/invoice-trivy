"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ClipboardList, Plus } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useCreateProjectUpdate } from "../../hooks/useProject"
import type { ProjectStatus } from "../../types/project"

const updateSchema = z.object({
  status_at_time: z.enum(["pending", "in_progress", "revision", "completed", "cancelled"]),
  note: z.string().min(5, "Berikan catatan minimal 5 karakter untuk progres ini"),
})

type UpdateFormValues = z.infer<typeof updateSchema>

interface AddUpdateDialogProps {
  projectId: string
  currentStatus: ProjectStatus
}

export function AddUpdateDialog({ projectId, currentStatus }: AddUpdateDialogProps) {
  const [open, setOpen] = React.useState(false)
  const createMutation = useCreateProjectUpdate()

  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      status_at_time: currentStatus,
      note: "",
    },
  })

  // Sinkronisasi status form jika status project berubah dari luar
  React.useEffect(() => {
    if (open) {
      form.setValue("status_at_time", currentStatus)
    }
  }, [open, currentStatus, form])

  const onSubmit = (data: UpdateFormValues) => {
    createMutation.mutate(
      { 
        project_id: projectId,
        ...data 
      },
      {
        onSuccess: () => {
          form.reset({
            status_at_time: data.status_at_time, // Keep the last status
            note: "",
          })
          setOpen(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Update
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            Update Project Progress
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">

            <Controller
            name="note"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Catatan Progres</FieldLabel>
                <Textarea 
                  {...field} 
                  placeholder="Jelaskan apa yang sudah dikerjakan atau alasan perubahan status..." 
                  className="min-h-[120px] resize-none"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="status_at_time"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Status</FieldLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih status baru" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="revision">Revision</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Komponen internal pembantu agar selaras dengan library Shadcn Anda
function FormControl({ children }: { children: React.ReactNode }) {
  return <div className="mt-1">{children}</div>
}