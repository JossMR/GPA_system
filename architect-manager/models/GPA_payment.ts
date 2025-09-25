export interface GPAPayment {
  PAY_id?: number
  PAY_amount_due: number
  PAY_amount_paid: number
  PAY_due_date: string | Date
  PAY_payment_date?: string | Date
  PAY_description?: string
  PAY_project_id: number
}