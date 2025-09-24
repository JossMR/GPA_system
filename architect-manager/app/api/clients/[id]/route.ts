import { executeQuery, executeTransaction } from '@/lib/database';
import { GPAClient } from '@/models/GPA_client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;
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
        CLI_neighborhood,
        count(gpa_p.PRJ_id) as CLI_projects_amount
      FROM gpa_clients gpa_c
      LEFT JOIN gpa_projects gpa_p ON gpa_c.CLI_id = gpa_p.PRJ_client_id
      WHERE gpa_c.CLI_id = ?
      GROUP BY gpa_c.CLI_id`,
      [clientId]
    );
    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }
    const client: GPAClient = result[0] as GPAClient;
    return NextResponse.json({ client }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Server Error: Error fetching client." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;
    const updatedClient = await request.json();
    if (!updatedClient) {
      return NextResponse.json(
        { error: "Client data not received for update." },
        { status: 400 }
      );
    }
    await executeTransaction([
      {
        query: `
          UPDATE gpa_clients SET
            CLI_name = ?,
            CLI_email = ?,
            CLI_phone = ?,
            CLI_additional_directions = ?,
            CLI_civil_status = ?,
            CLI_observations = ?,
            CLI_f_lastname = ?,
            CLI_s_lastname = ?,
            CLI_identificationtype = ?,
            CLI_identification = ?,
            CLI_isperson = ?,
            CLI_province = ?,
            CLI_canton = ?,
            CLI_district = ?,
            CLI_neighborhood = ?
          WHERE CLI_id = ?
        `,
        params: [
          updatedClient.CLI_name,
          updatedClient.CLI_email,
          updatedClient.CLI_phone,
          updatedClient.CLI_additional_directions,
          updatedClient.CLI_civil_status,
          updatedClient.CLI_observations,
          updatedClient.CLI_f_lastname,
          updatedClient.CLI_s_lastname,
          updatedClient.CLI_identificationtype,
          updatedClient.CLI_identification,
          updatedClient.CLI_isperson,
          updatedClient.CLI_province,
          updatedClient.CLI_canton,
          updatedClient.CLI_district,
          updatedClient.CLI_neighborhood,
          clientId
        ]
      }
    ]);
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
      [clientId]
    );
    const client: GPAClient = result[0] as GPAClient;
    return NextResponse.json({ message: "Client updated successfully", client }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Server Error: Error updating client." },
      { status: 500 }
    );
  }
}