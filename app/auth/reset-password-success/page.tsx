import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function ResetPasswordSuccessPage() {
  return (
      <div
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
          style={{
            backgroundImage: "url('/dashboard-image-two.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
      >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Password Reset Successful</CardTitle>
          <CardDescription>
            Your password has been successfully reset. You can now login with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">
              Your account is now secure with the new password. Please keep it safe and don't share it with anyone.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/login">Continue to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
