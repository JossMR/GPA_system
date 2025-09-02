export interface GPAClient {
  CLI_id?: number
  CLI_name: string
  CLI_email?: string
  CLI_phone: string
  CLI_additional_directions?: string
  CLI_civil_status: "Single" | "Married" | "Divorced" | "Widowed"
  CLI_observations?: string
  CLI_f_lastname?: string
  CLI_s_lastname?: string
  CLI_identificationtype: "national" | "dimex" | "passport" | "nite" | "entity"
  CLI_identification: string
  CLI_isperson: boolean
  CLI_province?: string
  CLI_canton?: string
  CLI_district?: string
  CLI_neighborhood?: string
}