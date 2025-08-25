"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import axios from "axios"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, DollarSign, ArrowLeft } from "lucide-react"

interface Expense {
  _id: string
  description: string
  amount: number
  category: string
  paidBy: {
    name: string
  }
  updatedAt: string
}

export default function GroupDetailsPage() {
  const { id } = useParams() as { id: string }
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("expenses")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterPayer, setFilterPayer] = useState("all")

  const categories = [
    "all",
    "Food",
    "Transportation",
    "Accommodation",
    "Entertainment",
    "Travel",
    "Other",
  ]

  const payers = [
    "all",
    ...Array.from(new Set(expenses.map((e) => e.paidBy?.name).filter(Boolean))),
  ]

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.warn("No token found")
          return
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${id}/expenses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setExpenses(res.data.data || [])
      } catch (error) {
        console.error("Error fetching expenses:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchExpenses()
    }
  }, [id])

  const filteredExpenses = expenses.filter((expense) => {
    const categoryMatch = filterCategory === "all" || expense.category === filterCategory
    const payerMatch = filterPayer === "all" || expense.paidBy?.name === filterPayer
    return categoryMatch && payerMatch
  })

  if (loading) {
    return <div className="p-4">Loading group expenses...</div>
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Group Details</h1>
          <p className="text-muted-foreground">Expenses and activity in this group</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/expenses/add?groupId=${id}`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </Link>
          <Link href="/settle">
            <Button variant="outline">Settle Up</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
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

          {/* Expense List */}
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
                      <TableCell>${expense.amount.toFixed(2)}</TableCell>
                      <TableCell>{expense.paidBy?.name || "Unknown"}</TableCell>
                      <TableCell>{new Date(expense.updatedAt).toLocaleDateString()}</TableCell>
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
              <CardDescription>This section can display recent group changes.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Activity feed is under construction.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
