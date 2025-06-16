"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Car } from "lucide-react"
import { supabase} from "@/utils/supabase";

export default function ForgetPasswordOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendDisabled, setResendDisabled] = useState(true)
  const [resendTime, setResendTime] = useState(30)
  const router = useRouter()

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetEmail')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      router.push("/auth/forget-password")
    }
  }, [router])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendDisabled && resendTime > 0) {
      timer = setTimeout(() => setResendTime(resendTime - 1), 1000)
    } else if (resendTime === 0) {
      setResendDisabled(false)
      setResendTime(30)
    }
    return () => clearTimeout(timer)
  }, [resendDisabled, resendTime])

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Autofocus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text/plain').trim()
    if (/^\d{6}$/.test(pasteData)) {
      const pasteArray = pasteData.split('').slice(0, 6)
      setOtp(pasteArray)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const otpCode = otp.join("")
      if (otpCode.length !== 6) {
        throw new Error("Please enter a complete 6-digit code")
      }

      router.push("/auth/reset-password")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    setError("")
    setResendDisabled(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password?email=${email}`,
      })

      if (error) throw error

      // Start countdown again
      setResendTime(30)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code")
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
            <CardTitle className="text-2xl font-bold">Enter Verification Code</CardTitle>
            <CardDescription>We've sent a 6-digit code to {email}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
              )}
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <div
                    className="flex gap-2 justify-center"
                    onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                      <Input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          pattern="\d*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          className="w-12 h-12 text-center text-lg font-semibold"
                          required
                          disabled={loading}
                      />
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
              <div className="text-center">
                <Button
                    variant="ghost"
                    className="text-sm"
                    onClick={handleResendCode}
                    disabled={resendDisabled || loading}
                >
                  {resendDisabled ? `Resend Code in ${resendTime}s` : "Resend Code"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
  )
}