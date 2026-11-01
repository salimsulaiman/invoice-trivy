interface IBankAccount {
  id: string
  bank_name: string
  account_number: string
  account_holder: string
  branch?: string | null
  swift_code?: string | null
  notes?: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type { IBankAccount }