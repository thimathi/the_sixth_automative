"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PiggyBank, TrendingUp, FileText, Calculator } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useUser } from "@/context/user-context"
import {
  fetchEmployees,
  fetchEpfEtfContributions,
  calculateEmployeeContributions,
  processMonthlyContributions,
  generateEpfReport,
  generateEtfReport,
  type Employee,
  type EpfEtfContribution,
  type ContributionCalculation
} from "@/app/accountant/epf-etf-management/epfEtfBackend"

export default function EpfEtfManagement() {
  const { user } = useUser()
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [contributionMonth, setContributionMonth] = useState("")
  const [salaryInput, setSalaryInput] = useState("")
  const [calculationResult, setCalculationResult] = useState<ContributionCalculation | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [contributions, setContributions] = useState<EpfEtfContribution[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [employeesData, contributionsData] = await Promise.all([
          fetchEmployees(),
          fetchEpfEtfContributions()
        ])
        setEmployees(employeesData)
        setContributions(contributionsData)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleCalculate = () => {
    if (!salaryInput) return
    const salary = Number.parseFloat(salaryInput)
    const result = calculateEmployeeContributions(salary)
    setCalculationResult(result)
  }

  const handleProcessContributions = async () => {
    if (!contributionMonth) return

    setIsLoading(true)
    try {
      const success = await processMonthlyContributions(contributionMonth)
      if (success) {
        const updatedContributions = await fetchEpfEtfContributions()
        setContributions(updatedContributions)
        alert("Contributions processed successfully!")
      } else {
        alert("Failed to process contributions")
      }
    } catch (error) {
      console.error("Error processing contributions:", error)
      alert("An error occurred while processing contributions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateEpfReport = async () => {
    setIsLoading(true)
    try {
      const success = await generateEpfReport()
      if (success) {
        alert("EPF report generated successfully!")
      } else {
        alert("Failed to generate EPF report")
      }
    } catch (error) {
      console.error("Error generating EPF report:", error)
      alert("An error occurred while generating EPF report")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateEtfReport = async () => {
    setIsLoading(true)
    try {
      const success = await generateEtfReport()
      if (success) {
        alert("ETF report generated successfully!")
      } else {
        alert("Failed to generate ETF report")
      }
    } catch (error) {
      console.error("Error generating ETF report:", error)
      alert("An error occurred while generating ETF report")
    } finally {
      setIsLoading(false)
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/accountant/dashboard", icon: Calculator },
    { name: "Salary Calculation", href: "/accountant/salary-calculation", icon: Calculator },
    { name: "Bonus Calculation", href: "/accountant/bonus-calculation", icon: TrendingUp },
    { name: "OT Calculation", href: "/accountant/ot-calculation", icon: Calculator },
    { name: "EPF/ETF Management", href: "/accountant/epf-etf-management", icon: PiggyBank },
    { name: "Increment Management", href: "/accountant/increment-management", icon: TrendingUp },
    { name: "Loan Eligibility Check", href: "/accountant/check-loan-eligibility", icon: FileText },
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
              <h1 className="text-3xl font-bold">EPF & ETF Management</h1>
              <p className="text-muted-foreground">
                Manage Employee Provident Fund and Employee Trust Fund contributions
              </p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contributions">Contributions</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total EPF Balance</CardTitle>
                    <PiggyBank className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${employees.reduce((sum, emp) => sum + (emp.epfBalance || 0), 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total ETF Balance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${employees.reduce((sum, emp) => sum + (emp.etfBalance || 0), 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly EPF</CardTitle>
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${employees.reduce((sum, emp) => sum + (emp.monthlyEpfEmployee || 0) + (emp.monthlyEpfEmployer || 0), 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Employee + Employer</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly ETF</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${employees.reduce((sum, emp) => sum + (emp.monthlyEtf || 0), 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Employer contribution</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Employee EPF/ETF Details</CardTitle>
                    <CardDescription>View individual employee fund details</CardDescription>
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
                                {emp.name} - {emp.id}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedEmployee && (
                        <div className="space-y-3">
                          {(() => {
                            const emp = employees.find((e) => e.id === selectedEmployee)
                            return emp ? (
                                <>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">EPF Number</Label>
                                      <p className="text-sm">{emp.epfNumber}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">ETF Number</Label>
                                      <p className="text-sm">{emp.etfNumber}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">EPF Balance</Label>
                                      <p className="text-lg font-bold">${emp.epfBalance?.toLocaleString() || 0}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">ETF Balance</Label>
                                      <p className="text-lg font-bold">${emp.etfBalance?.toLocaleString() || 0}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Monthly Contributions</Label>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                      <div className="text-center p-2 bg-muted rounded">
                                        <p className="font-medium">EPF (Employee)</p>
                                        <p>${emp.monthlyEpfEmployee?.toLocaleString() || 0}</p>
                                      </div>
                                      <div className="text-center p-2 bg-muted rounded">
                                        <p className="font-medium">EPF (Employer)</p>
                                        <p>${emp.monthlyEpfEmployer?.toLocaleString() || 0}</p>
                                      </div>
                                      <div className="text-center p-2 bg-muted rounded">
                                        <p className="font-medium">ETF</p>
                                        <p>${emp.monthlyEtf?.toLocaleString() || 0}</p>
                                      </div>
                                    </div>
                                  </div>
                                </>
                            ) : null
                          })()}
                        </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contribution Calculator</CardTitle>
                    <CardDescription>Calculate EPF and ETF contributions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary">Monthly Salary ($)</Label>
                      <Input
                          id="salary"
                          type="number"
                          placeholder="Enter monthly salary"
                          value={salaryInput}
                          onChange={(e) => setSalaryInput(e.target.value)}
                          disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">EPF Employee (8%):</span>
                        <span className="font-medium">
                        ${calculationResult?.epfEmployee?.toLocaleString() || 0}
                      </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">EPF Employer (8%):</span>
                        <span className="font-medium">
                        ${calculationResult?.epfEmployer?.toLocaleString() || 0}
                      </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">ETF Employer (2.5%):</span>
                        <span className="font-medium">
                        ${calculationResult?.etf?.toLocaleString() || 0}
                      </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total Monthly Contribution:</span>
                          <span>
                          ${(calculationResult ?
                              calculationResult.epfEmployee +
                              calculationResult.epfEmployer +
                              calculationResult.etf : 0).toLocaleString()}
                        </span>
                        </div>
                      </div>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleCalculate}
                        disabled={isLoading || !salaryInput}
                    >
                      Calculate Contributions
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contributions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Contributions</CardTitle>
                  <CardDescription>Track and manage monthly EPF and ETF contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <Select
                        value={contributionMonth}
                        onValueChange={setContributionMonth}
                        disabled={isLoading}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-01">January 2024</SelectItem>
                        <SelectItem value="2024-02">February 2024</SelectItem>
                        <SelectItem value="2024-03">March 2024</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                        onClick={handleProcessContributions}
                        disabled={isLoading || !contributionMonth}
                    >
                      Process Contributions
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>EPF (Employee)</TableHead>
                        <TableHead>EPF (Employer)</TableHead>
                        <TableHead>ETF</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contributions.map((contribution) => (
                          <TableRow key={contribution.id}>
                            <TableCell>{contribution.employeeId}</TableCell>
                            <TableCell>{contribution.name}</TableCell>
                            <TableCell>{contribution.month}</TableCell>
                            <TableCell>${contribution.epfEmployee?.toLocaleString() || 0}</TableCell>
                            <TableCell>${contribution.epfEmployer?.toLocaleString() || 0}</TableCell>
                            <TableCell>${contribution.etf?.toLocaleString() || 0}</TableCell>
                            <TableCell>
                              ${((contribution.epfEmployee || 0) +
                                (contribution.epfEmployer || 0) +
                                (contribution.etf || 0)).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={contribution.status === "Paid" ? "default" : "secondary"}>
                                {contribution.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Generate EPF Report</CardTitle>
                    <CardDescription>Generate detailed EPF contribution reports</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Report Period</Label>
                      <Select disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleGenerateEpfReport}
                        disabled={isLoading}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate EPF Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Generate ETF Report</CardTitle>
                    <CardDescription>Generate detailed ETF contribution reports</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Report Period</Label>
                      <Select disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleGenerateEtfReport}
                        disabled={isLoading}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate ETF Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
  )
}