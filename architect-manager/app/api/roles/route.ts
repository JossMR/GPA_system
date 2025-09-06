import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';
import { GPARole } from '@/models/GPA_role';

export async function GET(request: NextRequest) {
    try {
        const roles: GPARole[] = await executeQuery(
            `SELECT 
                ROL_id,
                ROL_name
            FROM gpa_roles`
        );
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
