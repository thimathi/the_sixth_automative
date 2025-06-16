'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {TrendingUp, Calendar, DollarSign, Award, Clock, FileText, Target, Users, AlertCircle} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/context/user-context"
import { useEffect, useState } from "react"
import { getIncrementDetails, getIncrementHistory } from "@/app/employee/employee-increment-check/incrementBackend"
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

export default function EmployeeIncrementCheck() {
  const { user } = useUser();
  const [incrementDetails, setIncrementDetails] = useState<any>(null);
  const [incrementHistory, setIncrementHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [details, history] = await Promise.all([
            getIncrementDetails(user.id),
            getIncrementHistory(user.id)
          ]);

          setIncrementDetails(details);
          //@ts-ignore
          setIncrementHistory(history);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch increment data');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading increment data</h2>
            <p className="text-gray-600">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
  );

  const currentSalary = incrementDetails?.currentSalary || 0;
  const lastIncrement = incrementDetails?.lastIncrement || {
    date: "N/A",
    amount: 0,
    percentage: 0,
    type: "N/A",
  };

  const nextReviewDate = incrementDetails?.nextReviewDate || "N/A";
  const monthsToNextReview = incrementDetails?.monthsToNextReview || 0;
  const reviewProgress = incrementDetails?.reviewProgress || 0;

  const totalIncrements = incrementHistory.reduce((sum, inc) => sum + inc.amount, 0);
  const averageIncrement = incrementHistory.length > 0 ? totalIncrements / incrementHistory.length : 0;

  return (
      <ProtectedRoute allowedRoles={['employee']}>
        <DashboardLayout navigation={navigation} userRole="employee" userName={user?.name || 'Employee'}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Salary Increment Information</h1>
                <p className="text-muted-foreground">View your salary increment history and upcoming reviews</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Salary</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(currentSalary)}</div>
                  <p className="text-xs text-muted-foreground">Annual salary</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Increment</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(lastIncrement.amount)}</div>
                  <p className="text-xs text-muted-foreground">{lastIncrement.percentage}% increase</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Increments</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalIncrements)}</div>
                  <p className="text-xs text-muted-foreground">Since joining</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Review</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthsToNextReview}</div>
                  <p className="text-xs text-muted-foreground">Months remaining</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Next Review Progress</CardTitle>
                  <CardDescription>Progress towards your next salary review</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to Next Review</span>
                      <span>{reviewProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={reviewProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Last Review: {formatDate(lastIncrement.date)}</span>
                      <span>Next Review: {formatDate(nextReviewDate)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded space-y-2">
                    <h4 className="font-medium">Review Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Review Type:</span>
                        <span>Annual Performance Review</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Date:</span>
                        <span>{formatDate(nextReviewDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Increment:</span>
                        <span>{formatCurrency(averageIncrement)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Salary Growth Chart</CardTitle>
                  <CardDescription>Your salary progression over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incrementHistory.map((increment) => (
                        <div key={increment.id} className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium">{formatDate(increment.date)}</p>
                              <Badge variant="outline">{increment.type}</Badge>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(increment.previousSalary)} → {formatCurrency(increment.newSalary)}
                              </p>
                              <p className="text-sm font-bold text-green-600">+{increment.percentage}%</p>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Increment History</CardTitle>
                <CardDescription>Detailed history of your salary increments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Previous Salary</TableHead>
                      <TableHead>New Salary</TableHead>
                      <TableHead>Increment</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incrementHistory.map((increment) => (
                        <TableRow key={increment.id}>
                          <TableCell>{formatDate(increment.date)}</TableCell>
                          <TableCell>{formatCurrency(increment.previousSalary)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(increment.newSalary)}</TableCell>
                          <TableCell className="text-green-600 font-medium">+{formatCurrency(increment.amount)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">+{increment.percentage}%</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{increment.type}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{increment.reason}</TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Tips</CardTitle>
                <CardDescription>Tips to improve your chances for the next increment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Performance Areas</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Maintain excellent attendance record</li>
                      <li>• Complete assigned tasks on time</li>
                      <li>• Participate in training programs</li>
                      <li>• Demonstrate leadership qualities</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Skill Development</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Obtain relevant certifications</li>
                      <li>• Learn new automotive technologies</li>
                      <li>• Improve customer service skills</li>
                      <li>• Mentor junior technicians</li>
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