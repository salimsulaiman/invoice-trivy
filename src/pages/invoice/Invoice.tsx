import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceAddForm } from "@/features/invoice/components/InvoiceAddForm"
import { InvoiceTable } from "@/features/invoice/components/InvoiceTable/InvoiceTable"
import { useInvoices } from "@/features/invoice/hooks/useInvoice";
import { Loader2 } from "lucide-react";

export default function Invoice() {

  const {isLoading} = useInvoices();

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
        
        <div className="w-full lg:w-1/3 lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Invoice</CardTitle>
              <CardDescription>
                Fill in the details below to create a new invoice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceAddForm />
            </CardContent>
          </Card>
        </div>

        {/* Sisi Kanan: Table Customer */}
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Invoice List</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceTable />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}