export interface GPAProject {
  PRJ_id?: number
  PRJ_client_id: number
  PRJ_case_number: string
  PRJ_area_m2?: number
  PRJ_additional_directions?: string
  PRJ_budget?: number
  PRJ_entry_date?: string | Date
  PRJ_completion_date?: string | Date
  PRJ_logbook_number?: string
  PRJ_logbook_close_date?: string | Date
  PRJ_category_id: number
  PRJ_type_id: number
  PRJ_state: 
    | 'Document Collection'
    | 'Technical Inspection'
    | 'Document Review'
    | 'Plans and Budget'
    | 'Entity Review'
    | 'APC and Permits'
    | 'Disbursement'
    | 'Under Construction'
    | 'Completed'
    | 'Logbook Closed'
    | 'Rejected'
    | 'Professional Withdrawal'
    | 'Conditioned'
  PRJ_final_price?: number
  PRJ_notes?: string
  PRJ_province?: string
  PRJ_canton?: string
  PRJ_district?: string
  PRJ_neighborhood?: string
}