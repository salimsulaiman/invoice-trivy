import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { User, Mail, Lock, Shield, Loader2, Save, FileText } from "lucide-react"

import { useAuthStore } from "@/store/use-auth-store"
import { updateUserProfile, getCurrentUser } from "@/features/auth/api/auth-api"
import {
  uploadSignatureFile,
  fetchSignatureImageAsDataUrl,
} from "@/features/users/api/signatures-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Secure Image Component for displaying signature previews
function SignatureImage({ userId, isPending = false, version, className }: { userId: string | number; isPending?: boolean; version?: number; className?: string }) {
  const [src, setSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setError(false)
    fetchSignatureImageAsDataUrl(userId, isPending)
      .then((dataUrl) => {
        setSrc(dataUrl)
      })
      .catch((err) => {
        console.error("Gagal memuat gambar tanda tangan:", err)
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userId, isPending, version])

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 dark:bg-shark-950 border border-dashed rounded-md p-4 ${className}`}>
         <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 dark:bg-shark-950 border border-dashed rounded-md p-4 text-xs text-muted-foreground ${className}`}>
        Gagal memuat tanda tangan
      </div>
    )
  }

  return (
    <img 
      src={src} 
      alt="Tanda Tangan" 
      className={`object-contain bg-white p-2 border rounded-md ${className}`} 
    />
  )
}

const settingsSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).refine(data => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Konfirmasi password tidak sesuai",
  path: ["confirmPassword"]
});

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const { user, token, setAuth } = useAuthStore()
    const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [signatureVersion, setSignatureVersion] = useState(0)



  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    },
  })

  // Find user's own signature metadata
  const hasOwnSignature = !!user?.has_signature
  const hasOwnPending = !!user?.has_pending_signature

  const updateMutation = useMutation({
    mutationFn: (data: Omit<SettingsFormValues, "confirmPassword">) => {
      if (!user?.id) throw new Error("User ID tidak ditemukan")
      return updateUserProfile(user.id, data)
    },
    onSuccess: (updatedUser) => {
      const nextUser = {
        ...user,
        ...updatedUser,
      }
      setAuth(nextUser, token)
      toast.success("Profil akun berhasil diperbarui!")
      form.setValue("password", "")
      form.setValue("confirmPassword", "")
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui profil")
    },
  })

  const onSubmit = (data: SettingsFormValues) => {
    const { confirmPassword, ...payload } = data
    updateMutation.mutate(payload)
  }

  // Handle file uploading
  const handleUploadSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // 1. Upload signature image
      await uploadSignatureFile(file)

      // 2. Fetch updated current user info
      const updatedUser = await getCurrentUser()
      
      // 3. Update auth state in Zustand store
      setAuth(updatedUser, token)

      // 4. Force SignatureImage component to reload by updating version
      setSignatureVersion((v) => v + 1)

      toast.success(
        user?.role === "owner"
          ? "Tanda tangan berhasil diunggah dan otomatis disetujui!"
          : "Tanda tangan berhasil diunggah, menunggu persetujuan Owner."
      )
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah tanda tangan")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto flex-1 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
        <p className="text-sm text-muted-foreground">
          Kelola informasi akun Anda, preferensi keamanan, dan tanda tangan digital.
        </p>
      </div>

     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm transition-all duration-300">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Detail Akun
              </CardTitle>
              <CardDescription>
                Perbarui nama lengkap dan alamat email akun Anda.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 space-y-5">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Nama Lengkap
                    </FieldLabel>
                    <Input
                      {...field}
                      placeholder="Masukkan nama lengkap"
                      className="transition-all duration-200"
                    />
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
                    <Input
                      {...field}
                      type="email"
                      placeholder="name@example.com"
                      className="transition-all duration-200"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Peran Sistem (Role)
                </FieldLabel>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted border rounded-md text-sm text-muted-foreground font-medium select-none capitalize">
                  {user?.role || "Admin"}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Peran Anda diatur secara global dan tidak dapat diubah secara mandiri.
                </p>
              </Field>
            </CardContent>
          </Card>

          <Card className="shadow-sm transition-all duration-300">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Ubah Password
              </CardTitle>
              <CardDescription>
                Kosongkan jika Anda tidak ingin memperbarui password saat ini.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 space-y-5">
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Password Baru
                    </FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      className="transition-all duration-200"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Konfirmasi Password
                    </FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      className="transition-all duration-200"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {isPasswordFocused && (
                <p className="text-[10px] text-muted-foreground transition-all duration-200 animate-slide-down">
                  Password baru harus memiliki panjang minimal 6 karakter.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm transition-all duration-300 col-span-1 lg:col-span-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Tanda Tangan Saya
              </CardTitle>
              <CardDescription>
                Unggah gambar tanda tangan Anda untuk disematkan pada dokumen invoice PDF.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="shrink-0">
                  {hasOwnSignature ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Tanda Tangan Saat Ini:</p>
                      <SignatureImage userId={user!.id} version={signatureVersion} className="w-48 h-32" />
                    </div>
                  ) : hasOwnPending ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Tanda Tangan (Sedang Ditinjau):</p>
                      <SignatureImage userId={user!.id} isPending={true} version={signatureVersion} className="w-48 h-32" />
                    </div>
                  ) : (
                    <div className="w-48 h-32 flex flex-col items-center justify-center border border-dashed rounded-md bg-muted p-4 text-center">
                      <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">Belum ada tanda tangan</p>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4 w-full">
                  {(hasOwnSignature || hasOwnPending) && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Status Persetujuan:</p>
                      <div className="flex items-center gap-2">
                        {hasOwnPending ? (
                          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900">
                            Menunggu Persetujuan Owner
                          </Badge>
                        ) : hasOwnSignature ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900">
                            Disetujui / Aktif
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Unggah Tanda Tangan Baru:</p>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadSignature}
                        disabled={uploading}
                        className="max-w-xs file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                      {uploading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Mengunggah...
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Format yang didukung: PNG, JPG (rekomendasi PNG dengan latar belakang transparan).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="w-full sm:w-auto font-medium shadow-sm transition-all duration-200 px-8"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan Perubahan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>


    </div>
  )
}
