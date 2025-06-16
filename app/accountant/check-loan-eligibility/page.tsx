"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Calculator, DollarSign, TrendingUp, Clock, PiggyBank, CreditCard } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useUser } from "@/context/user-context"
import {
  fetchEmployees,
  fetchLoanApplications,
  checkLoanEligibility,
  submitLoanApplication,
  type Employee,
  type LoanApplication,
  type EligibilityResult,
  type EligibilityFactor
} from "@/app/accountant/check-loan-eligibility/loanBackend"

export default function CheckLoanEligibility() {
  const { user } = useUser()
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [loanAmount, setLoanAmount] = useState("")
  const [loanType, setLoanType] = useState("")
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [employeesData, loansData] = await Promise.all([
          fetchEmployees(),
          fetchLoanApplications()
        ])
        setEmployees(employeesData)
        setLoanApplications(loansData)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const checkEligibility = async () => {
    if (!selectedEmployee || !loanAmount || !loanType) return

    setIsLoading(true)
    try {
      const amount = Number.parseFloat(loanAmount)
      const result = await checkLoanEligibility(selectedEmployee, amount, loanType)
      setEligibilityResult(result)
    } catch (error) {
      console.error("Error checking eligibility:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitApplication = async () => {
    if (!selectedEmployee || !loanAmount || !loanType || !eligibilityResult) return

    setIsLoading(true)
    try {
      const amount = Number.parseFloat(loanAmount)
      const success = await submitLoanApplication(
          selectedEmployee,
          loanType,
          amount,
          eligibilityResult.level
      )

      if (success) {
        const loans = await fetchLoanApplications()
        setLoanApplications(loans)
        alert("Loan application submitted successfully!")
      } else {
        alert("Failed to submit loan application")
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      alert("An error occurred while submitting the application")
    } finally {
      setIsLoading(false)
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/accountant/dashboard", icon: Calculator },
    { name: "Salary Calculation", href: "/accountant/salary-calculation", icon: DollarSign },
    { name: "Bonus Calculation", href: "/accountant/bonus-calculation", icon: TrendingUp },
    { name: "OT Calculation", href: "/accountant/ot-calculation", icon: Clock },
    { name: "EPF/ETF Management", href: "/accountant/epf-etf-management", icon: PiggyBank },
    { name: "Increment Management", href: "/accountant/increment-management", icon: TrendingUp },
    { name: "Loan Eligibility Check", href: "/accountant/check-loan-eligibility", icon: CreditCard },
  ]

  return (
      <DashboardLayout
          navigation={navigation}
          userRole={user?.role || "accountant"}
          userName={user?.name || "Accountant"}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Loan Eligibility Check</h1>
              <p className="text-muted-foreground">Assess employee loan eligibility and creditworthiness</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Eligibility Assessment
                </CardTitle>
                <CardDescription>Enter loan details to check eligibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Select Employee</Label>
                  <Select
                      value={selectedEmployee}
                      onValueChange={setSelectedEmployee}
                      disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.department}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Select
                      value={loanType}
                      onValueChange={setLoanType}
                      disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal">Personal Loan</SelectItem>
                      <SelectItem value="Emergency">Emergency Loan</SelectItem>
                      <SelectItem value="Vehicle">Vehicle Loan</SelectItem>
                      <SelectItem value="Education">Education Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Loan Amount ($)</Label>
                  <Input
                      id="amount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="Enter loan amount"
                      disabled={isLoading}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                      onClick={checkEligibility}
                      className="w-full"
                      disabled={isLoading || !selectedEmployee || !loanAmount || !loanType}
                  >
                    {isLoading ? "Checking..." : "Check Eligibility"}
                  </Button>
                  {eligibilityResult && (
                      <Button
                          onClick={submitApplication}
                          variant="secondary"
                          disabled={isLoading || !eligibilityResult.approved}
                      >
                        {isLoading ? "Submitting..." : "Submit Application"}
                      </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Financial Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEmployee && (
                    <div className="space-y-3">
                      {(() => {
                        const emp = employees.find((e) => e.id === selectedEmployee)
                        return emp ? (
                            <>
                              <div className="flex justify-between">
                                <span className="font-medium">Annual Salary:</span>
                                <span>${emp.salary.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Tenure (months):</span>
                                <span>{emp.tenure}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Credit Score:</span>
                                <span>{emp.creditScore}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Existing Loans:</span>
                                <span>${emp.existingLoans.toLocaleString()}</span>
                              </div>
                            </>
                        ) : null
                      })()}
                    </div>
                )}
              </CardContent>
            </Card>
          </div>

          {eligibilityResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {eligibilityResult.approved ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    Eligibility Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{eligibilityResult.score}/100</div>
                      <div className="text-sm text-muted-foreground">Eligibility Score</div>
                      <Progress value={eligibilityResult.score} className="mt-2" />
                    </div>
                    <div className="text-center">
                      <Badge
                          variant={
                            eligibilityResult.level === "High"
                                ? "default"
                                : eligibilityResult.level === "Medium"
                                    ? "secondary"
                                    : "destructive"
                          }
                      >
                        {eligibilityResult.level} Eligibility
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">Risk Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">${eligibilityResult.maxRecommendedAmount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Max Recommended</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Assessment Factors:</h4>
                    {eligibilityResult.factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span>{factor.factor}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{factor.status}</Badge>
                            <span className="text-sm">{factor.score}/30</span>
                          </div>
                        </div>
                    ))}
                  </div>

                  <div className="p-4 bg-muted rounded">
                    <p className="font-medium">Recommendation:</p>
                    <p className="text-sm text-muted-foreground">{eligibilityResult.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Loan Applications</CardTitle>
              <CardDescription>Overview of recent loan eligibility assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loanApplications.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.employeeId}</TableCell>
                        <TableCell>{loan.name}</TableCell>
                        <TableCell>{loan.type}</TableCell>
                        <TableCell>${loan.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                              variant={
                                loan.status === "Approved"
                                    ? "default"
                                    : loan.status === "Pending"
                                        ? "secondary"
                                        : "destructive"
                              }
                          >
                            {loan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{loan.date}</TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
  )
}