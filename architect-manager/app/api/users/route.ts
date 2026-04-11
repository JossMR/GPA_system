import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';
import { GPAUser } from '@/models/GPA_user';
import { validateRequiredFields, getLocalMySQLDateTime } from '@/models/GPA_user';

export async function POST(req: NextRequest) {
  try {
    const newUser = await req.json();
    if (!newUser) {
      return NextResponse.json(
        { error: "Los datos del usuario no fueron proporcionados" },
        { status: 400 }
      );
    }
    // Validate required fields
    const fields = validateRequiredFields(newUser);
    if (!fields) {
      return NextResponse.json(
        { error: "Los campos del usuario son requeridos" },
        { status: 400 }
      );
    }
    // Check if a user with the same email already exists
    const usersWithSameEmail = await executeQuery(
      'SELECT * FROM gpa_users us WHERE us.usr_email = ?',
      [newUser.USR_email]
    );
    if (usersWithSameEmail.length !== 0 || !Array.isArray(usersWithSameEmail)){
          return NextResponse.json(
            { error: "Un usuario con este correo electrónico ya está registrado." },
            { status: 401 }
          );
    }
    if (!Array.isArray(usersWithSameEmail) || usersWithSameEmail.length !== 0) {
      return NextResponse.json(
        { error: "Un usuario con este correo electrónico ya está registrado." },
        { status: 401 }
      );
    }
    // Insert the new user into the database
    const results = await executeTransaction([
      {
        query: 'INSERT INTO gpa_users (USR_email, USR_active, USR_role_id, USR_name, USR_f_lastname, USR_s_lastname, USR_creation_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        params: [newUser.USR_email, newUser.USR_active, newUser.USR_role_id, newUser.USR_name, newUser.USR_f_lastname, newUser.USR_s_lastname, getLocalMySQLDateTime()]
      }
    ]);
    // Get the inserted user's ID
    const insertResult = results[0] as any;
    const insertId = insertResult.insertId;
    const result = await executeQuery(
      'SELECT USR_id, USR_email, USR_active, USR_role_id, USR_name, USR_f_lastname, USR_s_lastname, USR_creation_date, USR_last_access_date FROM gpa_users WHERE USR_id = ?',
      [insertId]
    );
    const user: GPAUser = result[0] as GPAUser;
    return NextResponse.json({
      message: "Usuario creado exitosamente",
      user
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error de servidor: Error en el registro del usuario" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const users: GPAUser[] = await executeQuery(
      `SELECT 
                USR_id,
                USR_role_id,
                USR_active,
                USR_name,
                USR_email,
                USR_f_lastname,
                USR_s_lastname,
                USR_creation_date,
                USR_last_access_date,
                r.ROL_name
            FROM gpa_users us
            JOIN gpa_roles r ON us.usr_role_id = r.rol_id`
    );
    return NextResponse.json({
      message: "Usuarios obtenidos exitosamente",
      users
    }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Error de servidor: Error al obtener los usuarios" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const updatedUser = await req.json();
    if (!updatedUser || !updatedUser.USR_id) {
      return NextResponse.json(
        { error: "El id del usuario es requerido" },
        { status: 400 }
      );
    }
    // Validate required fields
    const fields = validateRequiredFields(updatedUser);
    if (!fields) {
      return NextResponse.json(
        { error: "Los campos del usuario son requeridos" },
        { status: 400 }
      );
    }
    const usersWithSameEmail = await executeQuery(
      'SELECT * FROM gpa_users us WHERE us.usr_email = ? and us.USR_id != ?',
      [updatedUser.USR_email, updatedUser.USR_id]
    );
    if (!Array.isArray(usersWithSameEmail) || usersWithSameEmail.length !== 0) {
      return NextResponse.json(
        { error: "Un usuario con este correo electrónico ya está registrado." },
        { status: 401 }
      );
    }
    const activeUsers: GPAUser[] = await executeQuery(
      'SELECT * FROM gpa_users WHERE USR_active = 1'
    );
    if (activeUsers.length === 1 && activeUsers[0].USR_id === updatedUser.USR_id && updatedUser.USR_active === 0) {
      return NextResponse.json(
        { error: "Debe haber al menos un usuario activo en el sistema." },
        { status: 401 }
      );
    }

    // Update the user in the database
    await executeTransaction([
      {
        query: `UPDATE gpa_users SET 
          USR_email = ?, 
          USR_active = ?, 
          USR_role_id = ?, 
          USR_name = ?, 
          USR_f_lastname = ?, 
          USR_s_lastname = ? 
          WHERE USR_id = ?`,
        params: [
          updatedUser.USR_email,
          updatedUser.USR_active,
          updatedUser.USR_role_id,
          updatedUser.USR_name,
          updatedUser.USR_f_lastname,
          updatedUser.USR_s_lastname,
          updatedUser.USR_id
        ]
      }
    ]);
    // Get the updated user's details
    const result = await executeQuery(
      'SELECT USR_id, USR_email, USR_active, USR_role_id, USR_name, USR_f_lastname, USR_s_lastname, USR_creation_date, USR_last_access_date FROM gpa_users WHERE USR_id = ?',
      [updatedUser.USR_id]
    );
    const user: GPAUser = result[0] as GPAUser;
    return NextResponse.json({
      message: "Usuario actualizado exitosamente",
      user
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error de servidor: Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}