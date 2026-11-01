export interface IPayment {
  id: string;
  invoice_id: string;
  user_id: string;
  
  amount_paid: number;
  payment_date: string;
  method: string;
  reference_number?: string;
  note?: string;
  
  created_at: string;

  invoices?: {
    invoice_number: string;
    title: string;
  };
}


export type CreatePaymentInput = Omit<IPayment, 'id' | 'created_at' | 'invoices'>;

export type IPaymentWithInvoice = IPayment & {
  invoices: {
    invoice_number: string;
    title: string;
  };
};