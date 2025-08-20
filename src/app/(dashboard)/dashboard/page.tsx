"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Expense {
  _id: string;
  amount: number;
  category: string;
  description: string;
  paidBy: { _id: string; name: string; email: string } | null;
  splits: { user: string; amount: number }[];
  createdAt?: string;
}

interface Group {
  _id: string;
  name: string;
  members: { user: { _id: string; name: string } }[];
  expenses?: Expense[];
  totalSpent?: number;
  averageExpense?: number;
  topCategory?: { name: string; amount: number };
  yourBalance?: number;
}

interface Activity {
  _id: string;
  type: "expense" | "payment";
  description: string;
  user: { _id: string; name: string };
  groupName: string;
  createdAt: string;
  amount?: number;
}

export default function DashboardPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [user, setUser] = useState<{ _id: string; name: string } | null>(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser); // parse only once
      setUser(parsedUser);
      console.log("Logged-in user loaded:", parsedUser);
    }
  }, []);

  // Fetch groups and activities after user is loaded
  useEffect(() => {
    if (!user) return; // Wait for user to be set

    const loggedInUserId = user._id;

    const fetchGroupsAndActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please login again.");
          return;
        }

        // Fetch all groups
        const groupsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const groupsData: Group[] = groupsRes.data.data || [];

        // Fetch expenses for each group
        const groupsWithExpenses = await Promise.all(
          groupsData.map(async (group) => {
            const expRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${group._id}/expenses`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const expenses: Expense[] = expRes.data.data || [];

            const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
            const averageExpense = expenses.length
              ? totalSpent / expenses.length
              : 0;

            const categoryMap: Record<string, number> = {};
            expenses.forEach((e) => {
              categoryMap[e.category] =
                (categoryMap[e.category] || 0) + e.amount;
            });
            let topCategory = { name: "N/A", amount: 0 };
            for (const [name, amount] of Object.entries(categoryMap)) {
              if (amount > topCategory.amount) topCategory = { name, amount };
            }

            // Calculate user's balance
            const yourBalance = expenses.reduce((sum, e) => {
              const paidById = e.paidBy?._id;

              const splitsArray: string[] = e.splits.map((s: any) =>
                typeof s === "string" ? s : s.user
              );

              const splitAmount = e.amount / splitsArray.length;
              const yourSplit = splitsArray.includes(loggedInUserId)
                ? splitAmount
                : 0;

              if (paidById === loggedInUserId) {
                const totalOthersShare = e.amount - yourSplit;
                return sum + totalOthersShare;
              } else {
                return sum - yourSplit;
              }
            }, 0);

            // Debug logs
            console.log(
              `Group: ${group.name}, User Balance: ${yourBalance}, User ID: ${loggedInUserId}`
            );
            expenses.forEach((e) =>
              console.log(
                "Expense:",
                e.description,
                "PaidBy:",
                e.paidBy?._id,
                "Splits:",
                e.splits.map((s) => s.user)
              )
            );

            return {
              ...group,
              expenses,
              totalSpent,
              averageExpense,
              topCategory,
              yourBalance,
            };
          })
        );

        setGroups(groupsWithExpenses);

        // Fetch activities
        const activitiesRes = await Promise.all(
          groupsWithExpenses.map(async (group) => {
            const res = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/group/${group._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const activitiesData: any[] = res.data.data || [];

            const mappedActivities: Activity[] = activitiesData.map(
              (activity) => ({
                _id: activity._id,
                type: activity.type === "expense" ? "expense" : "payment",
                description: activity.description,
                user: { _id: activity.user._id, name: activity.user.name },
                groupName: group.name,
                createdAt: activity.createdAt || new Date().toISOString(),
                amount: activity.meta?.expenseId
                  ? group.expenses?.find(
                      (e) => e._id === activity.meta.expenseId
                    )?.amount ?? 0
                  : 0,
              })
            );

            return mappedActivities;
          })
        );

        setActivities(
          activitiesRes
            .flat()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
        );
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch groups");
        setActivitiesError(
          err.response?.data?.message || "Failed to fetch activities"
        );
      } finally {
        setLoading(false);
        setLoadingActivities(false);
      }
    };

    fetchGroupsAndActivities();
  }, [user]); // <-- dependency on user

  // Totals
  const totalOwed = groups.reduce(
    (sum, group) => sum + Math.max(0, -(group.yourBalance ?? 0)),
    0
  );
  const totalOwing = groups.reduce(
    (sum, group) => sum + Math.max(0, group.yourBalance ?? 0),
    0
  );
  const netBalance = totalOwing - totalOwed;

  // --- UI code remains same ---
  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back,{" "}
            <span className="font-bold text-blue-600">{user?.name}</span>!
          </p>
        </div>
        <Link href="/groups/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Create Group
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You Owe</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              PKR {totalOwed.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {groups.filter((g) => (g.yourBalance ?? 0) < 0).length}{" "}
              groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You're Owed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              PKR {totalOwing.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {groups.filter((g) => (g.yourBalance ?? 0) > 0).length}{" "}
              groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                netBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              PKR {Math.abs(netBalance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netBalance >= 0 ? "You're ahead" : "You owe overall"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Your Groups
            </CardTitle>
            <CardDescription>Manage your shared expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-red-500">⚠️ {error}</p>}
            {!loading && !error && groups.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No groups yet. Create one to get started!
              </p>
            )}

            {groups.map((group) => (
              <Link key={group._id} href={`/groups/${group._id}`}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{group.name}</h3>
                      <Badge variant="secondary">
                        {group.members.length} members
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Total: PKR {(group.totalSpent ?? 0).toFixed(2)}
                      </span>
                      <span>•</span>
                      <span>
                        Avg: PKR {(group.averageExpense ?? 0).toFixed(2)}
                      </span>
                      <span>•</span>
                      <span>
                        Top: {group.topCategory?.name || "N/A"} (PKR{" "}
                        {(group.topCategory?.amount ?? 0).toFixed(2)})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-medium ${
                        (group.yourBalance ?? 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      PKR {Math.abs(group.yourBalance ?? 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(group.yourBalance ?? 0) >= 0
                        ? "You're owed"
                        : "You owe"}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Recent Activity
            </CardTitle>
            <CardDescription>Latest expenses and payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            {loadingActivities && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            )}

            {activitiesError && (
              <p className="text-sm text-red-500">⚠️ {activitiesError}</p>
            )}
            {!loadingActivities && activities.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No recent activity yet.
              </p>
            )}

            {activities.map((activity) => (
              <div
                key={activity._id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {activity.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user.name} • {activity.groupName} •{" "}
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
                <div
                  className={`text-sm font-medium ${
                    activity.type === "expense"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {activity.type === "expense" ? "-" : "+"}PKR{" "}
                  {(activity.amount ?? 0).toFixed(2)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
