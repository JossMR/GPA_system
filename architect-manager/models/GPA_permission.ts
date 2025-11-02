export interface GPAPermission {
  PSN_id?: number
  PTY_id: number
  SCN_id: number
  
  screen_name?: string
  permission_type?: 
    | 'View'
    | 'Edit'
    | 'Create'
    | 'All'
}