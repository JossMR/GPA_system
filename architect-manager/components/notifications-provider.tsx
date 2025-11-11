"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useAuth } from "./auth-provider"
import { GPANotification } from "@/models/GPA_notification"

interface NotificationsContextType {
  unreadCount: number
  refreshNotifications: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshNotifications = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/notifications?user_id=${user.id}`)
      const data = await response.json()
      const notifications: GPANotification[] = data.notifications
      
      // Filter notifications to count only unread ones with valid dates
      const validNotifications = notifications.filter((not) => {
        // Only consider notifications with a valid date (not in the future)
        const notificationDate = not.NOT_date ? new Date(not.NOT_date) : null
        const now = new Date()
        const isDateValid = !notificationDate || notificationDate <= now
        
        // Check if the notification is unread for the current user
        const isUnread = not.destination_users_ids?.some(
          ([userId, isRead]) => userId === user?.id && isRead === false
        )
        
        return isDateValid && isUnread
      })
      
      setUnreadCount(validNotifications.length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  useEffect(() => {
    refreshNotifications()
    
    // Auto-refresh every 5 minute
    const interval = setInterval(refreshNotifications, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [user])

  return (
    <NotificationsContext.Provider value={{ unreadCount, refreshNotifications }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}