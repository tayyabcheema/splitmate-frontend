"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar: string;
  group: string;
  meta?: any;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    if (!token) {
      console.warn("No auth token found in localStorage.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = res.data;

      if (json.success) {
        const formatted = json.data.map(
          (n: any): NotificationItem => ({
            id: n._id,
            type: n.type,
            title: mapNotificationTitle(n.type),
            message: n.message,
            time: formatDistanceToNow(new Date(n.createdAt), {
              addSuffix: true,
            }),
            read: n.read,
            avatar: extractInitials(n.message, n.meta),
            group: getGroupLabel(n.type),
            meta: n.meta,
          })
        );
        setNotifications(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {/* Show button only if there are unread notifications */}
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border border-muted-foreground/10">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-60" />
                </div>
                <Skeleton className="h-6 w-12 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {notifications.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border rounded-lg bg-muted/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mb-3 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <h2 className="text-lg font-semibold">
              You have no notifications yet
            </h2>
            {/* <p className="text-sm">You're all caught up 🎉</p> */}
          </div>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className="border border-muted-foreground/10"
            >
              <CardHeader className="flex flex-row items-center space-x-4">
                <Avatar>
                  <AvatarFallback>{notification.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold">
                    {notification.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
                {!notification.read && <Badge variant="secondary">New</Badge>}
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="ml-2 px-2 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300 cursor-pointer"
                  >
                    Mark Read
                  </button>
                )}
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {notification.time} · {notification.group}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Helpers
function extractInitials(message: string, meta?: any): string {
  if (meta?.from) return meta.from.slice(0, 2).toUpperCase();
  return message
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function mapNotificationTitle(type: string): string {
  switch (type) {
    case "settlement_received":
      return "Payment Received";
    case "settlement_made":
      return "Payment Made";
    case "reminder":
      return "Group Reminder";
    case "invite":
      return "Group Invitation";
    default:
      return "Notification";
  }
}

function getGroupLabel(type: string): string {
  switch (type) {
    case "settlement_received":
    case "settlement_made":
      return "Transactions";
    case "reminder":
      return "Reminders";
    case "invite":
      return "Invites";
    default:
      return "General";
  }
}
