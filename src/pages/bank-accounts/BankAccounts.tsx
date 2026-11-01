import { Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BankAccountAddForm } from "@/features/bank-accounts/components/BankAccountAddForm"
import { BankAccountTable } from "@/features/bank-accounts/components/BankAccountTable/BankAccountTable"
import { useBankAccounts } from "@/features/bank-accounts/hooks/useBankAccounts"

export default function BankAccounts() {
  const { isLoading } = useBankAccounts()

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="w-full lg:w-1/3 lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Bank Account</CardTitle>
              <CardDescription>
                Fill in the details below to register a new bank account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BankAccountAddForm />
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Bank Account List</CardTitle>
              <CardDescription>
                Drag the handle to change the order. Only active accounts are shown on invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BankAccountTable />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}