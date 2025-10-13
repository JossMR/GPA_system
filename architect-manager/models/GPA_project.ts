import { GPAcategory } from './GPA_category'
import { GPAtype } from './GPA_type'
import { GPAObservation } from './GPA_observation'
import { GPAFileType } from './GPA_filetype'
import { GPADocument } from './GPA_document'
import { GPAPayment } from './GPA_payment'

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
  PRJ_start_construction_date?: string | Date

  categories?: GPAcategory[]
  type?: GPAtype
  observations?: GPAObservation[]
  documents?: GPADocument[]
  payments?: GPAPayment[]
  client_name?: string
  client_identification?: string
  categories_names?: string[]
}

export function getLocalMySQLDateTime() {
  const localDate = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())} ${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:${pad(localDate.getSeconds())}`;
}