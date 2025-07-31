"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, CreditCard, Banknote, Smartphone } from "lucide-react"

// Mock data
const mockMembers = [
    { id: "2", name: "Sarah Chen", email: "sarah@example.com", owes: 45.25 },
    { id: "3", name: "Mike Johnson", email: "mike@example.com", owes: -30.5 },
    { id: "4", name: "Emma Davis", email: "emma@example.com", owes: 15.75 },
]

const paymentMethods = [
    { id: "cash", name: "Cash", icon: Banknote },
    { id: "card", name: "Credit/Debit Card", icon: CreditCard },
    { id: "venmo", name: "Venmo", icon: Smartphone },
    { id: "paypal", name: "PayPal", icon: Smartphone },
    { id: "zelle", name: "Zelle", icon: Smartphone },
    { id: "other", name: "Other", icon: CreditCard },
]

export default function SettleUpPage() {
    const router = useRouter()

    const [formData, setFormData] = useState({
        amount: "",
        recipientId: "",
        note: "",
        method: "",
        date: new Date().toISOString().split("T")[0],
    })
    const [isLoading, setIsLoading] = useState(false)

    const selectedMember = mockMembers.find((m) => m.id === formData.recipientId)
    const maxAmount = selectedMember ? Math.abs(selectedMember.owes) : 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const amount = Number.parseFloat(formData.amount)
        if (amount > maxAmount) {
            toast("Amount too high")
            setIsLoading(false)
            return
        }

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast("Payment recorded!")
            router.push("/dashboard")
        }, 1000)
    }

    return (
        <div className="p-4 lg:p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Settle Up</h1>
                    <p className="text-muted-foreground">Record a payment to settle expenses</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Outstanding Balances */}
                <Card>
                    <CardHeader>
                        <CardTitle>Outstanding Balances</CardTitle>
                        <CardDescription>People you owe money to or who owe you money</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                    </div>
                                    <div className={`text-lg font-bold ${member.owes >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {member.owes >= 0 ? "owes you" : "you owe"} ${Math.abs(member.owes).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Settlement Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Record Payment</CardTitle>
                        <CardDescription>Enter the details of your payment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="recipient">Pay To</Label>
                                <Select
                                    value={formData.recipientId}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, recipientId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select person to pay" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockMembers
                                            .filter((m) => m.owes < 0)
                                            .map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    {member.name} (you owe ${Math.abs(member.owes).toFixed(2)})
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="pl-8"
                                        value={formData.amount}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                                        max={maxAmount}
                                        required
                                    />
                                </div>
                                {selectedMember && <p className="text-xs text-muted-foreground">Maximum: ${maxAmount.toFixed(2)}</p>}
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
                                            <SelectItem key={method.id} value={method.id}>
                                                <div className="flex items-center gap-2">
                                                    <method.icon className="h-4 w-4" />
                                                    {method.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="note">Note (Optional)</Label>
                                <Textarea
                                    id="note"
                                    placeholder="Add a note about this payment..."
                                    value={formData.note}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Link href="/dashboard" className="flex-1">
                                    <Button type="button" variant="outline" className="w-full">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={!formData.amount || !formData.recipientId || !formData.method || isLoading}
                                >
                                    {isLoading ? "Recording..." : "Record Payment"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
