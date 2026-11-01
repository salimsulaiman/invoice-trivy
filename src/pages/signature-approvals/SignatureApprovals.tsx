import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Shield, Loader2, AlertTriangle } from "lucide-react"

import { useAuthStore } from "@/store/use-auth-store"
import { getUsers } from "@/features/users/api/users-api"
import {
  approveUserSignature,
  rejectUserSignature,
  fetchSignatureImageAsDataUrl,
} from "@/features/users/api/signatures-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useEffect } from "react"

// Secure Image Component for displaying signature previews
function SignatureImage({ userId, isPending = false, className }: { userId: string | number; isPending?: boolean; className?: string }) {
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
  }, [userId, isPending])

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

export default function SignatureApprovalsPage() {
  const { user } = useAuthStore()

  // Guard: Hanya role owner yang boleh mengakses halaman ini
  if (user?.role !== "owner") {
    return <Navigate to="/dashboard" replace />
  }

  // Rejection Dialog State
  const [rejectingId, setRejectingId] = useState<string | number | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  // Fetch users list (for Owner approval panel)
  const { data: users, isLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  })

  // Find pending signatures for Owner approval (excluding owner's own)
  const pendingUsers = users?.filter(
    (u) => u.has_pending_signature && String(u.id) !== String(user?.id)
  )

  // Approve Signature Mutation
  const approveMutation = useMutation({
    mutationFn: (targetUserId: string | number) => approveUserSignature(targetUserId),
    onSuccess: () => {
      refetchUsers()
      toast.success("Tanda tangan worker disetujui!")
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menyetujui tanda tangan")
    },
  })

  // Reject Signature Mutation
  const rejectMutation = useMutation({
    mutationFn: ({ targetUserId, reason }: { targetUserId: string | number; reason: string }) =>
      rejectUserSignature(targetUserId, reason),
    onSuccess: () => {
      refetchUsers()
      toast.success("Tanda tangan worker ditolak.")
      setRejectingId(null)
      setRejectionReason("")
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menolak tanda tangan")
    },
  })

  return (
    <div className="container mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Persetujuan Tanda Tangan</h2>
        <p className="text-sm text-muted-foreground">
          Tinjau dan setujui tanda tangan yang diajukan oleh Admin atau Worker.
        </p>
      </div>

      <Card className="shadow-sm transition-all duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Pengajuan Pending
          </CardTitle>
          <CardDescription>
            Menampilkan semua tanda tangan user yang memerlukan persetujuan Anda sebelum dapat disematkan ke Invoice.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span>Memuat data pengajuan...</span>
            </div>
          ) : !pendingUsers || pendingUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground border border-dashed rounded-md p-4 text-center">
              <Shield className="h-10 w-10 text-muted-foreground mb-3 opacity-60" />
              <p className="font-medium">Tidak ada pengajuan pending</p>
              <p className="text-xs">Semua tanda tangan user telah disetujui atau belum ada pengajuan baru.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingUsers.map((u) => (
                <div key={u.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-muted/50 justify-between items-start sm:items-center">
                  <div className="space-y-2 flex-1">
                    <div>
                      <h4 className="font-semibold text-sm">{u.name || "User"}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{u.email || "-"}</p>
                    </div>
                    <SignatureImage userId={u.id} isPending={true} className="w-44 h-24" />
                  </div>
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto justify-end sm:justify-start">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(u.id)}
                      disabled={approveMutation.isPending}
                      className="w-full sm:w-24 text-xs h-8"
                    >
                      {approveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Setujui"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRejectingId(u.id)}
                      className="w-full sm:w-24 text-xs h-8"
                    >
                      Tolak
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectingId !== null} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Tolak Pengajuan Tanda Tangan
            </DialogTitle>
            <DialogDescription className="pt-2">
              Berikan alasan penolakan untuk diinformasikan kepada pengunggah tanda tangan.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <Field>
              <FieldLabel>Alasan Penolakan</FieldLabel>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Misalnya: File gambar buram atau tidak transparan..."
                className="h-24 resize-none"
              />
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (rejectingId && rejectionReason.trim()) {
                  rejectMutation.mutate({ targetUserId: rejectingId, reason: rejectionReason })
                } else {
                  toast.error("Alasan penolakan wajib diisi")
                }
              }}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Penolakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
