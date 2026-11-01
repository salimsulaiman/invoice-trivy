"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import type { IInvoice } from "../../types/invoice"
import { Button } from "@/components/ui/button"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { InvoiceDocument } from "../InvoiceDocument"
import { Printer, Loader2 } from "lucide-react"
import { fetchSignatureImageAsDataUrl } from "@/features/users/api/signatures-api"
import { useInvoicePayments } from "@/features/payment/hooks/usePayment"

import { useBankAccounts } from "@/features/bank-accounts/hooks/useBankAccounts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InvoiceViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: IInvoice | null
}

export function InvoiceViewDialog({ open, onOpenChange, invoice }: InvoiceViewDialogProps) {
  const [loadedSignatureUrl, setLoadedSignatureUrl] = useState<string | null>(null)
  const [loadingSignature, setLoadingSignature] = useState(false)

  const { data: paymentsData } = useInvoicePayments(invoice?.id || "")

  const { data: bankAccounts } = useBankAccounts()
  const activeBanks = (bankAccounts ?? []).filter((b) => b.is_active)
  const [selectedBankId, setSelectedBankId] = useState<string>("")
  const selectedBank = activeBanks.find((b) => b.id === selectedBankId) ?? null

  const paymentsList = paymentsData || (invoice as any)?.payments || []
  const totalPaid = paymentsList.reduce((sum: number, p: any) => sum + Number(p.amount_paid), 0)
  const balanceDue = Math.max(0, Number(invoice?.total || 0) - totalPaid)

  useEffect(() => {
    if (!open || !invoice) {
      setLoadedSignatureUrl(null)
      return
    }

    const loadSignature = async () => {
      const targetUserId = invoice.user_id || invoice.user?.id
      console.log("loadSignature targetUserId:", targetUserId, "invoice:", invoice)
      if (!targetUserId) {
        console.warn("loadSignature cancelled: user_id is missing")
        return
      }
      setLoadingSignature(true)
      try {
        const dataUrl = await fetchSignatureImageAsDataUrl(targetUserId)
        setLoadedSignatureUrl(dataUrl)
        console.log("loadSignature success, dataUrl length:", dataUrl.length)
      } catch (err) {
        console.error("Gagal memuat tanda tangan untuk dokumen:", err)
      } finally {
        setLoadingSignature(false)
      }
    }

    loadSignature()
  }, [open, invoice])

  useEffect(() => {
    if (open && !selectedBankId && activeBanks.length > 0) {
      setSelectedBankId(activeBanks[0].id)
    }
  }, [open, activeBanks, selectedBankId])

  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-xl">{invoice.invoice_number}</DialogTitle>
            <Badge className="capitalize">{invoice.status}</Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] mt-4 pr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{invoice.customers?.name}</p>
                <p className="text-sm">{invoice.customers?.email || "-"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="font-medium">{format(new Date(invoice.issue_date), "PPP")}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-semibold mb-1">Project Title</p>
              <p className="font-medium text-sm text-muted-foreground">{invoice.title}</p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-3">Items</p>
              <div className="space-y-3">
                {invoice.invoice_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-muted-foreground">{Math.round(item.quantity)} x {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</p>
                    </div>
                    <p className="font-medium">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.total ?? 0)}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <div className="w-1/2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(invoice.total)}</span>
                </div>
                {totalPaid > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium">
                    <span>Total Paid</span>
                    <span>-{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPaid)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-1 mt-1">
                  <span>Balance Due</span>
                  <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(balanceDue)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold">Bank Account (for PDF)</p>
          <Select value={selectedBankId} onValueChange={setSelectedBankId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select bank account..." />
            </SelectTrigger>
            <SelectContent>
              {activeBanks.map((bank) => (
                <SelectItem key={bank.id} value={bank.id}>
                  {bank.bank_name} - {bank.account_number} ({bank.account_holder})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          
           {loadingSignature ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </Button>
            ) : (
              <PDFDownloadLink
                key={`${loadedSignatureUrl || "no-sig"}-${selectedBankId}`}
                document={
                  <InvoiceDocument
                    invoice={invoice}
                    signatureUrl={loadedSignatureUrl}
                    payments={paymentsList}
                    bankAccount={selectedBank}
                  />
                }
                fileName={`${invoice.invoice_number}.pdf`}
              >
                {({ loading }) => (
                  <Button disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Printer className="mr-2 h-4 w-4" />
                        Print PDF
                      </>
                    )}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}