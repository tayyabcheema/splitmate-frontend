"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { ArrowLeft, DollarSign, Users, Calculator } from "lucide-react"

// Mock data
const mockGroups = [
    { id: "1", name: "Weekend Trip" },
    { id: "2", name: "Roommates" },
    { id: "3", name: "Office Lunch" },
]

const mockMembers = [
    { id: "1", name: "You", email: "you@example.com" },
    { id: "2", name: "Sarah Chen", email: "sarah@example.com" },
    { id: "3", name: "Mike Johnson", email: "mike@example.com" },
    { id: "4", name: "Emma Davis", email: "emma@example.com" },
]

const categories = [
    "Food & Dining",
    "Transportation",
    "Accommodation",
    "Entertainment",
    "Shopping",
    "Utilities",
    "Other",
]

const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
]

export default function AddExpensePage() {
    const router = useRouter()

    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        category: "",
        groupId: "",
        paidBy: "1", // Default to "You"
        currency: "USD",
        date: new Date().toISOString().split("T")[0],
    })

    const [participants, setParticipants] = useState<string[]>(["1"])
    const [splitType, setSplitType] = useState("equal")
    const [customSplits, setCustomSplits] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)

    const handleParticipantChange = (memberId: string, checked: boolean) => {
        if (checked) {
            setParticipants([...participants, memberId])
        } else {
            setParticipants(participants.filter((id) => id !== memberId))
        }
    }

    const handleCustomSplitChange = (memberId: string, amount: string) => {
        setCustomSplits((prev) => ({
            ...prev,
            [memberId]: amount,
        }))
    }

    const calculateSplitAmount = () => {
        if (!formData.amount || participants.length === 0) return 0
        return Number.parseFloat(formData.amount) / participants.length
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Validate custom splits if needed
        if (splitType === "custom") {
            const totalCustom = Object.values(customSplits).reduce((sum, amount) => sum + Number.parseFloat(amount || "0"), 0)
            const totalAmount = Number.parseFloat(formData.amount)

            if (Math.abs(totalCustom - totalAmount) > 0.01) {
                toast("Split amounts don't match")
                setIsLoading(false)
                return
            }
        }

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast("Expense added!")
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
                    <h1 className="text-3xl font-bold">Add Expense</h1>
                    <p className="text-muted-foreground">Record a new shared expense</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Expense Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                        {currencies.find((c) => c.code === formData.currency)?.symbol}
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
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map((currency) => (
                                            <SelectItem key={currency.code} value={currency.code}>
                                                {currency.symbol} {currency.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Input
                                id="description"
                                placeholder="What was this expense for?"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
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
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="group">Group</Label>
                            <Select
                                value={formData.groupId}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, groupId: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockGroups.map((group) => (
                                        <SelectItem key={group.id} value={group.id}>
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paidBy">Paid By</Label>
                            <Select
                                value={formData.paidBy}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, paidBy: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockMembers.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Participants */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Participants
                        </CardTitle>
                        <CardDescription>Select who should split this expense</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {mockMembers.map((member) => (
                                <div key={member.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`participant-${member.id}`}
                                        checked={participants.includes(member.id)}
                                        onCheckedChange={(checked) => handleParticipantChange(member.id, checked as boolean)}
                                    />
                                    <Label htmlFor={`participant-${member.id}`} className="flex-1">
                                        {member.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Split Configuration */}
                {participants.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Split Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup value={splitType} onValueChange={setSplitType}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="equal" id="equal" />
                                    <Label htmlFor="equal">
                                        Split equally ({formData.amount ? `$${calculateSplitAmount().toFixed(2)} each` : "$0.00 each"})
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="custom" id="custom" />
                                    <Label htmlFor="custom">Custom amounts</Label>
                                </div>
                            </RadioGroup>

                            {splitType === "custom" && (
                                <div className="space-y-3 mt-4">
                                    <p className="text-sm text-muted-foreground">Enter custom amounts for each participant:</p>
                                    {participants.map((participantId) => {
                                        const member = mockMembers.find((m) => m.id === participantId)
                                        return (
                                            <div key={participantId} className="flex items-center gap-3">
                                                <Label className="w-24">{member?.name}</Label>
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                                        {currencies.find((c) => c.code === formData.currency)?.symbol}
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        className="pl-8"
                                                        value={customSplits[participantId] || ""}
                                                        onChange={(e) => handleCustomSplitChange(participantId, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div className="text-sm text-muted-foreground">
                                        Total: $
                                        {Object.values(customSplits)
                                            .reduce((sum, amount) => sum + Number.parseFloat(amount || "0"), 0)
                                            .toFixed(2)}{" "}
                                        / ${formData.amount || "0.00"}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Submit */}
                <div className="flex gap-4">
                    <Link href="/dashboard" className="flex-1">
                        <Button type="button" variant="outline" className="w-full">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={!formData.amount || !formData.description || participants.length === 0 || isLoading}
                    >
                        {isLoading ? "Adding..." : "Add Expense"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
