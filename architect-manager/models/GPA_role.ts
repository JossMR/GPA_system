import { GPANotificationsTypes } from "./GPA_notificationType"
import { GPAPermission } from "./GPA_permission"

export interface GPARole {
  ROL_id?: number
  ROL_name: string
  ROL_notifications_for:
    | 'E'//Everyone
    | 'O'//Only me

  permissions?: GPAPermission[]
  notifications_types?: GPANotificationsTypes[]
}