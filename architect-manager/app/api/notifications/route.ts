import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, executeTransaction } from '@/lib/database'
import { GPANotification, getLocalMySQLDateTime } from '@/models/GPA_notification'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    let query = `SELECT n.*, CONCAT (u.USR_name, " ", u.USR_f_lastname, " ", u.USR_s_lastname) AS creator_name 
                  FROM GPA_Notifications n
                  LEFT JOIN GPA_Users u ON u.USR_id = n.NOT_creator_user_id`
    const params: any[] = []
    if (userId) {
          const userIdNum = parseInt(userId)
          if (!isNaN(userIdNum)) {
            query += ` 
              INNER JOIN GPA_UsersXGPA_Notifications uxn ON uxn.NOT_id = n.NOT_id
              WHERE uxn.USR_id = ?`
            params.push(userIdNum)
          }
        }
        
        query += ' ORDER BY n.NOT_created_at DESC'
        
        const notifications = await executeQuery(query, params) as GPANotification[]
    return NextResponse.json({
      message: "Notifications requested successfully",
      notifications
    }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Server Error: Error in the notifications request" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
          const newNotification:GPANotification = await request.json();
          if (!newNotification) {
              return NextResponse.json(
                  { error: "Notification data not received for registration." },
                  { status: 400 }
              );
          }
          if (!newNotification.destination_users_ids || newNotification.destination_users_ids.length === 0) {
              return NextResponse.json(
                  { error: "At least one destination user ID must be provided." },
                  { status: 400 }
              );
          }
          const results = await executeTransaction([
              {
                  query: `
                      INSERT INTO gpa_notifications (
                      NOT_name,
                      NOT_creator_user_id,
                      NOT_read,
                      NOT_created_at,
                      NOT_date,
                      NOT_description,
                      PRJ_id,
                      NTP_id
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  `,
                  params: [
                      newNotification.NOT_name,
                      newNotification.NOT_creator_user_id,
                      newNotification.NOT_read || false,
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
                  INSERT INTO gpa_usersxgpa_notifications (USR_id, NOT_id)
                  VALUES (?, ?)
              `,
              params: [userId, insertId]
          }));
          await executeTransaction(userNotificationInserts);
          
          const result = await executeQuery(
              `SELECT 
                  NOT_name,
                  NOT_creator_user_id,
                  NOT_read,
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
              message: "Notification registered succesfully",
              notification
          }, { status: 200 });
      } catch (error) {
          return NextResponse.json(
              { error: "Server Error: Error in the notification register" },
              { status: 500 }
          );
      }
  }
