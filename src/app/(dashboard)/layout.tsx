"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Home, Users, Bell, User, Menu, Wallet, Plus } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Groups", href: "/groups", icon: Users },
    { name: "Personal", href: "/personal", icon: User },
    { name: "Notifications", href: "/notifications", icon: Bell, badge: 3 },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const { logout } = useAuth()

    const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
        <div className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"}`}>
            <div className="flex items-center gap-2 p-6 border-b">
                <div className="p-2 bg-blue-600 rounded-lg">
                    <Wallet className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">SplitMate</span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                                }`}
                            onClick={() => mobile && setSidebarOpen(false)}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                            {item.badge && (
                                <Badge variant="secondary" className="ml-auto">
                                    {item.badge}
                                </Badge>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t">
                <Link href="/groups/create">
                    <Button className="w-full mb-3" onClick={() => mobile && setSidebarOpen(false)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Group
                    </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={logout}>
                    Sign Out
                </Button>
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64 bg-white border-r">
                    <Sidebar />
                </div>
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-64">
                    <Sidebar mobile />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
                    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                    </Sheet>
                    <div className="flex items-center gap-2">
                        <div className="p-1 bg-blue-600 rounded">
                            <Wallet className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold">SplitMate</span>
                    </div>
                    <div className="w-10" />
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    )
}
