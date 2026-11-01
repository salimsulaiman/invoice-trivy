import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Edit3 } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useUpdateUpdateContent } from "../../hooks/useProject"
import type { IProjectUpdate, ProjectStatus } from "../../types/project"

const updateSchema = z.object({
  status_at_time: z.enum(["pending", "in_progress", "revision", "completed", "cancelled"]),
  note: z.string().min(5, "Berikan catatan minimal 5 karakter"),
})

type UpdateFormValues = z.infer<typeof updateSchema>

interface EditUpdateDialogProps {
  update: IProjectUpdate
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (status: ProjectStatus) => void
}

export function EditUpdateDialog({ update, open, onOpenChange, onSuccess }: EditUpdateDialogProps) {
  const updateMutation = useUpdateUpdateContent()

  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      status_at_time: update.status_at_time,
      note: update.note || "",
    },
  })

  const onSubmit = (data: UpdateFormValues) => {
    updateMutation.mutate(
      { id: update.id, input: data },
      {
        onSuccess: () => {
          onSuccess?.(data.status_at_time)
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-amber-600" />
            Edit Progress
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">

          <Controller
            name="note"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Catatan</FieldLabel>
                <Textarea {...field} className="min-h-30 resize-none" />
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
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

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}