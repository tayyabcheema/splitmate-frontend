import type React from "react"
import { Wallet } from "lucide-react"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="p-3 bg-blue-600 rounded-full">
                            <Wallet className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">SplitMate</span>
                    </div>
                </div>
                {children}
            </div>
        </div>
    )
}
