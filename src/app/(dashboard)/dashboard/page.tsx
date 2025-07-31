import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Plus, TrendingUp, TrendingDown, DollarSign, Calendar, ArrowRight } from "lucide-react"

// Mock data
const mockGroups = [
    {
        id: "1",
        name: "Weekend Trip",
        members: 4,
        totalSpent: 1250.0,
        yourBalance: -125.5,
        lastActivity: "2 hours ago",
    },
    {
        id: "2",
        name: "Roommates",
        members: 3,
        totalSpent: 890.25,
        yourBalance: 45.75,
        lastActivity: "1 day ago",
    },
    {
        id: "3",
        name: "Office Lunch",
        members: 8,
        totalSpent: 320.0,
        yourBalance: -15.25,
        lastActivity: "3 days ago",
    },
]

const mockActivities = [
    {
        id: "1",
        type: "expense",
        description: "Dinner at Italian Restaurant",
        amount: 85.5,
        group: "Weekend Trip",
        user: "Sarah Chen",
        time: "2 hours ago",
    },
    {
        id: "2",
        type: "payment",
        description: "Settled up with Mike",
        amount: 25.0,
        group: "Roommates",
        user: "You",
        time: "1 day ago",
    },
    {
        id: "3",
        type: "expense",
        description: "Grocery shopping",
        amount: 156.75,
        group: "Roommates",
        user: "Alex Johnson",
        time: "2 days ago",
    },
]

export default function DashboardPage() {
    const totalOwed = mockGroups.reduce((sum, group) => sum + Math.max(0, -group.yourBalance), 0)
    const totalOwing = mockGroups.reduce((sum, group) => sum + Math.max(0, group.yourBalance), 0)
    const netBalance = totalOwing - totalOwed

    return (
        <div className="p-4 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's your expense overview.</p>
                </div>
                <Link href="/groups/create">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Group
                    </Button>
                </Link>
            </div>

            {/* Balance Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">You Owe</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">${totalOwed.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {mockGroups.filter((g) => g.yourBalance < 0).length} groups
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">You're Owed</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${totalOwing.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {mockGroups.filter((g) => g.yourBalance > 0).length} groups
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ${Math.abs(netBalance).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">{netBalance >= 0 ? "You're ahead" : "You owe overall"}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Your Groups */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Your Groups
                        </CardTitle>
                        <CardDescription>Manage your shared expenses</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockGroups.map((group) => (
                            <Link key={group.id} href={`/groups/${group.id}`}>
                                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-medium">{group.name}</h3>
                                            <Badge variant="secondary">{group.members} members</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>Total: ${group.totalSpent.toFixed(2)}</span>
                                            <span>•</span>
                                            <span>{group.lastActivity}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-medium ${group.yourBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                                            {group.yourBalance >= 0 ? "+" : ""}${group.yourBalance.toFixed(2)}
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>Latest expenses and payments</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        {activity.user === "You"
                                            ? "Y"
                                            : activity.user
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{activity.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {activity.user} • {activity.group} • {activity.time}
                                    </p>
                                </div>
                                <div
                                    className={`text-sm font-medium ${activity.type === "expense" ? "text-red-600" : "text-green-600"}`}
                                >
                                    {activity.type === "expense" ? "-" : "+"}${activity.amount.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
