import * as z from "zod"

export const bankAccountSchema = z.object({
  bank_name: z
    .string()
    .min(1, "Bank name is required")
    .max(255, "Bank name is too long"),
  account_number: z
    .string()
    .min(1, "Account number is required")
    .max(50, "Account number is too long")
    .regex(/^[0-9\s-]+$/, "Account number must contain digits only"),
  account_holder: z
    .string()
    .min(1, "Account holder is required")
    .max(255, "Account holder is too long"),
  branch: z.string().max(255).optional().or(z.literal("")),
  swift_code: z.string().max(20, "SWIFT code is too long").optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  is_active: z.boolean(),
})

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>