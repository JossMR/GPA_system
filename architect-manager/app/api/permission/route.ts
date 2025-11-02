import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, executeTransaction } from '@/lib/database'
import { GPAPermission } from '@/models/GPA_permission'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const roleId = searchParams.get('rol_id')
        let query = 
            `SELECT 
                p.PSN_id,
                p.PTY_id,
                p.SCN_id,
                s.SCN_name as screen_name,
                pt.PTY_name as permission_type
            FROM gpa_permission p LEFT JOIN gpa_screen s on p.SCN_id=s.SCN_id
            LEFT JOIN gpa_permission_type pt on p.PTY_id=pt.PTY_id`

        const params: any[] = []
        if (roleId) {
            const userIdNum = parseInt(roleId)
          if (!isNaN(userIdNum)) {
            query += ` JOIN gpa_permissionXGPA_roles pr ON pr.PSN_id = p.PSN_id 
                        WHERE pr.ROL_id = ?`
            params.push(parseInt(roleId))
            }        
        }
        const permissions: GPAPermission[] = await executeQuery(
            query, params
        );
        return NextResponse.json({
            message: "Permissions requested successfully",
            permissions
        }, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Server Error: Error in the permissions request" },
            { status: 500 }
        );
    }
}