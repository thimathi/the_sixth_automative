"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, ArrowLeft } from "lucide-react"
import { sendPasswordResetOtp} from "@/app/auth/forget-password/forgotPasswordBackend";

export default function ForgetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const { error: resetError } = await sendPasswordResetOtp(email)

      if (resetError) throw new Error(resetError)

      setSuccess(true)
      // Store email in session to use in OTP verification page
      sessionStorage.setItem('resetEmail', email)
      router.push("/auth/forget-password-otp")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code")
    } finally {
      setLoading(false)
    }
  }

  return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
            style={{
              backgroundImage: "url('/log-in-background.png')",
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
            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            <CardDescription>Enter your email to receive a reset code</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
              )}
              {success && (
                  <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
                    Reset code sent successfully! Please check your email.
                  </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>
              <Link href="/auth/login" className="flex items-center justify-center text-sm text-blue-600 hover:underline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
  )
}