"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  paidBy: {
    name: string;
  };
  updatedAt: string;
}

export default function GroupDetailsPage() {
  const { id } = useParams() as { id: string };
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("expenses");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPayer, setFilterPayer] = useState("all");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const categories = [
    "all",
    "Food",
    "Transportation",
    "Accommodation",
    "Entertainment",
    "Travel",
    "Other",
  ];

  const payers = [
    "all",
    ...Array.from(new Set(expenses.map((e) => e.paidBy?.name).filter(Boolean))),
  ];

  // Countdown effect
  useEffect(() => {
    if (!expiresAt) return;

    const updateTime = () => {
      const diff = Math.max(
        0,
        Math.floor((+new Date(expiresAt) - Date.now()) / 1000)
      );
      setTimeLeft(diff);

      if (diff <= 0) {
        setTimeLeft(0);
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${id}/expenses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setExpenses(res.data.data || []);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchExpenses();
  }, [id]);

  const filteredExpenses = expenses.filter((expense) => {
    const categoryMatch =
      filterCategory === "all" || expense.category === filterCategory;
    const payerMatch =
      filterPayer === "all" || expense.paidBy?.name === filterPayer;
    return categoryMatch && payerMatch;
  });

  const getTopCategory = () => {
    if (!expenses.length) return null;
    const grouped: Record<string, number> = {};
    expenses.forEach((e) => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    return { name: sorted[0][0], amount: sorted[0][1] };
  };

  // Invite code generation
  const handleGenerateInvite = async () => {
    try {
      setInviteLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${id}/invite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInviteCode(res.data.data.inviteCode);
      setExpiresAt(new Date(res.data.data.expiresAt)); // store expiry
      toast.success(`Invite code generated: ${res.data.data.inviteCode}`);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to generate invite code"
      );
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-md" /> {/* Back Button */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40" /> {/* Title */}
            <Skeleton className="h-4 w-60" /> {/* Subtitle */}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" /> {/* Add Expense */}
            <Skeleton className="h-10 w-20" /> {/* Invite */}
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardContent className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      {/* <div className="flex items-center gap-4 mb-6">
          <Link href="/groups">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Group Details</h1>
            <p className="text-muted-foreground">
              Expenses and activity in this group
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/groups/${id}/add-expense`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </Link>
            <Button onClick={handleGenerateInvite} disabled={inviteLoading}>
              {inviteLoading ? "Generating..." : "Invite"}
            </Button>
          </div>
        </div> */}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Link href="/groups">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Group Details</h1>
            <p className="text-muted-foreground">
              Expenses and activity in this group
            </p>
          </div>
        </div>

        {/* Right side: Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href={`/groups/${id}/add-expense`} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </Link>
          <Button
            onClick={handleGenerateInvite}
            disabled={inviteLoading}
            className="w-full sm:w-auto"
          >
            {inviteLoading ? "Generating..." : "Invite"}
          </Button>
        </div>
      </div>

      {/* Show Invite Code */}
      {inviteCode && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Code</CardTitle>
            <CardDescription>
              {timeLeft > 0 ? (
                <>
                  Share this code with others. Expires in:{" "}
                  <span className="font-bold">
                    {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                  </span>
                </>
              ) : (
                <span className="text-red-500 font-bold">
                  Token expired. Please resend.
                </span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex items-center justify-between">
            <span className="font-mono text-lg">{inviteCode}</span>
            {timeLeft > 0 ? (
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(inviteCode);
                  toast.success("Invite code copied!");
                }}
                size="sm"
              >
                Copy
              </Button>
            ) : (
              <Button
                onClick={handleGenerateInvite}
                disabled={inviteLoading}
                size="sm"
              >
                {inviteLoading ? "Resending..." : "Resend"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
            <CardTitle>
              PKR {expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {expenses.length} expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Expense</CardDescription>
            <CardTitle>
              PKR{" "}
              {expenses.length
                ? (
                    expenses.reduce((sum, e) => sum + e.amount, 0) /
                    expenses.length
                  ).toFixed(2)
                : "0.00"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Category</CardDescription>
            <CardTitle>{getTopCategory()?.name || "N/A"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              PKR {getTopCategory()?.amount?.toFixed(2) || "0.00"} spent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs (Expenses + Activity) */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPayer} onValueChange={setFilterPayer}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by payer" />
              </SelectTrigger>
              <SelectContent>
                {payers.map((payer) => (
                  <SelectItem key={payer} value={payer}>
                    {payer === "all" ? "All Payers" : payer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expense Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>PKR {expense.amount.toFixed(2)}</TableCell>
                      <TableCell>{expense.paidBy?.name || "Unknown"}</TableCell>
                      <TableCell>
                        {new Date(expense.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{expense.category}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredExpenses.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No expenses match your filters.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="text-muted-foreground">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>
                This section can display recent group changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Activity feed is under construction.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
