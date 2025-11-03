import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const roleId = parseInt(resolvedParams.id)
    
    if (isNaN(roleId)) {
      return NextResponse.json({ error: 'Invalid role ID' }, { status: 400 })
    }
    
    // Prevent deletion of Admin role
    if (roleId === 1) {
      return NextResponse.json({ error: 'Cannot delete the Admin role' }, { status: 400 })
    }

    // Check if role is associated with any users
    const checkQuery = `SELECT r.ROL_id FROM GPA_Roles r
                        JOIN GPA_Users u on u.USR_role_id = r.ROL_id 
                        WHERE r.ROL_id = ?`
    const existing = await executeQuery(checkQuery, [roleId]) as any[]
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'This role is associated with users' }, { status: 404 })
    }
    
    // Delete associated permissions
    const deleteRolePermissionsQuery = 'DELETE FROM GPA_PermissionXGPA_Roles WHERE ROL_id = ?'
    await executeQuery(deleteRolePermissionsQuery, [roleId])

    // Delete associated notification types
    const deleteRoleNotificationsTypesQuery = 'DELETE FROM GPA_RolesXGPA_Notifications_types WHERE ROL_id = ?'
    await executeQuery(deleteRoleNotificationsTypesQuery, [roleId])

    // Delete the role
    const deleteQuery = 'DELETE FROM GPA_Roles WHERE ROL_id = ?'
    await executeQuery(deleteQuery, [roleId])

    return NextResponse.json({ 
      message: 'Role deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}