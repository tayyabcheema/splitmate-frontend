"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import axios from "axios"
  import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    })
    const [isLoading, setIsLoading] = useState(false)
     const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()


    setIsLoading(true)

    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
            name: formData.name,
            email: formData.email,
            password: formData.password,
        })

        toast.success("Account created! You can now log in.")
        router.push("/login")
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message || "Something went wrong during registration"
        toast.error(errorMessage)
    } finally {
        setIsLoading(false)
    }
}


    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Join Divido</CardTitle>
                <CardDescription>Create your account to start splitting expenses</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}
