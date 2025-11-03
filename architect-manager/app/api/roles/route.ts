import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';
import { GPARole } from '@/models/GPA_role';
import { GPAPermission } from '@/models/GPA_permission';
import { GPANotificationsTypes } from '@/models/GPA_notificationType';

export async function GET(request: NextRequest) {
    try {
        const roles: GPARole[] = await executeQuery(
            `SELECT 
                r.ROL_id,
                r.ROL_name,
                r.ROL_notifications_for
            FROM gpa_roles r`
        );
        await Promise.all(roles.map(async (role, index) => {
            // Fetch permissions for each role
            const permissionsRes = await fetch(`${new URL(request.url).origin}/api/permission?rol_id=${role.ROL_id}`, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (!permissionsRes.ok) {
                return NextResponse.json(
                    { error: "Server Error: Error in permission request for roles" },
                    { status: 500 }
                );
            };
            const permissionsData = await permissionsRes.json();
            role.permissions = permissionsData.permissions as GPAPermission[];

            // Fetch notification types for each role
            const notificationsTypesRes = await fetch(`${new URL(request.url).origin}/api/notifications_types?rol_id=${role.ROL_id}`, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (!notificationsTypesRes.ok) {
                return NextResponse.json(
                    { error: "Server Error: Error in notification types request for roles" },
                    { status: 500 }
                );
            };
            const notificationsTypesData = await notificationsTypesRes.json();
            role.notifications_types = notificationsTypesData.notificationsTypes as GPANotificationsTypes[];
        }));

        return NextResponse.json({
            message: "Roles requested successfully",
            roles
        }, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Server Error: Error in the roles request" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
  try {
          const newRole:GPARole = await request.json();
          if (!newRole) {
              return NextResponse.json(
                  { error: "Role data not received for registration." },
                  { status: 400 }
              );
          }
          if(!newRole.permissions || newRole.permissions.length === 0){
              return NextResponse.json(
                  { error: "Role permissions not received for registration." },
                  { status: 400 }
              );
          }

          if(!newRole.notifications_types || newRole.notifications_types.length === 0){
              return NextResponse.json(
                  { error: "Role notification types not received for registration." },
                  { status: 400 }
              );
          }

          const results = await executeTransaction([
              {
                  query: `
                      INSERT INTO gpa_roles (
                      ROL_name,
                      ROL_notifications_for
                      ) VALUES (?, ?)
                  `,
                  params: [
                      newRole.ROL_name,
                      newRole.ROL_notifications_for || 'O'                   
                  ]
              }
          ]);
          const insertResult = results[0] as any;
          const insertId = insertResult.insertId;
          // Insert into GPA_PermissionXGPA_Roles for each role permission
            const permissionIds: number[] = (newRole.permissions || [])
            .map(p => (typeof p === 'number' ? p : (p.PSN_id ?? NaN)))
            .filter(id => !Number.isNaN(id));
          
          if (permissionIds.length > 0) {
            const rolePermissionInserts = permissionIds.map(permissionId => ({
              query: `
                INSERT INTO gpa_permissionxgpa_roles (PSN_id, ROL_id)
                VALUES (?, ?)
              `,
              params: [permissionId, insertId]
            }));
            await executeTransaction(rolePermissionInserts);
          }

          // Insert into GPA_NotificationTypesXGPA_Roles for each role notification type
          const notificationTypeIds: number[] = (newRole.notifications_types || [])
            .map(nt => (typeof nt === 'number' ? nt : (nt.NTP_id ?? NaN)))
            .filter(id => !Number.isNaN(id));

            if (notificationTypeIds.length > 0) {
            const roleNotificationTypeInserts = notificationTypeIds.map(notificationTypeId => ({
              query: `
                INSERT INTO gpa_rolesxgpa_notifications_types (NTP_id, ROL_id)
                VALUES (?, ?)
              `,
              params: [notificationTypeId, insertId]
            }));
            await executeTransaction(roleNotificationTypeInserts);
          }
          
          // Fetch and return the newly created role
          const result = await executeQuery(
              `SELECT 
                  ROL_id,
                  ROL_name,
                  ROL_notifications_for
              FROM gpa_roles
              WHERE ROL_id = ?`,
              [insertId]
          );
          const role: GPARole = result[0] as GPARole;
          return NextResponse.json({
              message: "Role registered successfully",
              role
          }, { status: 200 });
      } catch (error) {
          return NextResponse.json(
              { error: "Server Error: Error in the role register" },
              { status: 500 }
          );
      }
  }
