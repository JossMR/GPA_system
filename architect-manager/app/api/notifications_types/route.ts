import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, executeTransaction } from '@/lib/database'
import { GPANotificationsTypes } from '@/models/GPA_notificationType'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const roleId = searchParams.get('rol_id')
        let query = 
            `SELECT 
                nt.NTP_id,
                nt.NTP_name
            FROM gpa_notifications_types nt`

        const params: any[] = []
        if (roleId) {
            const rolIdNum = parseInt(roleId)
          if (!isNaN(rolIdNum)) {
            query += ` JOIN gpa_rolesXGPA_notifications_types rn ON rn.NTP_id = nt.NTP_id
                        WHERE rn.ROL_id = ?`
            params.push(rolIdNum)
            }        
        }
        const notificationsTypes: GPANotificationsTypes[] = await executeQuery(
            query, params
        );
        return NextResponse.json({
            message: "Notifications types requested successfully",
            notificationsTypes
        }, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Server Error: Error in the notifications types request" },
            { status: 500 }
        );
    }
}