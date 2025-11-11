export interface GPANotification {
  NOT_id?: number
  NOT_creator_user_id: number
  NOT_name: string
  NOT_created_at?: string | Date
  NOT_date?:string | Date
  PRJ_id?: number
  NOT_description: string
  NTP_id: number

  notification_type_name?: string
  creator_name?: string
  destination_users_ids?: Array<[number, boolean]>
}
export function getLocalMySQLDateTime() {
  const localDate = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())} ${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:${pad(localDate.getSeconds())}`;
}