import type React from "react"
import { DividoLogo } from "@/components/ui/divido-logo"

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
                        <div className="p-3 rounded-full">
                            <DividoLogo size={32} />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">Divido</span>
                    </div>
                </div>
                {children}
            </div>
        </div>
    )
}
