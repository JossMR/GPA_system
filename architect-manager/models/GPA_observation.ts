export interface GPAObservation {
  OST_id?: number
  OST_project_id: number
  OST_content: string
  OST_date: string | Date
}
export function getLocalMySQLDateTime() {
  const localDate = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())} ${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:${pad(localDate.getSeconds())}`;
}