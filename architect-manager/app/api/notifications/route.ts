import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, executeTransaction } from '@/lib/database'
import { GPANotification, getLocalMySQLDateTime } from '@/models/GPA_notification'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') === 'created' ? 'created' : 'received'
    const userIdParam = searchParams.get('user_id')
    const creatorUserIdParam = searchParams.get('creator_user_id')
    const pageParam = Number.parseInt(searchParams.get('page') || '1', 10)
    const limitParam = Number.parseInt(searchParams.get('limit') || '8', 10)
    const search = (searchParams.get('search') || '').trim()
    const typeFilter = (searchParams.get('type') || 'todas').trim().toLowerCase()
    const orderByParam = (searchParams.get('orderBy') || 'scheduledDate').trim()
    const orderDirParam = (searchParams.get('orderDir') || 'DESC').toUpperCase()

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 8 : limitParam
    const offset = (page - 1) * limit

    const userId = Number.parseInt(userIdParam || creatorUserIdParam || '0', 10)
    if (Number.isNaN(userId) || userId <= 0) {
      return NextResponse.json({
        message: 'Notificaciones obtenidas exitosamente',
        notifications: [],
        page,
        limit,
        totalNotifications: 0,
        totalPages: 0,
        scope,
      }, { status: 200 })
    }

    const baseFrom = `
      FROM GPA_Notifications n
      LEFT JOIN GPA_Users u ON u.USR_id = n.NOT_creator_user_id
      LEFT JOIN GPA_Notifications_Types nt ON nt.NTP_id = n.NTP_id
      ${scope === 'received' ? 'INNER JOIN GPA_UsersXGPA_Notifications uxn ON uxn.NOT_id = n.NOT_id' : ''}
    `

    const createdStatusSql = `
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM GPA_UsersXGPA_Notifications uxns
          WHERE uxns.NOT_id = n.NOT_id AND uxns.UXN_read = 0
        ) THEN 'unread'
        ELSE 'read'
      END
    `

    const selectStatusSql = scope === 'received'
      ? `CASE WHEN uxn.UXN_read = 1 THEN 'read' ELSE 'unread' END`
      : createdStatusSql

    const whereParts: string[] = []
    const whereParams: (string | number)[] = []

    if (scope === 'received') {
      whereParts.push('uxn.USR_id = ?')
      whereParams.push(userId)
    } else {
      whereParts.push('n.NOT_creator_user_id = ?')
      whereParams.push(userId)
    }

    if (search) {
      whereParts.push('(n.NOT_name LIKE ? OR n.NOT_description LIKE ?)')
      const likeSearch = `%${search}%`
      whereParams.push(likeSearch, likeSearch)
    }

    if (typeFilter && typeFilter !== 'todas' && typeFilter !== 'all') {
      whereParts.push('LOWER(nt.NTP_name) = ?')
      whereParams.push(typeFilter)
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : ''

    const orderDir = orderDirParam === 'ASC' ? 'ASC' : 'DESC'
    const orderBySqlMap: Record<string, string> = {
      name: 'n.NOT_name',
      scheduledDate: 'n.NOT_date',
      status: scope === 'received' ? 'uxn.UXN_read' : createdStatusSql,
    }
    const orderBySql = orderBySqlMap[orderByParam] || 'n.NOT_date'

    const countResult = await executeQuery(
      `SELECT COUNT(n.NOT_id) as totalNotifications
      ${baseFrom}
      ${whereClause}`,
      whereParams
    ) as any[]

    const totalNotifications = Number(countResult[0]?.totalNotifications || 0)
    const totalPages = Math.ceil(totalNotifications / limit)

    const notifications = await executeQuery(
      `SELECT n.*, CONCAT (u.USR_name, ' ', u.USR_f_lastname, ' ', u.USR_s_lastname) AS creator_name,
              nt.NTP_name AS notification_type_name,
              ${selectStatusSql} AS notification_status
      ${baseFrom}
      ${whereClause}
      ORDER BY ${orderBySql} ${orderDir}
      LIMIT ?, ?`,
      [...whereParams, offset, limit]
    ) as (GPANotification & { notification_status?: 'read' | 'unread' })[]

    if (notifications.length > 0) {
      const notificationIds = notifications
        .map((notif) => notif.NOT_id)
        .filter((id): id is number => typeof id === 'number')

      if (notificationIds.length > 0) {
        const placeholders = notificationIds.map(() => '?').join(',')
        const destinationRows = await executeQuery(
          `SELECT NOT_id, USR_id, UXN_read
           FROM GPA_UsersXGPA_Notifications
           WHERE NOT_id IN (${placeholders})`,
          notificationIds
        ) as Array<{ NOT_id: number; USR_id: number; UXN_read: number | boolean }>

        const destinationByNotification = destinationRows.reduce<Record<number, Array<[number, boolean]>>>((acc, row) => {
          if (!acc[row.NOT_id]) {
            acc[row.NOT_id] = []
          }
          acc[row.NOT_id].push([Number(row.USR_id), Boolean(row.UXN_read)])
          return acc
        }, {})

        notifications.forEach((notif) => {
          if (notif.NOT_id) {
            notif.destination_users_ids = destinationByNotification[notif.NOT_id] || []
          }
        })
      }
    }

    return NextResponse.json({
      message: "Notificaciones obtenidas exitosamente",
      notifications,
      page,
      limit,
      totalNotifications,
      totalPages,
      scope,
    }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Error de servidor: Error en la solicitud de notificaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
          const newNotification:GPANotification = await request.json();
          if (!newNotification) {
              return NextResponse.json(
                  { error: "Error de servidor: No se recibieron datos de notificación para el registro." },
                  { status: 400 }
              );
          }
          if (!newNotification.destination_users_ids || newNotification.destination_users_ids.length === 0) {
              return NextResponse.json(
                  { error: "Error de servidor: Se debe proporcionar al menos un ID de usuario destinatario." },
                  { status: 400 }
              );
          }
          const results = await executeTransaction([
              {
                  query: `
                      INSERT INTO gpa_notifications (
                      NOT_name,
                      NOT_creator_user_id,
                      NOT_created_at,
                      NOT_date,
                      NOT_description,
                      PRJ_id,
                      NTP_id
                      ) VALUES (?, ?, ?, ?, ?, ?, ?)
                  `,
                  params: [
                      newNotification.NOT_name,
                      newNotification.NOT_creator_user_id,
                      getLocalMySQLDateTime() || null,
                      newNotification.NOT_date || getLocalMySQLDateTime(),
                      newNotification.NOT_description || null,
                      newNotification.PRJ_id || null,
                      newNotification.NTP_id
                  ]
              }
          ]);
          const insertResult = results[0] as any;
          const insertId = insertResult.insertId;
          // Insert into GPA_UsersXGPA_Notifications for each destination user
          const userNotificationInserts = newNotification.destination_users_ids.map(userId => ({
              query: `
                  INSERT INTO gpa_usersxgpa_notifications (USR_id, NOT_id, uxn_read)
                  VALUES (?, ?, ?)
              `,
              params: [userId[0], insertId, false]
          }));
          await executeTransaction(userNotificationInserts);
          
          const result = await executeQuery(
              `SELECT 
                  NOT_name,
                  NOT_creator_user_id,
                  NOT_created_at,
                  NOT_date,
                  NOT_description,
                  PRJ_id,
                  NTP_id
              FROM gpa_notifications
              WHERE NOT_id = ?`,
              [insertId]
          );
          const notification: GPANotification = result[0] as GPANotification;
          return NextResponse.json({
              message: "Notificación registrada exitosamente",
              notification
          }, { status: 200 });
      } catch (error) {
          return NextResponse.json(
              { error: "Error de servidor: Error en el registro de la notificación" },
              { status: 500 }
          );
      }
  }
