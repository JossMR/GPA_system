import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

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