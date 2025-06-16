"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { TrendingUp, Calendar, DollarSign, Users } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useUser } from "@/context/user-context"
import {
  fetchEmployees,
  fetchIncrementHistory,
  fetchPendingIncrements,
  calculateIncrement,
  processIncrement,
  approveIncrement,
  type Employee,
  type IncrementHistory,
  type PendingIncrement,
  type IncrementCalculation
} from "@/app/accountant/increment-management/incrementBackend"

export default function IncrementManagement() {
  const { user } = useUser()
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [incrementType, setIncrementType] = useState("")
  const [incrementAmount, setIncrementAmount] = useState("")
  const [effectiveDate, setEffectiveDate] = useState("")
  const [remarks, setRemarks] = useState("")
  const [calculationResult, setCalculationResult] = useState<IncrementCalculation | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [incrementHistory, setIncrementHistory] = useState<IncrementHistory[]>([])
  const [pendingIncrements, setPendingIncrements] = useState<PendingIncrement[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [employeesData, historyData, pendingData] = await Promise.all([
          fetchEmployees(),
          fetchIncrementHistory(),
          fetchPendingIncrements()
        ])
        setEmployees(employeesData)
        setIncrementHistory(historyData)
        setPendingIncrements(pendingData)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleCalculateIncrement = async () => {
    if (!selectedEmployee || !incrementType) return

    setIsLoading(true)
    try {
      const employee = employees.find(emp => emp.id === selectedEmployee)
      if (!employee) return

      const result = await calculateIncrement(
          employee.id,
          incrementType,
          employee.currentSalary,
          employee.performance,
          employee.tenure
      )
      setIncrementAmount(result.amount.toString())
      setCalculationResult(result)
    } catch (error) {
      console.error("Error calculating increment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessIncrement = async () => {
    if (!selectedEmployee || !incrementType || !incrementAmount || !effectiveDate || !calculationResult) return

    setIsLoading(true)
    try {
      const employee = employees.find(emp => emp.id === selectedEmployee)
      if (!employee) return

      const success = await processIncrement(
          employee.id,
          incrementType,
          employee.currentSalary,
          parseFloat(incrementAmount),
          effectiveDate,
          remarks,
          {
            type: calculationResult.type,
            performanceFactor: calculationResult.performanceFactor || 0,
            marketAdjustment: calculationResult.marketAdjustment || 0,
            tenureFactor: calculationResult.tenureFactor || 0
          }
      )

      if (success) {
        const [historyData, pendingData] = await Promise.all([
          fetchIncrementHistory(),
          fetchPendingIncrements()
        ])
        setIncrementHistory(historyData)
        setPendingIncrements(pendingData)

        // Reset form
        setSelectedEmployee("")
        setIncrementType("")
        setIncrementAmount("")
        setEffectiveDate("")
        setRemarks("")
        setCalculationResult(null)

        alert("Increment processed successfully!")
      } else {
        alert("Failed to process increment")
      }
    } catch (error) {
      console.error("Error processing increment:", error)
      alert("An error occurred while processing increment")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveIncrement = async (incrementId: string) => {
    setIsLoading(true)
    try {
      const success = await approveIncrement(incrementId)
      if (success) {
        const pendingData = await fetchPendingIncrements()
        setPendingIncrements(pendingData)
        alert("Increment approved successfully!")
      } else {
        alert("Failed to approve increment")
      }
    } catch (error) {
      console.error("Error approving increment:", error)
      alert("An error occurred while approving increment")
    } finally {
      setIsLoading(false)
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/accountant/dashboard", icon: DollarSign },
    { name: "Salary Calculation", href: "/accountant/salary-calculation", icon: DollarSign },
    { name: "Bonus Calculation", href: "/accountant/bonus-calculation", icon: TrendingUp },
    { name: "OT Calculation", href: "/accountant/ot-calculation", icon: DollarSign },
    { name: "EPF/ETF Management", href: "/accountant/epf-etf-management", icon: DollarSign },
    { name: "Increment Management", href: "/accountant/increment-management", icon: TrendingUp },
    { name: "Loan Eligibility Check", href: "/accountant/check-loan-eligibility", icon: DollarSign },
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
              <h1 className="text-3xl font-bold">Increment Management</h1>
              <p className="text-muted-foreground">Manage salary increments and adjustments</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Increments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${incrementHistory.reduce((sum, inc) => sum + (inc.amount || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">This year</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees Incremented</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{incrementHistory.length}</div>
                <p className="text-xs text-muted-foreground">Out of {employees.length} employees</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Increment</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {incrementHistory.length > 0
                      ? (incrementHistory.reduce((sum, inc) => sum + (inc.percentage || 0), 0) / incrementHistory.length).toFixed(1) + "%"
                      : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">This year</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingIncrements.length}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Process Increment</CardTitle>
                <CardDescription>Calculate and process salary increments</CardDescription>
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
                  <Label htmlFor="incrementType">Increment Type</Label>
                  <Select
                      value={incrementType}
                      onValueChange={setIncrementType}
                      disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select increment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Increment</SelectItem>
                      <SelectItem value="performance">Performance Based</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="market">Market Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Increment Amount ($)</Label>
                  <Input
                      id="amount"
                      type="number"
                      value={incrementAmount}
                      onChange={(e) => setIncrementAmount(e.target.value)}
                      placeholder="0.00"
                      disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input
                      id="effectiveDate"
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                      id="remarks"
                      placeholder="Add any remarks or justification"
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      disabled={isLoading}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                      onClick={handleCalculateIncrement}
                      variant="outline"
                      className="flex-1"
                      disabled={isLoading || !selectedEmployee || !incrementType}
                  >
                    Calculate Suggested
                  </Button>
                  <Button
                      onClick={handleProcessIncrement}
                      className="flex-1"
                      disabled={isLoading || !selectedEmployee || !incrementType || !incrementAmount || !effectiveDate}
                  >
                    Process Increment
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEmployee && (
                    <div className="space-y-4">
                      {(() => {
                        const emp = employees.find((e) => e.id === selectedEmployee)
                        return emp ? (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Current Salary</Label>
                                  <p className="text-lg font-bold">${emp.currentSalary.toLocaleString()}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Performance</Label>
                                  <Badge variant={emp.performance === "Excellent" ? "default" : "secondary"}>
                                    {emp.performance}
                                  </Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Tenure (months)</Label>
                                  <p className="text-sm">{emp.tenure}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Last Increment</Label>
                                  <p className="text-sm">{emp.lastIncrement}</p>
                                </div>
                              </div>
                              {calculationResult && (
                                  <div className="p-4 bg-muted rounded space-y-2">
                                    <div className="flex justify-between">
                                      <span>Current Salary:</span>
                                      <span>${emp.currentSalary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Increment Amount:</span>
                                      <span>+${calculationResult.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold border-t pt-2">
                                      <span>New Salary:</span>
                                      <span>${calculationResult.newSalary.toLocaleString()}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                      <div className="flex justify-between">
                                        <span>Percentage Increase:</span>
                                        <span>{calculationResult.percentage}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Increment Type:</span>
                                        <span className="capitalize">{calculationResult.type}</span>
                                      </div>
                                      {calculationResult.performanceFactor && calculationResult.type === 'performance' && (
                                          <div className="flex justify-between">
                                            <span>Performance Factor:</span>
                                            <span>{calculationResult.performanceFactor}%</span>
                                          </div>
                                      )}
                                      {calculationResult.marketAdjustment && (
                                          <div className="flex justify-between">
                                            <span>Market Adjustment:</span>
                                            <span>{calculationResult.marketAdjustment}%</span>
                                          </div>
                                      )}
                                      {calculationResult.tenureFactor && calculationResult.type === 'annual' && (
                                          <div className="flex justify-between">
                                            <span>Tenure Factor:</span>
                                            <span>{calculationResult.tenureFactor}%</span>
                                          </div>
                                      )}
                                    </div>
                                  </div>
                              )}
                            </>
                        ) : null
                      })()}
                    </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Increment History</CardTitle>
                <CardDescription>Recent salary increments processed</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incrementHistory.map((increment) => (
                        <TableRow key={increment.id}>
                          <TableCell>{increment.name}</TableCell>
                          <TableCell className="capitalize">{increment.type}</TableCell>
                          <TableCell>${increment.amount.toLocaleString()}</TableCell>
                          <TableCell>{increment.percentage.toFixed(1)}%</TableCell>
                          <TableCell>
                            <Badge variant="default">{increment.status}</Badge>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Increments</CardTitle>
                <CardDescription>Increments awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingIncrements.map((increment) => (
                        <TableRow key={increment.id}>
                          <TableCell>{increment.name}</TableCell>
                          <TableCell className="capitalize">{increment.type}</TableCell>
                          <TableCell>${increment.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{increment.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveIncrement(increment.id)}
                                disabled={isLoading}
                            >
                              Approve
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
  )
}