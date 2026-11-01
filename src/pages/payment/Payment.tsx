import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentTable } from "@/features/payment/components/PaymentTable/paymentTable"
import { useAllPayments } from "@/features/payment/hooks/usePayment"
import { Loader2 } from "lucide-react";

export default function Payment() {
  const {isLoading} = useAllPayments();

   if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="w-full">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Invoice List</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentTable />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}