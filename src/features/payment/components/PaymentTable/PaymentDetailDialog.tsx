import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Calendar, Wallet, FileText, Info, Hash, Printer } from "lucide-react"
import type { IPayment } from "../../types/payment"
import { Button } from "@/components/ui/button"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { ReceiptDocument } from "../ReceiptDocument"

interface PaymentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: IPayment | null
}

export function PaymentDetailDialog({ open, onOpenChange, payment }: PaymentDetailDialogProps) {
  if (!payment) return null

  // Menggunakan amount_paid sesuai interface terbaru
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(payment.amount_paid)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-112.5">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-lg font-bold">Payment Detail</DialogTitle>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Big Amount Display */}
          <div className="bg-shark-50 dark:bg-shark-950 p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm text-muted-foreground mb-1 uppercase font-base">Total Received</p>
            <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 ">
              {formattedAmount}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 px-1">
            {/* Invoice Info */}
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Associated Invoice</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  {payment.invoices?.invoice_number || "Manual Entry"}
                </p>
                {payment.invoices?.title && (
                  <p className="text-xs text-muted-foreground italic truncate max-w-75">
                    {payment.invoices.title}
                  </p>
                )}
              </div>
            </div>

            {/* Date Info */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Transaction Date</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {format(new Date(payment.payment_date), "EEEE, dd MMMM yyyy")}
                </p>
              </div>
            </div>

            {/* Method & Reference Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Method</p>
                  <Badge variant="outline" className="mt-1 font-normal uppercase text-[10px]">
                    {payment.method}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Reference #</p>
                  <p className="font-mono text-sm font-medium mt-1">
                    {payment.reference_number || "-"}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Notes Info */}
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="w-full">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                {payment.note ? (
                   <div className="bg-shark-50 dark:bg-shark-950/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {payment.note}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No notes provided</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 pt-4 border-t gap-3 flex flex-col-reverse sm:flex-row">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          <PDFDownloadLink
            document={<ReceiptDocument payment={payment} />}
            fileName={`receipt-${payment.id}.pdf`}
            className="w-full sm:w-auto flex"
          >
            {({ loading }) => (
              <Button disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  "Generating..."
                ) : (
                  <>
                    <Printer className="mr-2 h-4 w-4" /> Print PDF
                  </>
                )}
              </Button>
            )}
          </PDFDownloadLink>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}