import { executeQuery, executeTransaction } from '@/lib/database';
import { GPAClient } from '@/models/GPA_client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const clients = await executeQuery(
            `SELECT 
                count(CLI_id) as totalClients
            FROM gpa_clients`
        );
        const totalClients = clients[0]?.totalClients || 0;
        console.log("Total Clients:", totalClients);
        return NextResponse.json({
            message: "Cantidad de clientes obtenida exitosamente",
            totalClients
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Error de servidor: Error al consultar la cantidad de clientes" },
            { status: 500 }
        );
    }
}