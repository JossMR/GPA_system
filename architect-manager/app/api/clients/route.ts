import { executeQuery, executeTransaction } from '@/lib/database';
import { GPAClient } from '@/models/GPA_client';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
    try {
        const newClient = await request.json();
        if (!newClient) {
            return NextResponse.json(
                { error: "Client data not received for registration." },
                { status: 400 }
            );
        }
        const clients = await executeQuery(
            'SELECT * FROM gpa_clients cl WHERE cl.cli_email = ?',
            [newClient.CLI_email]
        );
        if (!Array.isArray(clients) || clients.length !== 0) {
            return NextResponse.json(
                { error: "A client with this email is already registered." },
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
            message: "Client registered succesfully",
            client
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Server Error: Error in the client register" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
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
                CLI_neighborhood
            FROM gpa_clients`
        );
        return NextResponse.json({
            message: "Clients requested succesfully",
            clients
        }, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Server Error: Error in the clients request" },
            { status: 500 }
        );
    }
}