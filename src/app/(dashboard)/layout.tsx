"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Bell, User, Menu, Plus } from "lucide-react";
import { DividoLogo } from "@/components/ui/divido-logo";
import { useAuth } from "@/components/providers/auth-provider";
import axios from "axios";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const { logout } = useAuth();

  // Fetch unread notifications count
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUnreadNotifications = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) {
          const unread = res.data.data.filter((n: any) => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnreadNotifications();
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Groups", href: "/groups", icon: Users },
    { name: "Personal", href: "/personal", icon: User },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadCount,
    },
  ];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"}`}>
      <div className="flex items-center gap-2 p-6 border-b">
        <div className="p-2 rounded-lg">
          <DividoLogo size={24} />
        </div>
        <span className="text-xl font-bold">Divido</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
              {item.badge > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link href="/groups/create">
          <Button
            className="w-full mb-3"
            onClick={() => mobile && setSidebarOpen(false)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </Link>
        <Button variant="outline" className="w-full" onClick={logout}>
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r">
          <Sidebar />
        </div>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded">
              <DividoLogo size={16} />
            </div>
            <span className="font-bold">Divido</span>
          </div>
          <div className="w-10" />
        </div>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
