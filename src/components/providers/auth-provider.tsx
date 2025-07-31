"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
    name: string
    email: string
}

interface AuthContextType {
    isAuthenticated: boolean
    login: (user: User) => void
    logout: () => void
    user: User | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    // Load from localStorage on mount
useEffect(() => {
    try {
        const storedUser = localStorage.getItem("user")
        const isAuth = localStorage.getItem("isAuthenticated") === "true"

        if (isAuth && storedUser) {
            const parsedUser = JSON.parse(storedUser)
            if (parsedUser && typeof parsedUser === "object") {
                setIsAuthenticated(true)
                setUser(parsedUser)
            }
        }
    } catch (error) {
        console.error("Error parsing user from localStorage", error)
        // Optional: clear corrupted storage
        localStorage.removeItem("user")
        localStorage.removeItem("isAuthenticated")
    } finally {
        setLoading(false)
    }
}, [])


    const login = (userData: User) => {
        setIsAuthenticated(true)
        setUser(userData)
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("user", JSON.stringify(userData))
        router.push("/dashboard")
    }

    const logout = () => {
        setIsAuthenticated(false)
        setUser(null)
        localStorage.removeItem("isAuthenticated")
        localStorage.removeItem("user")
        router.push("/login")
    }

    // Handle redirection
    useEffect(() => {
        if (loading) return

        const authRoutes = ["/login", "/signup", "/forgot-password"]
        const isAuthRoute = authRoutes.includes(pathname)

        if (isAuthenticated && isAuthRoute) {
            router.push("/dashboard")
        } else if (!isAuthenticated && !isAuthRoute) {
            router.push("/login")
        }
    }, [isAuthenticated, pathname, loading, router])

    if (loading) {
        return <div className="p-8">Loading authentication...</div>
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
