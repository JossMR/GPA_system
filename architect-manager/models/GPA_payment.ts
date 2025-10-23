export interface GPAPayment {
  PAY_id?: number
  PAY_amount_paid: number
  PAY_payment_date: string | Date
  PAY_description?: string
  PAY_project_id: number
  PAY_method?: "Cash" | "Card" | "SINPE" | "Credit" | "Debit" | "Transfer" | "Deposit" | "Check"
  PAY_bill_number?: string
  projectState?: string
  projectCaseNumber?: string
  projectClientName?: string
}