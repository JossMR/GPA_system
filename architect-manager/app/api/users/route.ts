import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Insertar usuario
    const results = await executeTransaction([
      {
        query: 'INSERT INTO gpa_users (USR_email, USR_active, USR_role_id) VALUES (?, ?, ?)',
        params: [body.USR_email, body.USR_active, body.USR_role_id]
      }
    ]);
    // Obtener id del usuario insertado para devolverlo
    const insertResult = results[0] as any;
    const insertId = insertResult.insertId;
    const user = await executeQuery(
      'SELECT USR_id, USR_email, USR_active, USR_role_id FROM gpa_users WHERE USR_id = ?',
      [insertId]
    );

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: user[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}