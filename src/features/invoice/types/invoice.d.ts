export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export interface IInvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  price: number;
  total?: number;
  created_at?: string;
}

export interface IInvoice {
  id: string;
  user_id: string;
  customer_id: string | null;
  invoice_number: string;
  title: string | null;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  total: number;
  status: InvoiceStatus;
  notes?: string | null;
  items: IInvoiceItem[];
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  invoice_items?: IInvoiceItem[];
  user?: {
    id: string | number;
    name: string;
    email: string;
    role: string;
  };
}

export interface CreateInvoiceInput extends Partial<IInvoice> {
  items: Omit<IInvoiceItem, 'id' | 'invoice_id' | 'total' | 'created_at'>[];
}