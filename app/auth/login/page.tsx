"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select"
import { handleLogin } from "@/app/auth/login/loginBackend"


export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { user, role: userRole, error: loginError } = await handleLogin(email, password)

      if (loginError) throw new Error(loginError)
      if (role !== userRole) throw new Error(`Unauthorized as ${role}, you are ${userRole}`)

      switch (userRole) {
        case "employee": router.push("/employee/dashboard"); break
        case "accountant": router.push("/accountant/dashboard"); break
        case "hr": router.push("/hr/dashboard"); break
        case "manager": router.push("/manager/dashboard"); break
        case "md": router.push("/md/dashboard"); break
        default: router.push("/")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: "url('/forget-password.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-md p-4"
      >
        <Card className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl border border-gray-300">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-black p-3 rounded-full">
                <Car className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-black">Employee Management System</CardTitle>
            <CardDescription className="text-gray-700">The Sixth Automotive</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 text-gray-600 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-black">Role</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="md">Managing Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 mt-2">
              <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm space-y-2 text-gray-700">
                <Link href="/auth/forget-password" className="hover:underline text-black">Forgot password?</Link>
                <p>
                  Don’t have an account?{" "}
                  <Link href="/auth/register" className="text-black font-medium hover:underline">
                    Register here
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
