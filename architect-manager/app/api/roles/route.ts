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
