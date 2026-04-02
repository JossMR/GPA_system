import { executeQuery } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const totals = await executeQuery(
            `SELECT 
                (SELECT COUNT(CLI_id) FROM gpa_clients) as totalClients,
                (SELECT COUNT(PRJ_id) FROM gpa_projects) as totalProjects`
        );
        const totalClients = totals[0]?.totalClients || 0;
        const totalProjects = totals[0]?.totalProjects || 0;
        return NextResponse.json({
            message: "Totales globales obtenidos exitosamente",
            totalClients,
            totalProjects
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Error de servidor: Error al consultar los totales globales" },
            { status: 500 }
        );
    }
}