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
    const pageParam = Number.parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limitParam = Number.parseInt(request.nextUrl.searchParams.get('limit') || '10', 10);
    const search = (request.nextUrl.searchParams.get('search') || '').trim();
    const orderByParam = request.nextUrl.searchParams.get('orderBy') || 'creationDate';
    const orderDirParam = (request.nextUrl.searchParams.get('orderDir') || 'DESC').toUpperCase();
    const hasServerFilters = request.nextUrl.searchParams.has('page')
      || request.nextUrl.searchParams.has('limit')
      || request.nextUrl.searchParams.has('search')
      || request.nextUrl.searchParams.has('orderBy')
      || request.nextUrl.searchParams.has('orderDir');

    const fullUsersQuery = `SELECT 
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
            JOIN gpa_roles r ON us.usr_role_id = r.rol_id`;

    if (!hasServerFilters) {
      const users: GPAUser[] = await executeQuery(fullUsersQuery);
      return NextResponse.json({
        message: "Usuarios obtenidos exitosamente",
        users
      }, { status: 200 });
    }

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 10 : limitParam;
    const orderByMap: Record<string, string> = {
      name: 'USR_name',
      firstLastName: 'USR_f_lastname',
      secondLastName: 'USR_s_lastname',
      email: 'USR_email',
      role: 'ROL_name',
      creationDate: 'USR_creation_date',
      lastAccessDate: 'USR_last_access_date',
    };
    const orderBy = orderByMap[orderByParam] || 'USR_creation_date';
    const orderDir = orderDirParam === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const filterParams: (string | number)[] = [];
    let whereClause = '';
    if (search) {
      whereClause = `
        WHERE (
          CONCAT_WS(' ', us.USR_name, us.USR_f_lastname, us.USR_s_lastname) LIKE ?
          OR us.USR_name LIKE ?
          OR us.USR_f_lastname LIKE ?
          OR us.USR_s_lastname LIKE ?
          OR us.USR_email LIKE ?
          OR r.ROL_name LIKE ?
        )
      `;
      const likeSearch = `%${search}%`;
      filterParams.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
    }

    const countResult = await executeQuery(
      `SELECT COUNT(us.USR_id) as totalUsers
       FROM gpa_users us
       JOIN gpa_roles r ON us.usr_role_id = r.rol_id
       ${whereClause}`,
      filterParams
    );
    const totalUsers = Number((countResult as any[])[0]?.totalUsers || 0);
    const totalPages = Math.ceil(totalUsers / limit);
    const totalActiveUsersResult = await executeQuery(
      'SELECT COUNT(USR_id) as totalActiveUsers FROM gpa_users WHERE USR_active = 1'
    );
    const totalAdminUsersResult = await executeQuery(
      `SELECT COUNT(us.USR_id) as totalAdminUsers
       FROM gpa_users us
       JOIN gpa_roles r ON us.usr_role_id = r.rol_id
       WHERE LOWER(r.ROL_name) = 'admin'`
    );
    const totalRegularUsersResult = await executeQuery(
      `SELECT COUNT(us.USR_id) as totalRegularUsers
       FROM gpa_users us
       JOIN gpa_roles r ON us.usr_role_id = r.rol_id
       WHERE LOWER(r.ROL_name) = 'usuario'`
    );

    const users: GPAUser[] = await executeQuery(
      `${fullUsersQuery}
       ${whereClause}
       ORDER BY us.${orderBy} ${orderDir}
       LIMIT ?, ?`,
      [...filterParams, offset, limit]
    );

    return NextResponse.json({
      message: "Usuarios obtenidos exitosamente",
      page,
      limit,
      totalUsers,
      totalPages,
      totalActiveUsers: Number((totalActiveUsersResult as any[])[0]?.totalActiveUsers || 0),
      totalAdminUsers: Number((totalAdminUsersResult as any[])[0]?.totalAdminUsers || 0),
      totalRegularUsers: Number((totalRegularUsersResult as any[])[0]?.totalRegularUsers || 0),
      orderBy,
      orderDir,
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