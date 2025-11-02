import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

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