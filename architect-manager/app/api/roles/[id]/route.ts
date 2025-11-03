import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPARole } from '@/models/GPA_role';
import { GPAPermission } from '@/models/GPA_permission';
import { GPANotificationsTypes } from '@/models/GPA_notificationType';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const roleId = parseInt(resolvedParams.id)

    if (isNaN(roleId)) {
      return NextResponse.json({ error: 'Invalid role ID' }, { status: 400 })
    }

    if (roleId === 1) {
      return NextResponse.json(
        { error: 'Cannot modify the Admin role' },
        { status: 400 }
      )
    }
    const body = await request.json()
    let {
      ROL_name,
      ROL_notifications_for,
      permissions,
      notifications_types
    } = body as GPARole

    const updateQuery = `

      UPDATE GPA_Roles SET
        ROL_name = ?,
        ROL_notifications_for = ?
      WHERE ROL_id = ?
    `

    await executeQuery(updateQuery, [
      ROL_name,
      ROL_notifications_for || 'O',
      roleId
    ])
    // Update permissions
    const rolePermissions = await fetch(`${new URL(request.url).origin}/api/permission?rol_id=${roleId}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const permissionsDataRaw = rolePermissions.ok ? await rolePermissions.json() : [];
    
    const permissionsData: GPAPermission[] = 
      Array.isArray(permissionsDataRaw?.permissions)
      ? permissionsDataRaw.permissions
      : [];

      // Ensure permissionsData is an array
    const existingPermissionsIds: number[] = permissionsData
      .map((psn: GPAPermission) => psn.PSN_id)
      .filter((id): id is number => id !== undefined);
    const newPermissionsIds: number[] = permissions
      ? permissions.map((psn: GPAPermission) => psn.PSN_id).filter((id): id is number => id !== undefined)
      : [];

    const permissionsToAdd = newPermissionsIds
      ? newPermissionsIds.filter(psn => !existingPermissionsIds.includes(psn))
      : [];

    const permissionsToRemove = existingPermissionsIds
      ? existingPermissionsIds.filter(psn => !newPermissionsIds.includes(psn))
      : [];

      // Add new permissions
    for (const psnId of permissionsToAdd) {
      await executeQuery(
        `INSERT INTO GPA_PermissionXGPA_Roles (ROL_id, PSN_id) VALUES (?, ?)`,
        [roleId, psnId]
      );
    }

    // Remove old permissions
    for (const psnId of permissionsToRemove) {
      await executeQuery(
        `DELETE FROM GPA_PermissionXGPA_Roles WHERE ROL_id = ? AND PSN_id = ?`,
        [roleId, psnId]
      );
    }

    // Update notification types
    const roleNotificationsTypes = await fetch(`${new URL(request.url).origin}/api/notifications_types?rol_id=${roleId}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const notificationsTypesDataRaw = roleNotificationsTypes.ok ? await roleNotificationsTypes.json() : [];
    const notificationsTypesData: GPANotificationsTypes[] = 
      Array.isArray(notificationsTypesDataRaw?.notificationsTypes)
      ? notificationsTypesDataRaw.notificationsTypes
      : [];

      // Ensure notificationsTypesData is an array
    const existingNotificationsTypesIds: number[] = notificationsTypesData
      .map((ntp: GPANotificationsTypes) => ntp.NTP_id)
      .filter((id): id is number => id !== undefined);
    const newNotificationsTypesIds: number[] = notifications_types
      ? notifications_types.map((ntp: GPANotificationsTypes) => ntp.NTP_id).filter((id): id is number => id !== undefined)
      : [];

    const notificationsTypesToAdd = newNotificationsTypesIds
      ? newNotificationsTypesIds.filter(ntp => !existingNotificationsTypesIds.includes(ntp))
      : [];

    const notificationsTypesToRemove = existingNotificationsTypesIds
      ? existingNotificationsTypesIds.filter(ntp => !newNotificationsTypesIds.includes(ntp))
      : [];

      // Add new notification types
    for (const ntpId of notificationsTypesToAdd) {
      await executeQuery(
        `INSERT INTO GPA_RolesXGPA_Notifications_types (ROL_id, NTP_id) VALUES (?, ?)`,
        [roleId, ntpId]
      );
    }

    // Remove old notification types
    for (const ntpId of notificationsTypesToRemove) {
      await executeQuery(
        `DELETE FROM GPA_RolesXGPA_Notifications_types WHERE ROL_id = ? AND NTP_id = ?`,
        [roleId, ntpId]
      );
    }
    return NextResponse.json({ message: 'Role updated successfully' }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
