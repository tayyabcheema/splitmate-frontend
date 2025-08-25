"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"

type NotificationItem = {
  id: string
  type: string
  title: string
  message: string
  time: string
  read: boolean
  avatar: string
  group: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      console.warn("No auth token found in localStorage.")
      return
    }

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const json = res.data

      if (json.success) {
        const formatted = json.data.map((n: any): NotificationItem => ({
          id: n._id,
          type: n.type,
          title: mapNotificationTitle(n.type),
          message: n.message,
          time: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }),
          read: n.read,
          avatar: extractInitials(n.message),
          group: getGroupLabel(n.type),
        }))
        setNotifications(formatted)
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className="border border-muted-foreground/10">
            <CardHeader className="flex flex-row items-center space-x-4">
              <Avatar>
                <AvatarFallback>{notification.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-base font-semibold">{notification.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </div>
              {!notification.read && <Badge variant="secondary">New</Badge>}
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {notification.time} · {notification.group}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Helpers
function extractInitials(message: string): string {
  const words = message.trim().split(" ")
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")
}

function mapNotificationTitle(type: string): string {
  switch (type) {
    case "payment":
      return "Payment Received"
    case "reminder":
      return "Group Reminder"
    case "invite":
      return "Group Invitation"
    default:
      return "Notification"
  }
}

function getGroupLabel(type: string): string {
  switch (type) {
    case "payment":
      return "Transactions"
    case "reminder":
      return "Reminders"
    case "invite":
      return "Invites"
    default:
      return "General"
  }
}
