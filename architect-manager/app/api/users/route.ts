import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/database';
import { GPAUser } from '@/models/GPA_user';
import { validateRequiredFields,getLocalMySQLDateTime } from '@/models/GPA_user';

export async function POST(req: NextRequest) {
  try {
    const newUser = await req.json();
    if(!newUser){
      return NextResponse.json(
        { error: "User data not provided" }, 
        { status: 400 }
      );
    }
    // Validate required fields
    const fields = validateRequiredFields(newUser);
    if(!fields){
      return NextResponse.json(
        { error: "User fields are missing" },
        { status: 400 }
      );
    }
    // Check if a user with the same email already exists
    const users = await executeQuery(
            'SELECT * FROM gpa_users us WHERE us.usr_email = ?',
            [newUser.USR_email]
        );
        if (!Array.isArray(users) || users.length !== 0) {
            return NextResponse.json(
                { error: "An user with this email is already registered." },
                { status: 401 }
            );
        }
    // Insert the new user into the database
    console.log("Inserting user:", newUser);
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
      message: "User created successfully",
      user
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server Error: Error in the user registration" },
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
            message: "Users requested successfully",
            users
        }, { status: 200 });
    } catch {
        return NextResponse.json(
            { error: "Server Error: Error in the users request" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
  try {
    const updatedUser = await req.json();
    if (!updatedUser || !updatedUser.USR_id) {
      return NextResponse.json(
        { error: "User ID and data must be provided" },
        { status: 400 }
      );
    }
    // Validate required fields
    const fields = validateRequiredFields(updatedUser);
    if (!fields) {
      return NextResponse.json(
        { error: "User fields are missing" },
        { status: 400 }
      );
    }
    // Actualizar el usuario en la base de datos
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
      message: "User updated successfully",
      user
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server Error: Error updating user" },
      { status: 500 }
    );
  }
}