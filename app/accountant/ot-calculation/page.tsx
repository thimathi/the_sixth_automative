"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, Calculator, DollarSign, Calendar } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useUser } from "@/context/user-context"
import {
  fetchEmployees,
  fetchOTRecords,
  calculateOTPayment,
  submitOTRequest,
  approveOTRequest,
  type Employee,
  type OTRecord,
  type OTCalculation
} from "@/app/accountant/ot-calculation/otBackend"

export default function OTCalculation() {
  const { user } = useUser()
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [otHours, setOtHours] = useState("")
  const [otDate, setOtDate] = useState("")
  const [otType, setOtType] = useState("regular")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [otRecords, setOtRecords] = useState<OTRecord[]>([])
  const [calculationResult, setCalculationResult] = useState<OTCalculation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [employeesData, recordsData] = await Promise.all([
          fetchEmployees(),
          fetchOTRecords()
        ])
        setEmployees(employeesData)
        setOtRecords(recordsData)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleCalculateOT = async () => {
    if (!selectedEmployee || !otHours) return

    setIsLoading(true)
    try {
      const employee = employees.find(emp => emp.id === selectedEmployee)
      if (!employee) return

      const result = await calculateOTPayment(
          employee.id,
          parseFloat(otHours),
          otType,
          employee.hourlyRate
      )
      setCalculationResult(result)
    } catch (error) {
      console.error("Error calculating OT:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitOT = async () => {
    if (!selectedEmployee || !otHours || !otDate || !calculationResult) return

    setIsLoading(true)
    try {
      const success = await submitOTRequest(
          selectedEmployee,
          parseFloat(otHours),
          calculationResult.rate,
          calculationResult.amount,
          otDate,
          otType,
          "Pending"
      )

      if (success) {
        const updatedRecords = await fetchOTRecords()
        setOtRecords(updatedRecords)
        setSelectedEmployee("")
        setOtHours("")
        setOtDate("")
        setOtType("regular")
        setCalculationResult(null)
        alert("OT request submitted successfully!")
      } else {
        alert("Failed to submit OT request")
      }
    } catch (error) {
      console.error("Error submitting OT request:", error)
      alert("An error occurred while submitting OT request")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveOT = async (otId: string) => {
    setIsLoading(true)
    try {
      const success = await approveOTRequest(otId)
      if (success) {
        const updatedRecords = await fetchOTRecords()
        setOtRecords(updatedRecords)
        alert("OT request approved successfully!")
      } else {
        alert("Failed to approve OT request")
      }
    } catch (error) {
      console.error("Error approving OT request:", error)
      alert("An error occurred while approving OT request")
    } finally {
      setIsLoading(false)
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/accountant/dashboard", icon: DollarSign },
    { name: "Salary Calculation", href: "/accountant/salary-calculation", icon: DollarSign },
    { name: "Bonus Calculation", href: "/accountant/bonus-calculation", icon: DollarSign },
    { name: "OT Calculation", href: "/accountant/ot-calculation", icon: Clock },
    { name: "EPF/ETF Management", href: "/accountant/epf-etf-management", icon: DollarSign },
    { name: "Increment Management", href: "/accountant/increment-management", icon: DollarSign },
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
              <h1 className="text-3xl font-bold">Overtime Calculation</h1>
              <p className="text-muted-foreground">Calculate and manage employee overtime payments</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total OT Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {otRecords.reduce((sum, record) => sum + (record.otHours || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">OT Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${otRecords.reduce((sum, record) => sum + (record.amount || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average OT Rate</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${otRecords.length > 0
                    ? (otRecords.reduce((sum, record) => sum + (record.rate || 0), 0) / otRecords.length).toFixed(2)
                    : "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">Per hour</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {otRecords.filter(record => record.status === "Pending").length}
                </div>
                <p className="text-xs text-muted-foreground">OT records</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculate Overtime
                </CardTitle>
                <CardDescription>Calculate overtime payment for employees</CardDescription>
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
                  <Label htmlFor="otDate">OT Date</Label>
                  <Input
                      id="otDate"
                      type="date"
                      value={otDate}
                      onChange={(e) => setOtDate(e.target.value)}
                      disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otType">OT Type</Label>
                  <Select
                      value={otType}
                      onValueChange={setOtType}
                      disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select OT type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular OT (1.5x)</SelectItem>
                      <SelectItem value="weekend">Weekend OT (2.0x)</SelectItem>
                      <SelectItem value="holiday">Holiday OT (2.5x)</SelectItem>
                      <SelectItem value="night">Night Shift OT (1.75x)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">Overtime Hours</Label>
                  <Input
                      id="hours"
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="12"
                      value={otHours}
                      onChange={(e) => setOtHours(e.target.value)}
                      placeholder="Enter OT hours"
                      disabled={isLoading}
                  />
                </div>

                <Button
                    onClick={handleCalculateOT}
                    className="w-full"
                    disabled={isLoading || !selectedEmployee || !otHours}
                >
                  Calculate OT
                </Button>

                {calculationResult && (
                    <div className="p-4 bg-muted rounded space-y-2">
                      <div className="flex justify-between">
                        <span>OT Hours:</span>
                        <span>{calculationResult.hours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>OT Rate:</span>
                        <span>${calculationResult.rate.toFixed(2)}/hour</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total OT Amount:</span>
                        <span>${calculationResult.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Multiplier:</span>
                        <span>
                      {otType === 'regular' ? '1.5x' :
                          otType === 'weekend' ? '2.0x' :
                              otType === 'holiday' ? '2.5x' : '1.75x'}
                    </span>
                      </div>
                    </div>
                )}

                <Button
                    onClick={handleSubmitOT}
                    className="w-full"
                    disabled={isLoading || !calculationResult || !otDate}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Submit OT Request
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee OT Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEmployee && (
                    <div className="space-y-3">
                      {(() => {
                        const emp = employees.find((e) => e.id === selectedEmployee)
                        return emp ? (
                            <>
                              <div className="flex justify-between">
                                <span className="font-medium">Employee ID:</span>
                                <span>{emp.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Name:</span>
                                <span>{emp.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Department:</span>
                                <span>{emp.department}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Hourly Rate:</span>
                                <span>${emp.hourlyRate.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Regular Hours:</span>
                                <span>{emp.regularHours}/week</span>
                              </div>
                              {calculationResult && (
                                  <div className="pt-2 border-t">
                                    <div className="flex justify-between">
                                      <span className="font-medium">Calculated OT Rate:</span>
                                      <span>${calculationResult.rate.toFixed(2)}</span>
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

          <Card>
            <CardHeader>
              <CardTitle>Overtime Records</CardTitle>
              <CardDescription>Recent overtime calculations and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>OT Hours</TableHead>
                    <TableHead>OT Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.employeeId}</TableCell>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.otHours}</TableCell>
                        <TableCell>${record.rate.toFixed(2)}</TableCell>
                        <TableCell>${record.amount.toFixed(2)}</TableCell>
                        <TableCell className="capitalize">
                          {record.type === 'regular' ? 'Regular' :
                              record.type === 'weekend' ? 'Weekend' :
                                  record.type === 'holiday' ? 'Holiday' : 'Night'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={record.status === "Approved" ? "default" : "secondary"}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.status === "Pending" && (
                              <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveOT(record.id)}
                                  disabled={isLoading}
                              >
                                Approve
                              </Button>
                          )}
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