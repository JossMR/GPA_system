export interface GPAUser {
  USR_id?: number
  USR_role_id: number
  ROL_name: string
  USR_email: string
  USR_name: string
  USR_active: number
  USR_f_lastname: string
  USR_s_lastname: string
  USR_creation_date?: string
  USR_last_access_date?: string
}
export function validateRequiredFields(user: GPAUser): boolean {
    return !!(
        user.USR_role_id && 
        user.USR_email && 
        user.USR_name && 
        user.USR_active &&
        user.USR_f_lastname && 
        user.USR_s_lastname
    );
}
export function getLocalMySQLDateTime() {
  const localDate = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())} ${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:${pad(localDate.getSeconds())}`;
}