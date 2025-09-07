import { NextRequest, NextResponse } from 'next/server';
import { executeQuery,executeTransaction } from '@/lib/database';
import { GPAUser,getLocalMySQLDateTime } from '@/models/GPA_user';
export async function GET(request: NextRequest) {
  try {
    const users = await executeQuery('SELECT * FROM gpa_users LIMIT 10');
    
    return NextResponse.json({
      message: "Conexión exitosa a la base de datos",
      users: users,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/login:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }
    
    const users = await executeQuery(
      'SELECT id, username, password FROM gpa_users WHERE username = ? LIMIT 1',
      [username]
    );
    
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 401 }
      );
    }
    
    const user = users[0] as any;
    
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        username: user.username
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error en POST /api/login:', error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
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
    // Update last access date
    await executeTransaction([
      {
        query: `UPDATE gpa_users SET 
          USR_last_access_date = ?
          WHERE USR_id = ?`,
        params: [
          getLocalMySQLDateTime(),
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