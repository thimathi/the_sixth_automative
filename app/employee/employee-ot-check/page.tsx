'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
  Award,
  Users,
  Target,
  AlertCircle,
  AlertTriangle
} from "lucide-react"
import { useUser } from "@/context/user-context"
import { useEffect, useState } from "react"
import { getOTRecords, getOTStats, getOTRates } from "@/app/employee/employee-ot-check/otBackend"
import { Skeleton } from "@/components/ui/skeleton"
import ProtectedRoute from "@/components/protectedRoute"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {Button} from "react-day-picker";

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

export default function EmployeeOTCheck() {
  const { user } = useUser();
  const [otRecords, setOTRecords] = useState<any[]>([]);
  const [otStats, setOTStats] = useState<any>(null);
  const [otRates, setOTRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [records, stats, rates] = await Promise.all([
            getOTRecords(user.id),
            getOTStats(user.id),
            getOTRates()
          ]);
          //@ts-ignore
          setOTRecords(records);
          setOTStats(stats);
          setOTRates(rates);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch overtime data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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

  if (error) { // @ts-ignore
    return (
          <DashboardLayout navigation={navigation} userRole="employee" userName="Error">
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-2">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                <h2 className="text-xl font-bold">Error loading overtime data</h2>
                <p className="text-gray-600">{error}</p>
                <Button
                    //@ts-ignore
                    variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          </DashboardLayout>
      );
  }

  return (
      <ProtectedRoute allowedRoles={['employee']}>
        <DashboardLayout navigation={navigation} userRole="employee" userName={user?.name || 'Employee'}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Overtime Information</h1>
                <p className="text-muted-foreground">View your overtime hours and payments</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total OT Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{otStats?.totalOTHours || 0}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">OT Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${otStats?.totalOTAmount?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending OT</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{otStats?.pendingOTHours || 0}h</div>
                  <p className="text-xs text-muted-foreground">${otStats?.pendingOTAmount?.toFixed(2) || '0.00'} pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${otStats?.averageOTRate?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">Per hour</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Overtime Rates</CardTitle>
                  <CardDescription>Current overtime rate structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {otRates.map((rate, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{rate.type}</h4>
                            <p className="text-sm text-muted-foreground">{rate.description}</p>
                          </div>
                          <Badge variant="secondary">{rate.rate}</Badge>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Summary</CardTitle>
                  <CardDescription>Your overtime summary for this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Weekday OT:</span>
                      <span className="text-sm">{otStats?.weekdayHours || 0} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Weekend OT:</span>
                      <span className="text-sm">{otStats?.weekendHours || 0} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Holiday OT:</span>
                      <span className="text-sm">{otStats?.holidayHours || 0} hours</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Hours:</span>
                      <span className="font-bold">{otStats?.totalOTHours || 0} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Earnings:</span>
                      <span className="font-bold">${otStats?.totalOTAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Overtime Records</CardTitle>
                <CardDescription>Detailed history of your overtime work</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otRecords.map((record) => (
                        <TableRow key={record.otId}>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>{formatTime(record.startTime)}</TableCell>
                          <TableCell>{formatTime(record.endTime)}</TableCell>
                          <TableCell className="font-medium">{record.otHours}h</TableCell>
                          <TableCell>${record.rate?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell className="font-medium">${record.amount?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.type || 'Weekday'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.status === "Approved" ? "default" : "secondary"}>
                              {record.status || 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.approvedBy || 'Pending'}</TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overtime Guidelines</CardTitle>
                <CardDescription>Important information about overtime work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Overtime Rules</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Overtime must be pre-approved by supervisor</li>
                      <li>• Maximum 12 hours overtime per week</li>
                      <li>• Overtime records must be submitted within 3 days</li>
                      <li>• Holiday overtime requires special authorization</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Payment Information</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Overtime payments processed monthly</li>
                      <li>• Approved overtime included in next payroll</li>
                      <li>• Disputed overtime reviewed by HR</li>
                      <li>• Payment details available in payslip</li>
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