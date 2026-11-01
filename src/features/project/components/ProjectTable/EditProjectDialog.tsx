import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Edit, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

import { useUpdateProject } from "../../hooks/useProject"
import type { IProject } from "../../types/project"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const editProjectSchema = z.object({
  status: z.enum(["pending", "in_progress", "revision", "completed", "cancelled"]),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  deadline: z.string().min(1, "Deadline harus diisi"),
})

type EditProjectFormValues = z.infer<typeof editProjectSchema>

interface EditProjectDialogProps {
  project: IProject
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const updateMutation = useUpdateProject()

  const form = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      status: project.status,
      description: project.description || "",
      deadline: project.deadline ? format(new Date(project.deadline), "yyyy-MM-dd") : "",
    },
  })

  const onSubmit = (data: EditProjectFormValues) => {
    updateMutation.mutate(
      {
        id: project.id,
        input: {
          ...data,
          deadline: new Date(data.deadline).toISOString(),
        },
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Edit Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Status Proyek</FieldLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
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

         <Controller
            name="deadline"
            control={form.control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Deadline</FieldLabel>
                
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                        "w-full justify-between text-left font-normal",
                        !field.value && "text-muted-foreground"
                        )}
                    >
                        {field.value ? (
                        format(new Date(field.value), "PPP")
                        ) : (
                        <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                        if (date) {
                        date.setHours(12, 0, 0, 0);
                        field.onChange(date.toISOString());
                        } else {
                        field.onChange(undefined);
                        }
                    }}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                    />
                    </PopoverContent>
                </Popover>

                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
            />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Deskripsi Proyek</FieldLabel>
                <Textarea
                  {...field}
                  placeholder="Detail proyek..."
                  className="min-h-25 resize-none"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Update Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}