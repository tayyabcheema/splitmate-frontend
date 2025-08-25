"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Download, Edit, Trash2, DollarSign, Filter, TrendingUp, PieChart } from "lucide-react"

// Mock personal expenses data
const mockExpenses = [
    {
        id: "1",
        description: "Coffee at Starbucks",
        amount: 5.5,
        category: "Food & Dining",
        date: "2024-01-15",
        method: "Credit Card",
    },
    {
        id: "2",
        description: "Uber ride to airport",
        amount: 25.0,
        category: "Transportation",
        date: "2024-01-14",
        method: "Debit Card",
    },
    {
        id: "3",
        description: "Netflix subscription",
        amount: 15.99,
        category: "Entertainment",
        date: "2024-01-13",
        method: "Credit Card",
    },
    {
        id: "4",
        description: "Grocery shopping",
        amount: 87.45,
        category: "Food & Dining",
        date: "2024-01-12",
        method: "Debit Card",
    },
    {
        id: "5",
        description: "Gas station",
        amount: 45.0,
        category: "Transportation",
        date: "2024-01-11",
        method: "Credit Card",
    },
]

const categories = [
    "All Categories",
    "Food & Dining",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Utilities",
    "Healthcare",
    "Other",
]

const paymentMethods = ["Credit Card", "Debit Card", "Cash", "PayPal", "Other"]

export default function PersonalExpensesPage() {
    const [expenses, setExpenses] = useState(mockExpenses)
    const [filterCategory, setFilterCategory] = useState("All Categories")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingExpense, setEditingExpense] = useState<any>(null)
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        method: "",
    })

    const filteredExpenses = expenses.filter(
        (expense) => filterCategory === "All Categories" || expense.category === filterCategory,
    )

    const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const avgExpense = filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0

    const categoryTotals = expenses.reduce(
        (acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount
            return acc
        },
        {} as Record<string, number>,
    )

    const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]

    const resetForm = () => {
        setFormData({
            description: "",
            amount: "",
            category: "",
            date: new Date().toISOString().split("T")[0],
            method: "",
        })
        setEditingExpense(null)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const expenseData = {
            ...formData,
            amount: Number.parseFloat(formData.amount),
            id: editingExpense?.id || Date.now().toString(),
        }

        if (editingExpense) {
            setExpenses((prev) => prev.map((exp) => (exp.id === editingExpense.id ? expenseData : exp)))
            toast("Expense updated!")
        } else {
            setExpenses((prev) => [expenseData, ...prev])
            toast("Expense added!")
        }

        setIsAddDialogOpen(false)
        resetForm()
    }

    const handleEdit = (expense: any) => {
        setEditingExpense(expense)
        setFormData({
            description: expense.description,
            amount: expense.amount.toString(),
            category: expense.category,
            date: expense.date,
            method: expense.method,
        })
        setIsAddDialogOpen(true)
    }

    const handleDelete = (id: string) => {
        setExpenses((prev) => prev.filter((exp) => exp.id !== id))
        toast("Expense deleted")
    }

    const exportCSV = () => {
        const csvContent = [
            ["Date", "Description", "Category", "Amount", "Payment Method"],
            ...filteredExpenses.map((expense) => [
                expense.date,
                expense.description,
                expense.category,
                expense.amount.toString(),
                expense.method,
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "personal-expenses.csv"
        a.click()
        window.URL.revokeObjectURL(url)

        toast("Export successful!")
    }

    return (
        <div className="p-4 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Personal Expenses</h1>
                    <p className="text-muted-foreground">Track your individual spending and expenses</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={exportCSV} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingExpense ? "Edit Expense" : "Add Personal Expense"}</DialogTitle>
                                <DialogDescription>
                                    {editingExpense ? "Update your expense details" : "Record a new personal expense"}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            placeholder="What did you spend on?"
                                            value={formData.description}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Amount</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                                    $
                                                </span>
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="pl-8"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.slice(1).map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="method">Payment Method</Label>
                                        <Select
                                            value={formData.method}
                                            onValueChange={(value) => setFormData((prev) => ({ ...prev, method: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="How did you pay?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {paymentMethods.map((method) => (
                                                    <SelectItem key={method} value={method}>
                                                        {method}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">{editingExpense ? "Update" : "Add"} Expense</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">{filteredExpenses.length} expenses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${avgExpense.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Per transaction</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{topCategory?.[0] || "N/A"}</div>
                        <p className="text-xs text-muted-foreground">${topCategory?.[1]?.toFixed(2) || "0.00"} spent</p>
                    </CardContent>
                </Card>
            </div>

            {/* Expenses Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Your Expenses</CardTitle>
                            <CardDescription>Manage your personal spending records</CardDescription>
                        </div>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-48">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredExpenses.length === 0 ? (
                        <div className="text-center py-12">
                            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">No expenses found</p>
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={resetForm}>Add Your First Expense</Button>
                                </DialogTrigger>
                            </Dialog>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead className="w-24">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredExpenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-medium">{expense.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{expense.category}</Badge>
                                        </TableCell>
                                        <TableCell>${expense.amount.toFixed(2)}</TableCell>
                                        <TableCell>{expense.method}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(expense)} className="h-8 w-8">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
