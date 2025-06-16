"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Eye, EyeOff } from "lucide-react"
import { handleRegister} from "@/app/auth/register/registerBackend";

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    password: "",
    confirmPassword: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, department: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (!formData.department) {
      setError("Please select a department")
      setLoading(false)
      return
    }

    try {
      const { user, error: registerError } = await handleRegister({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        department: formData.department
      })

      if (registerError) throw new Error(registerError)

      router.push("/auth/login?registered=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
      <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{
            backgroundImage: "url('/sign-in-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

        {/* Card */}
        <Card className="w-full max-w-md relative z-10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Car className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Join The Sixth Automotive team</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                      id="firstName"
                      placeholder="Thimathi"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                      id="lastName"
                      placeholder="Dissanayake"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="manaharatd@gmail.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="+94 71 953 1023"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                    required
                    value={formData.department}
                    onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="md">Managing Director</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
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
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
  )
}