"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, DollarSign, FileText, Users } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useUser } from "@/context/user-context"
import {
  fetchEmployees,
  fetchPayrollHistory,
  calculateSalary,
  processPayroll,
  generatePayslip,
  type Employee,
  type Payroll,
  type SalaryCalculation
} from "@/app/accountant/salary-calculation/salaryBackend"

export default function SalaryCalculation() {
  const { user } = useUser()
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [payrollMonth, setPayrollMonth] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrollHistory, setPayrollHistory] = useState<Payroll[]>([])
  const [salaryCalculation, setSalaryCalculation] = useState<SalaryCalculation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [employeesData, payrollData] = await Promise.all([
          fetchEmployees(),
          fetchPayrollHistory()
        ])
        setEmployees(employeesData)
        setPayrollHistory(payrollData)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find(emp => emp.id === selectedEmployee)
      if (employee) {
        const calculation = calculateSalary(employee)
        setSalaryCalculation(calculation)
      }
    }
  }, [selectedEmployee, employees])

  const handleProcessPayroll = async () => {
    if (!selectedEmployee || !payrollMonth || !salaryCalculation) return

    setIsLoading(true)
    try {
      const success = await processPayroll(
          selectedEmployee,
          payrollMonth,
          parseFloat(salaryCalculation.grossSalary),
          parseFloat(salaryCalculation.totalDeductions),
          parseFloat(salaryCalculation.netSalary)
      )

      if (success) {
        const updatedPayroll = await fetchPayrollHistory()
        setPayrollHistory(updatedPayroll)
        alert("Payroll processed successfully!")
      } else {
        alert("Failed to process payroll")
      }
    } catch (error) {
      console.error("Error processing payroll:", error)
      alert("An error occurred while processing payroll")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePayslip = async () => {
    if (!selectedEmployee || !payrollMonth) return

    setIsLoading(true)
    try {
      const success = await generatePayslip(selectedEmployee, payrollMonth)
      if (success) {
        alert("Payslip generated successfully!")
      } else {
        alert("Failed to generate payslip")
      }
    } catch (error) {
      console.error("Error generating payslip:", error)
      alert("An error occurred while generating payslip")
    } finally {
      setIsLoading(false)
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/accountant/dashboard", icon: DollarSign },
    { name: "Salary Calculation", href: "/accountant/salary-calculation", icon: DollarSign },
    { name: "Bonus Calculation", href: "/accountant/bonus-calculation", icon: DollarSign },
    { name: "OT Calculation", href: "/accountant/ot-calculation", icon: DollarSign },
    { name: "EPF/ETF Management", href: "/accountant/epf-etf-management", icon: DollarSign },
    { name: "Increment Management", href: "/accountant/increment-management", icon: DollarSign },
    { name: "Loan Eligibility Check", href: "/accountant/check-loan-eligibility", icon: DollarSign },
  ]

  const selectedEmp = employees.find((emp) => emp.id === selectedEmployee)

  return (
      <DashboardLayout
          navigation={navigation}
          userRole={user?.role || "accountant"}
          userName={user?.name || "Accountant"}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Salary Calculation</h1>
              <p className="text-muted-foreground">Calculate monthly salaries and generate payroll</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${payrollHistory.reduce((sum, payroll) => sum + (payroll.netSalary || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees Paid</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payrollHistory.length}</div>
                <p className="text-xs text-muted-foreground">Out of {employees.length} employees</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${payrollHistory.length > 0
                    ? (payrollHistory.reduce((sum, payroll) => sum + (payroll.netSalary || 0), 0) / payrollHistory.length).toFixed(2)
                    : "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">Per employee</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payroll</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payrollHistory.filter(p => p.status === "Pending").length}
                </div>
                <p className="text-xs text-muted-foreground">All processed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Salary Calculator
                </CardTitle>
                <CardDescription>Calculate individual employee salary</CardDescription>
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
                  <Label htmlFor="month">Payroll Month</Label>
                  <Select
                      value={payrollMonth}
                      onValueChange={setPayrollMonth}
                      disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-01">January 2024</SelectItem>
                      <SelectItem value="2024-02">February 2024</SelectItem>
                      <SelectItem value="2024-03">March 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {salaryCalculation && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Earnings</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Basic Salary:</span>
                            <span>${salaryCalculation.monthlySalary}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Allowances:</span>
                            <span>${salaryCalculation.totalAllowances}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overtime:</span>
                            <span>${salaryCalculation.otAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bonus:</span>
                            <span>${salaryCalculation.bonus}</span>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Gross Salary:</span>
                          <span>${salaryCalculation.grossSalary}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Deductions</h4>
                        <div className="space-y-1 text-sm">
                          {selectedEmp &&
                              Object.entries(selectedEmp.deductions).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize">{key}:</span>
                                    <span>${value.toFixed(2)}</span>
                                  </div>
                              ))}
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total Deductions:</span>
                          <span>${salaryCalculation.totalDeductions}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-primary/10 rounded">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Net Salary:</span>
                          <span>${salaryCalculation.netSalary}</span>
                        </div>
                      </div>
                    </div>
                )}

                <div className="flex gap-2">
                  <Button
                      onClick={handleProcessPayroll}
                      className="w-full"
                      disabled={isLoading || !selectedEmployee || !payrollMonth}
                  >
                    Process Payroll
                  </Button>
                  <Button
                      onClick={handleGeneratePayslip}
                      className="w-full"
                      disabled={isLoading || !selectedEmployee || !payrollMonth}
                      variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Payslip
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allowances & Deductions</CardTitle>
                <CardDescription>Detailed breakdown of salary components</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedEmp && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Allowances</h4>
                        <div className="space-y-2">
                          {Object.entries(selectedEmp.allowances).map(([key, value]) => (
                              <div key={key} className="flex justify-between p-2 bg-green-50 rounded">
                                <span className="capitalize">{key}:</span>
                                <span className="font-medium">+${value.toFixed(2)}</span>
                              </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Deductions</h4>
                        <div className="space-y-2">
                          {Object.entries(selectedEmp.deductions).map(([key, value]) => (
                              <div key={key} className="flex justify-between p-2 bg-red-50 rounded">
                                <span className="capitalize">{key}:</span>
                                <span className="font-medium">-${value.toFixed(2)}</span>
                              </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Additional Earnings</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between p-2 bg-blue-50 rounded">
                            <span>Overtime ({selectedEmp.otHours}h):</span>
                            <span className="font-medium">+${(selectedEmp.otHours * selectedEmp.otRate).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-blue-50 rounded">
                            <span>Bonus:</span>
                            <span className="font-medium">+${selectedEmp.bonus.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>Recent salary payments and calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Button
                    onClick={() => employees.forEach(emp => handleProcessPayroll())}
                    disabled={isLoading}
                >
                  Process All Payroll
                </Button>
                <Button variant="outline" disabled={isLoading}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export Payroll Report
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollHistory.map((payroll) => (
                      <TableRow key={payroll.id}>
                        <TableCell>{payroll.employeeId}</TableCell>
                        <TableCell>{payroll.name}</TableCell>
                        <TableCell>{payroll.month}</TableCell>
                        <TableCell>${payroll.grossSalary.toFixed(2)}</TableCell>
                        <TableCell>${payroll.deductions.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">${payroll.netSalary.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={payroll.status === "Paid" ? "default" : "secondary"}>
                            {payroll.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGeneratePayslip()}
                              disabled={isLoading}
                          >
                            View Payslip
                          </Button>
                        </TableCell>
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