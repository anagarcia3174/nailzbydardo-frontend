export interface Expense {
  id: string;
  expense_name: string;
  price: number;
  date_purchased: string;
  receipt_url: string | null;
  created_at: string;
}