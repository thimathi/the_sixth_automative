'use client'

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, DollarSign, TrendingUp, CheckCircle, AlertCircle, FileText, Users, Target, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { getEmployeeDashboardData, getEmployeeDetails } from "@/app/employee/dashboard/employeeDashboardBackend";
import { useUser } from "@/context/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/protectedRoute";

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

export default function EmployeeDashboard() {
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [employeeDetails, setEmployeeDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [dashboardRes, detailsRes] = await Promise.all([
            getEmployeeDashboardData(user.id),
            getEmployeeDetails(user.id)
          ]);

          if (dashboardRes.error) throw new Error(dashboardRes.error);
          if (detailsRes.error) throw new Error(detailsRes.error);

          setDashboardData(dashboardRes);
          setEmployeeDetails(detailsRes.details);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'urgent': return 'destructive';
      case 'in-progress': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'urgent': return <AlertCircle className="h-4 w-4 mr-1" />;
      case 'in-progress': return <Clock className="h-4 w-4 mr-1" />;
      default: return <CheckCircle className="h-4 w-4 mr-1" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
            ))}
          </div>

          <Skeleton className="h-48" />
        </div>
      </DashboardLayout>
  );

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading dashboard</h2>
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
        <DashboardLayout
            navigation={navigation}
            userRole="employee"
            userName={employeeDetails?.fullName || 'Employee'}
        >
          <div className="space-y-6">
            {/* Header with employee stats */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's your overview for today.</p>
              </div>

              {employeeDetails && (
                  <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{employeeDetails.position}</p>
                      <p className="text-sm text-gray-600">
                        Department: {employeeDetails.department}
                      </p>
                      <p className="text-sm text-gray-600">
                        KPI: {employeeDetails.kpi.value} ({employeeDetails.kpi.rank})
                      </p>
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{employeeDetails.attendanceStats.presentDays} present</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>{employeeDetails.attendanceStats.absentDays} absent</span>
                      </div>
                    </div>
                  </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
                  {dashboardData?.todayStatus?.status === 'present' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                      dashboardData?.todayStatus?.status === 'present' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dashboardData?.todayStatus?.status || 'Not marked'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.todayStatus?.inTime ? `Checked in at ${formatTime(dashboardData.todayStatus.inTime)}` : 'Not checked in'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.leaveBalance?.annualLeave || 0} Days
                  </div>
                  <p className="text-xs text-muted-foreground">Annual leave remaining</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <Target className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.pendingTasksCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Tasks to complete</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month OT</CardTitle>
                  <Clock className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.monthlyOT?.totalHours || 0}h
                  </div>
                  <p className="text-xs text-muted-foreground">Overtime hours</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData?.recentActivities?.map((activity: any) => (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className={`${
                            activity.type === 'attendance' ? 'bg-green-100' :
                                activity.type === 'leave' ? 'bg-blue-100' :
                                    'bg-purple-100'
                        } p-2 rounded-full`}>
                          {activity.type === 'attendance' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : activity.type === 'leave' ? (
                              <FileText className="h-4 w-4 text-blue-600" />
                          ) : (
                              <Target className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(activity.date)}{activity.time ? ` at ${formatTime(activity.time)}` : ''}
                          </p>
                        </div>
                      </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Your schedule and important dates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData?.upcomingEvents?.map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(event.date)}{event.time ? ` at ${formatTime(event.time)}` : ''}
                          </p>
                        </div>
                        <Badge variant={getStatusVariant(event.status)}>
                          {event.type}
                        </Badge>
                      </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/employee/attendance-marking'}
                  >
                    <Clock className="h-6 w-6 mb-2" />
                    Mark Attendance
                  </Button>
                  <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/employee/leave-application'}
                  >
                    <Calendar className="h-6 w-6 mb-2" />
                    Apply Leave
                  </Button>
                  <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/employee/salary-check'}
                  >
                    <DollarSign className="h-6 w-6 mb-2" />
                    Check Salary
                  </Button>
                  <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/employee/view-reports'}
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}