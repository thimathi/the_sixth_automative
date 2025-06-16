'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {AlertTriangle, Calendar, Clock, DollarSign, Award, TrendingUp, FileText, Target, Users, AlertCircle} from "lucide-react"
import { useUser } from "@/context/user-context"
import { useEffect, useState } from "react"
import { getNoPayRecords, getNoPayStats, getNoPayPolicies } from "@/app/employee/employee-no-pay-check/noPayBackend"
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

export default function EmployeeNoPayCheck() {
  const { user } = useUser();
  const [noPayRecords, setNoPayRecords] = useState<any[]>([]);
  const [noPayStats, setNoPayStats] = useState<any>(null);
  const [noPayPolicies, setNoPayPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [records, stats, policies] = await Promise.all([
            getNoPayRecords(user.id),
            getNoPayStats(user.id),
            getNoPayPolicies()
          ]);
          //@ts-ignore
          setNoPayRecords(records);
          setNoPayStats(stats);
          setNoPayPolicies(policies);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch no-pay data');
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

          <div className="grid gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </DashboardLayout>
  );

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading no-pay data</h2>
            <p className="text-gray-600">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
  );

  return (
      <ProtectedRoute allowedRoles={['employee']}>
        <DashboardLayout navigation={navigation} userRole="employee" userName={user?.name || 'Employee'}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">No Pay Information</h1>
                <p className="text-muted-foreground">View your no pay deductions and policy information</p>
              </div>
            </div>

            {noPayRecords.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You have no pay deductions on your record. Please review the details below and contact HR if you have any
                    questions.
                  </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${noPayStats?.totalDeductions?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">This year</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${noPayStats?.pendingDeductions?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">Under review</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{noPayStats?.totalIncidents || 0}</div>
                  <p className="text-xs text-muted-foreground">This year</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Incident</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {noPayRecords.length > 0 ? formatDate(noPayRecords[0].startDate) : "None"}
                  </div>
                  <p className="text-xs text-muted-foreground">Most recent</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>No Pay Records</CardTitle>
                <CardDescription>History of salary deductions and reasons</CardDescription>
              </CardHeader>
              <CardContent>
                {noPayRecords.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No deduction records found. Great job maintaining perfect attendance!
                      </p>
                    </div>
                ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Deduction Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Approved By</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {noPayRecords.map((record) => (
                            <TableRow key={record.noPayId}>
                              <TableCell>{formatDate(record.startDate)}</TableCell>
                              <TableCell className="font-medium">{record.reason || 'Unauthorized Absence'}</TableCell>
                              <TableCell>{record.noPayDays} days</TableCell>
                              <TableCell className="text-red-600 font-medium">
                                -${record.deductionAmount?.toFixed(2) || '0.00'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={record.status === "Processed" ? "destructive" : "secondary"}>
                                  {record.status || 'Under Review'}
                                </Badge>
                              </TableCell>
                              <TableCell>{record.approvedBy || 'Pending'}</TableCell>
                              <TableCell className="max-w-xs truncate">{record.notes || 'No notes available'}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>No Pay Policy</CardTitle>
                <CardDescription>Understanding salary deduction policies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {noPayPolicies.map((policy, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{policy.category}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{policy.description}</p>
                          </div>
                          <Badge variant="outline">{policy.deductionRate}</Badge>
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prevention Tips</CardTitle>
                <CardDescription>How to avoid no pay deductions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Attendance Best Practices</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Arrive at work on time consistently</li>
                      <li>• Request leave in advance when needed</li>
                      <li>• Notify supervisor immediately if running late</li>
                      <li>• Follow proper procedures for sick leave</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Time Management</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Respect break time limits</li>
                      <li>• Plan your schedule to avoid conflicts</li>
                      <li>• Use company time tracking systems</li>
                      <li>• Communicate with team about schedule changes</li>
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