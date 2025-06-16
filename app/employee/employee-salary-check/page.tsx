'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Clock,
  Award,
  Target,
  Users,
  AlertCircle,
  AlertTriangle
} from "lucide-react"
import { useUser } from "@/context/user-context"
import { useEffect, useState } from "react"
import { getCurrentSalary, getLatestPayslip, getSalaryHistory, getYearToDateSummary } from "@/app/employee/employee-salary-check/salaryBackend"
import { Skeleton } from "@/components/ui/skeleton"
import ProtectedRoute from "@/components/protectedRoute"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

const navigation = [
  { name: "Dashboard", href: "/employee/dashboard", icon: Clock },
  { name: "Attendance Marking", href: "/employee/attendance-marking", icon: Clock },
  { name: "Leave Application", href: "/employee/leave-application", icon: Calendar },
  { name: "Loan Application", href: "/employee/loan-application", icon: DollarSign },
  { name: "Salary Check", href: "/employee/salary-check", icon: DollarSign },
  { name: "Bonus Check", href: "/employee/bonus-check", icon: TrendingUp },
  { name: "OT Check", href: "/employee/ot-check", icon: Clock },
  { name: "EPF/ETF Check", href: "/employee/epf-etf-check", icon: FileText },
  { name: "Increment Check", href: "/employee/increment-check", icon: TrendingUp },
  { name: "Promotion Check", href: "/employee/promotion-check", icon: Award },
  { name: "Task Check", href: "/employee/task-check", icon: Target },
  { name: "Training Check", href: "/employee/training-check", icon: Users },
  { name: "Meeting Check", href: "/employee/meeting-check", icon: Users },
  { name: "No Pay Check", href: "/employee/no-pay-check", icon: AlertCircle },
  { name: "View Reports", href: "/employee/view-reports", icon: FileText },
];

export default function EmployeeSalaryCheck() {
  const { user } = useUser();
  const [currentSalary, setCurrentSalary] = useState<any>(null);
  const [latestPayslip, setLatestPayslip] = useState<any>(null);
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [yearToDateSummary, setYearToDateSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [salary, payslip, history, ytd] = await Promise.all([
            getCurrentSalary(user.id),
            getLatestPayslip(user.id),
            getSalaryHistory(user.id),
            getYearToDateSummary(user.id)
          ]);

          setCurrentSalary(salary);
          setLatestPayslip(payslip);
          //@ts-ignore
          setSalaryHistory(history);
          setYearToDateSummary(ytd);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch salary data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonthYear = (monthString: string) => {
    const [year, month] = monthString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />

          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>

          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
  );

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading salary data</h2>
            <p className="text-gray-600">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
  );

  const totalAllowances = latestPayslip?.allowances
      ? Object.values(latestPayslip.allowances).reduce((sum: number, val: any) => sum + val, 0)
      : 0;

  const totalDeductions = latestPayslip?.deductions
      ? Object.values(latestPayslip.deductions).reduce((sum: number, val: any) => sum + val, 0)
      : 0;

  return (
      <ProtectedRoute allowedRoles={['employee']}>
        <DashboardLayout navigation={navigation} userRole="employee" userName={user?.name || 'Employee'}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Salary Information</h1>
                <p className="text-muted-foreground">View your salary details and payment history</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Annual Salary</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${currentSalary?.annual?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    Effective {currentSalary?.effectiveDate ? formatDate(currentSalary.effectiveDate) : 'N/A'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${currentSalary?.monthly?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">Basic monthly pay</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Net Pay</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${latestPayslip?.netSalary?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">{latestPayslip?.month || 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">YTD Earnings</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${yearToDateSummary?.totalNet?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">Year to date</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Latest Payslip</CardTitle>
                  <CardDescription>{latestPayslip?.month || 'Current'} salary breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Earnings</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Basic Salary:</span>
                        <span>${latestPayslip?.basicSalary?.toLocaleString() || '0'}</span>
                      </div>
                      {latestPayslip?.allowances && Object.entries(latestPayslip.allowances).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key} Allowance:</span>
                            <span>${(value as number).toLocaleString()}</span>
                          </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Gross Salary:</span>
                      <span>${latestPayslip?.grossSalary?.toLocaleString() || '0'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Deductions</h4>
                    <div className="space-y-1 text-sm">
                      {latestPayslip?.deductions && Object.entries(latestPayslip.deductions).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key}:</span>
                            <span>${(value as number).toLocaleString()}</span>
                          </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Deductions:</span>
                      <span>${totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/10 rounded">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Net Salary:</span>
                      <span>${latestPayslip?.netSalary?.toLocaleString() || '0'}</span>
                    </div>
                  </div>

                  <Button className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Payslip
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Year-to-Date Summary</CardTitle>
                  <CardDescription>Your earnings summary for {new Date().getFullYear()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-green-50 rounded">
                      <span className="font-medium">Total Gross Earnings:</span>
                      <span className="font-bold">${yearToDateSummary?.totalGross?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-red-50 rounded">
                      <span className="font-medium">Total Deductions:</span>
                      <span className="font-bold">${yearToDateSummary?.totalDeductions?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-blue-50 rounded">
                      <span className="font-medium">Total Net Earnings:</span>
                      <span className="font-bold">${yearToDateSummary?.totalNet?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded">
                      <span className="font-medium">Average Monthly:</span>
                      <span className="font-bold">${yearToDateSummary?.averageMonthly?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Salary History</CardTitle>
                <CardDescription>Your monthly salary payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Gross Salary</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryHistory.map((salary) => (
                        <TableRow key={salary.salaryId}>
                          <TableCell>{salary.month ? formatMonthYear(salary.month) : 'N/A'}</TableCell>
                          <TableCell>${salary.basicSalary?.toLocaleString() || '0'}</TableCell>
                          <TableCell>${salary.allowances?.toLocaleString() || '0'}</TableCell>
                          <TableCell>${salary.deductions?.toLocaleString() || '0'}</TableCell>
                          <TableCell>${salary.grossSalary?.toLocaleString() || '0'}</TableCell>
                          <TableCell className="font-medium">${salary.netSalary?.toLocaleString() || '0'}</TableCell>
                          <TableCell>
                            <Badge variant="default">{salary.status || 'Paid'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              View Payslip
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Salary Information</CardTitle>
                <CardDescription>Important details about your compensation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Salary Structure</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Annual Salary:</span>
                        <span>${currentSalary?.annual?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Salary:</span>
                        <span>${currentSalary?.monthly?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hourly Rate:</span>
                        <span>${currentSalary?.hourly?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pay Frequency:</span>
                        <span>Monthly</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Benefits & Allowances</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Transport Allowance: $200/month</li>
                      <li>• Meal Allowance: $150/month</li>
                      <li>• Medical Allowance: $100/month</li>
                      <li>• Overtime Pay: 1.5x regular rate</li>
                      <li>• Annual Bonus: Performance based</li>
                      <li>• EPF Contribution: 8% (matched by employer)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}