import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, User, Mail, Lock, Shield, Trash2, AlertTriangle } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { IUserModel } from "@/features/users/api/users-api"

// Schema for Add Worker
const addWorkerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  role: z.enum(["admin", "worker"]),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

type AddWorkerValues = z.infer<typeof addWorkerSchema>

interface AddWorkerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (data: AddWorkerValues) => void
  isPending: boolean
}

export function AddWorkerDialog({ open, onOpenChange, onSuccess, isPending }: AddWorkerDialogProps) {
  const form = useForm<AddWorkerValues>({
    resolver: zodResolver(addWorkerSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "worker",
      password: "",
    },
  })

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        email: "",
        role: "worker",
        password: "",
      })
    }
  }, [open, form])

  const onSubmit = (data: AddWorkerValues) => {
    onSuccess(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-violet-600" />
            Tambah Worker / Admin
          </DialogTitle>
          <DialogDescription>
            Buat akun pengguna baru dengan peran Admin atau Worker.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Nama Lengkap
                </FieldLabel>
                <Input {...field} placeholder="Nama Lengkap" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Alamat Email
                </FieldLabel>
                <Input {...field} type="email" placeholder="name@example.com" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Peran (Role)
                </FieldLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Password
                </FieldLabel>
                <Input {...field} type="password" placeholder="••••••••" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Pengguna
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Schema for Edit Worker (Password is optional)
const editWorkerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  role: z.enum(["admin", "worker"]),
  password: z.string().optional().or(z.literal("")),
})

type EditWorkerValues = z.infer<typeof editWorkerSchema>

interface EditWorkerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (data: EditWorkerValues) => void
  isPending: boolean
  worker: IUserModel | null
}

export function EditWorkerDialog({ open, onOpenChange, onSuccess, isPending, worker }: EditWorkerDialogProps) {
  const form = useForm<EditWorkerValues>({
    resolver: zodResolver(editWorkerSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "worker",
      password: "",
    },
  })

  useEffect(() => {
    if (open && worker) {
      form.reset({
        name: worker.name,
        email: worker.email,
        role: (worker.role === "admin" || worker.role === "worker") ? worker.role : "worker",
        password: "",
      })
    }
  }, [open, worker, form])

  const onSubmit = (data: EditWorkerValues) => {
    onSuccess(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-violet-600" />
            Edit Worker / Admin
          </DialogTitle>
          <DialogDescription>
            Perbarui data akun pengguna {worker?.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Nama Lengkap
                </FieldLabel>
                <Input {...field} placeholder="Nama Lengkap" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Alamat Email
                </FieldLabel>
                <Input {...field} type="email" placeholder="name@example.com" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Peran (Role)
                </FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Password Baru (Opsional)
                </FieldLabel>
                <Input {...field} type="password" placeholder="Kosongkan jika tidak diubah" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Delete Worker Dialog
interface DeleteWorkerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
  worker: IUserModel | null
}

export function DeleteWorkerDialog({ open, onOpenChange, onConfirm, isPending, worker }: DeleteWorkerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Hapus Pengguna
          </DialogTitle>
          <DialogDescription className="pt-2">
            Apakah Anda yakin ingin menghapus akun <strong>{worker?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Batal
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isPending} className="flex items-center gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
