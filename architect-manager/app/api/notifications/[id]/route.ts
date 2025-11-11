import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { GPANotification } from '@/models/GPA_notification';
import { de, el } from 'date-fns/locale';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const notificationId = parseInt(resolvedParams.id)

    if (isNaN(notificationId)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 })
    }

    // Check if notification exists
    const checkQuery = 'SELECT NOT_id FROM GPA_Notifications WHERE NOT_id = ?'
    const existing = await executeQuery(checkQuery, [notificationId]) as any[]

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    const deleteUserNotificationsQuery = 'DELETE FROM GPA_UsersXGPA_Notifications WHERE NOT_id = ?'
    await executeQuery(deleteUserNotificationsQuery, [notificationId])

    const deleteQuery = 'DELETE FROM GPA_Notifications WHERE NOT_id = ?'
    await executeQuery(deleteQuery, [notificationId])

    return NextResponse.json({
      message: 'Notification deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url)
  const update_read = searchParams.get('update_read')
  try {
    const resolvedParams = await params;
    const notificationId = parseInt(resolvedParams.id)

    const body = await request.json()
    let {
      NOT_description,
      NOT_created_at,
      NOT_creator_user_id,
      NOT_date,
      PRJ_id,
      NTP_id,
      NOT_name,
      destination_users_ids
    } = body as GPANotification

    if (isNaN(notificationId)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 })
    }
    if (!body) {
      return NextResponse.json(
        { error: "Notification data not received for update." },
        { status: 400 }
      );
    }
    if (!destination_users_ids || destination_users_ids.length === 0) {
      return NextResponse.json(
        { error: "Destination users data not received for update." },
        { status: 400 }
      );
    }

    if (!update_read || update_read !== 'Y') {
      const destinationUsersQuery = 'SELECT USR_id FROM GPA_UsersXGPA_Notifications WHERE NOT_id = ?';
      const destinationUsersData = await executeQuery(destinationUsersQuery, [notificationId]) as { USR_id: number }[];
      
      const existingDestinationUsers = destinationUsersData.map(row => row.USR_id);

      const newDestinationUsersIds: number[] = destination_users_ids
        ? destination_users_ids.map((des: [number, boolean]) => des[0]).filter((id): id is number => id !== undefined)
        : [];

      const updateQuery = `

      UPDATE GPA_Notifications SET
        NOT_description= ?,
        NOT_name= ?,
        NOT_created_at= ?,
        NOT_creator_user_id = ?,
        NOT_date= ?,
        PRJ_id= ?,
        NTP_id= ?
      WHERE NOT_id = ?
    `

      await executeQuery(updateQuery, [
        NOT_description,
        NOT_name,
        NOT_created_at,
        NOT_creator_user_id,
        NOT_date,
        PRJ_id,
        NTP_id,
        notificationId
      ])

      const destinationUsersToAdd = newDestinationUsersIds
        ? newDestinationUsersIds.filter(des => !existingDestinationUsers.includes(des))
        : [];

      const destinationUsersToRemove = existingDestinationUsers
        ? existingDestinationUsers.filter(des => !newDestinationUsersIds.includes(des))
        : [];

      // Add new destination users
      for (const desId of destinationUsersToAdd) {
        await executeQuery(
          `INSERT INTO GPA_UsersXGPA_Notifications (USR_id, NOT_id, UXN_read) VALUES (?, ?, ?)`,
          [desId, notificationId, false]
        );
      }

      // Remove old destination users
      for (const desId of destinationUsersToRemove) {
        await executeQuery(
          `DELETE FROM GPA_UsersXGPA_Notifications WHERE USR_id = ? AND NOT_id = ?`,
          [desId, notificationId]
        );
      }
    }
    else {
      const destinationUsersQuery = 'SELECT USR_id, UXN_read FROM GPA_UsersXGPA_Notifications WHERE NOT_id = ?';
      const existingDestinationUsers = await executeQuery(destinationUsersQuery, [notificationId]) as { USR_id: number; UXN_read: boolean }[];

      // Update read status for destination users
      for (const [userId, readStatus] of destination_users_ids) {
        const existingUser = existingDestinationUsers.find(eu => eu.USR_id === userId);
        if (existingUser && Boolean(existingUser.UXN_read) !== readStatus) {
          await executeQuery(
            `UPDATE GPA_UsersXGPA_Notifications SET UXN_read = ? WHERE USR_id = ? AND NOT_id = ?`,
            [readStatus, userId, notificationId]
          );
          return NextResponse.json({ message: 'Notification read status updated successfully' }, { status: 200 })
        }
      }
    }
    return NextResponse.json({ message: 'Notification updated successfully' }, { status: 200 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}