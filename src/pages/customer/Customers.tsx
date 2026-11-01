import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerAddForm } from "@/features/customers/components/CustomerAddForm"
import { CustomerTable } from "@/features/customers/components/CustomerTable/CustomerTable"
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { Loader2 } from "lucide-react";

export default function Customers() {

  const {isLoading} = useCustomers();

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
              <CardTitle>Add New Customer</CardTitle>
              <CardDescription>
                Fill in the details below to register a new customer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerAddForm />
            </CardContent>
          </Card>
        </div>

        {/* Sisi Kanan: Table Customer */}
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Customer List</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerTable />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}