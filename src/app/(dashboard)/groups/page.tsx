"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Group {
    _id: string
    name: string
    description?: string
    members: { user: any }[]
    // Add more fields as needed
}

export default function GroupListPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const token = localStorage.getItem("token") // Adjust key name if needed
                if (!token) {
                    console.warn("No token found in localStorage")
                    return
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                setGroups(response.data.data)
            } catch (error) {
                console.error("Failed to fetch groups", error)
            } finally {
                setLoading(false)
            }
        }

        fetchGroups()
    }, [])

    if (loading) {
        return <div className="p-6">Loading groups...</div>
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Your Groups</h1>
                <Link href="/groups/create">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Group
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map((group) => (
                    <Link key={group._id} href={`/groups/${group._id}`}>
                        <Card className="cursor-pointer hover:shadow-md transition">
                            <CardHeader>
                                <CardTitle>{group.name}</CardTitle>
                                <CardDescription>{group.description || "No description provided."}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                {group.members.length} members
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
