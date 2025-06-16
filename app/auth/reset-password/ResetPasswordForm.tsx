"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Eye, EyeOff } from "lucide-react"
import { handleResetPassword} from "@/app/auth/reset-password/resetPasswordBackend";

export default function ResetPasswordPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') // Get email from URL params

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            if (newPassword !== confirmPassword) {
                throw new Error("Passwords do not match")
            }

            if (newPassword.length < 6) {
                throw new Error("Password must be at least 6 characters")
            }

            if (!email) {
                throw new Error("Invalid reset link")
            }

            const { error: resetError } = await handleResetPassword({
                newPassword,
                email,
            })

            if (resetError) throw new Error(resetError)

            router.push("/auth/reset-password-success")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Password reset failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
            style={{
                backgroundImage: "url('/dashboard-image.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-600 p-3 rounded-full">
                            <Car className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription>Create a new password for your account</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}