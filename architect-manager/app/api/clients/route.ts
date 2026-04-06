import { executeQuery, executeTransaction } from '@/lib/database';
import { GPAClient } from '@/models/GPA_client';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
    try {
        const newClient:GPAClient = await request.json();
        if (!newClient) {
            return NextResponse.json(
                { error: "No se brindó la suficiente información para registrar el cliente." },
                { status: 400 }
            );
        }
        const clientsWithSameEmail = await executeQuery(
            'SELECT * FROM gpa_clients cl WHERE cl.cli_email = ?',
            [newClient.CLI_email]
        );
        if (!Array.isArray(clientsWithSameEmail) || clientsWithSameEmail.length !== 0) {
            return NextResponse.json(
                { error: "Un cliente con este correo electrónico ya está registrado." },
                { status: 401 }
            );
        }
        const clientsWithSameIdentification = await executeQuery(
            'SELECT * FROM gpa_clients WHERE CLI_identification = ?',
            [newClient.CLI_identification]
        );
        if (!Array.isArray(clientsWithSameIdentification) || clientsWithSameIdentification.length !== 0) {
            return NextResponse.json(
                { error: "Un cliente con esta identificación ya está registrado." },
                { status: 401 }
            );
        }
        const results = await executeTransaction([
            {
                query: `
                    INSERT INTO gpa_clients (
                    CLI_name,
                    CLI_email,
                    CLI_phone,
                    CLI_additional_directions,
                    CLI_civil_status,
                    CLI_observations,
                    CLI_f_lastname,
                    CLI_s_lastname,
                    CLI_identificationtype,
                    CLI_identification,
                    CLI_isperson,
                    CLI_province,
                    CLI_canton,
                    CLI_district,
                    CLI_neighborhood
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                params: [
                    newClient.CLI_name,
                    newClient.CLI_email,
                    newClient.CLI_phone,
                    newClient.CLI_additional_directions,
                    newClient.CLI_civil_status,
                    newClient.CLI_observations,
                    newClient.CLI_f_lastname,
                    newClient.CLI_s_lastname,
                    newClient.CLI_identificationtype,
                    newClient.CLI_identification,
                    newClient.CLI_isperson,
                    newClient.CLI_province,
                    newClient.CLI_canton,
                    newClient.CLI_district,
                    newClient.CLI_neighborhood
                ]
            }
        ]);
        const insertResult = results[0] as any;
        const insertId = insertResult.insertId;
        const result = await executeQuery(
            `SELECT 
                CLI_id,
                CLI_name,
                CLI_email,
                CLI_phone,
                CLI_additional_directions,
                CLI_civil_status,
                CLI_observations,
                CLI_f_lastname,
                CLI_s_lastname,
                CLI_identificationtype,
                CLI_identification,
                CLI_isperson,
                CLI_province,
                CLI_canton,
                CLI_district,
                CLI_neighborhood
            FROM gpa_clients
            WHERE CLI_id = ?`,
            [insertId]
        );
        const client: GPAClient = result[0] as GPAClient;
        return NextResponse.json({
            message: "Cliente registrado exitosamente",
            client
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Error de Servidor: No se pudo registrar el Cliente" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const pageParam = Number.parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
        const limitParam = Number.parseInt(request.nextUrl.searchParams.get('limit') || '9', 10);
        const search = (request.nextUrl.searchParams.get('search') || '').trim();
        const orderByParam = request.nextUrl.searchParams.get('orderBy') || 'CLI_id';
        const orderDirParam = (request.nextUrl.searchParams.get('orderDir') || 'DESC').toUpperCase();

        const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
        const limit = Number.isNaN(limitParam) || limitParam < 1 ? 9 : limitParam;
        const orderByWhitelist = new Set(['CLI_id', 'CLI_name', 'CLI_identification', 'CLI_email']);
        const orderBy = orderByWhitelist.has(orderByParam) ? orderByParam : 'CLI_id';
        const orderDir = orderDirParam === 'ASC' ? 'ASC' : 'DESC';
        const offset = (page - 1) * limit;

        const filterParams: (string | number)[] = [];
        let whereClause = '';
        if (search) {
            whereClause = `
                WHERE (
                    CONCAT_WS(' ', gpa_c.CLI_name, gpa_c.CLI_f_lastname, gpa_c.CLI_s_lastname) LIKE ?
                    OR
                    gpa_c.CLI_name LIKE ?
                    OR gpa_c.CLI_f_lastname LIKE ?
                    OR gpa_c.CLI_s_lastname LIKE ?
                    OR gpa_c.CLI_email LIKE ?
                    OR gpa_c.CLI_identification LIKE ?
                )
            `;
            const likeSearch = `%${search}%`;
            filterParams.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
        }

        const countResult = await executeQuery(
            `SELECT COUNT(gpa_c.CLI_id) as totalClients
            FROM gpa_clients gpa_c
            ${whereClause}`,
            filterParams
        );
        const totalClients = Number((countResult as any[])[0]?.totalClients || 0);
        const totalPages = Math.ceil(totalClients / limit);

        const clients: GPAClient[] = await executeQuery(
            `SELECT 
                CLI_id,
                CLI_name,
                CLI_email,
                CLI_phone,
                CLI_additional_directions,
                CLI_civil_status,
                CLI_observations,
                CLI_f_lastname,
                CLI_s_lastname,
                CLI_identificationtype,
                CLI_identification,
                CLI_isperson,
                CLI_province,
                CLI_canton,
                CLI_district,
                CLI_neighborhood,
                count(gpa_p.PRJ_id) as CLI_projects_amount
            FROM gpa_clients gpa_c LEFT JOIN gpa_projects gpa_p on gpa_c.CLI_id=gpa_p.PRJ_client_id
            ${whereClause}
            GROUP BY gpa_c.CLI_id
            ORDER BY gpa_c.${orderBy} ${orderDir}
            LIMIT ?, ?`,
            [...filterParams, offset, limit]
        );
        return NextResponse.json({
            message: "Clients requested succesfully",
            page,
            limit,
            totalClients,
            totalPages,
            orderBy,
            orderDir,
            clients
        }, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Server Error: Error in the clients request" },
            { status: 500 }
        );
    }
}