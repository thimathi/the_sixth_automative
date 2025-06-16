'use client'

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Target, Calendar, CreditCard, TrendingUp, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getManagerDashboardData, getManagerDetails } from "@/app/manager/dashboard/managerDashboardBackend";
import { useUser } from "@/context/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/protectedRoute";

const navigation = [
  { name: "Dashboard", href: "/manager/dashboard", icon: Users },
  { name: "Task Management", href: "/manager/task-management", icon: Target },
  { name: "Leave Management", href: "/manager/leave-management", icon: Calendar },
  { name: "Loan Management", href: "/manager/loan-management", icon: CreditCard },
  { name: "Performance Rating", href: "/manager/performance-rating", icon: TrendingUp },
  { name: "Report Generation", href: "/manager/report-generation", icon: FileText },
];

export default function ManagerDashboard() {
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [managerDetails, setManagerDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [dashboardRes, detailsRes] = await Promise.all([
            getManagerDashboardData(user.id),
            getManagerDetails(user.id)
          ]);

          if (dashboardRes.error) throw new Error(dashboardRes.error);
          if (detailsRes.error) throw new Error(detailsRes.error);

          setDashboardData(dashboardRes);
          setManagerDetails(detailsRes.details);
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

  if (loading) return (
      <DashboardLayout navigation={navigation} userRole="manager" userName="Loading...">
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
      <DashboardLayout navigation={navigation} userRole="manager" userName="Error">
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
      <ProtectedRoute allowedRoles={['manager']}>
        <DashboardLayout
            navigation={navigation}
            userRole="manager"
            userName={managerDetails?.fullName || 'Manager'}
        >
          <div className="space-y-6">
            {/* Header with manager stats */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                <p className="text-gray-600">Oversee team performance, tasks, and operational management.</p>
              </div>

              {managerDetails && (
                  <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{managerDetails.position}</p>
                      <p className="text-sm text-gray-600">
                        Team Size: {managerDetails.teamSize || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        KPI: {managerDetails.kpi.value} ({managerDetails.kpi.rank})
                      </p>
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{managerDetails.attendanceStats.presentDays} present</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>{managerDetails.attendanceStats.absentDays} absent</span>
                      </div>
                    </div>
                  </div>
              )}
            </div>

            {/* Management Overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.teamOverview?.teamMembers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Direct reports</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                  <Target className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.teamOverview?.activeTasks || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
                  <Calendar className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.teamOverview?.pendingLeaveRequests || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Pending approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.teamOverview?.teamPerformance || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Average rating</p>
                </CardContent>
              </Card>
            </div>

            {/* Management Activities */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Management Actions</CardTitle>
                  <CardDescription>Latest managerial activities and decisions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData?.recentActions?.map((action: any) => (
                      <div key={action.id} className="flex items-center space-x-4">
                        <div className={`${action.type === 'task' ? 'bg-green-100' : action.type === 'leave' ? 'bg-blue-100' : 'bg-purple-100'} p-2 rounded-full`}>
                          {action.type === 'task' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : action.type === 'leave' ? (
                              <Calendar className="h-4 w-4 text-blue-600" />
                          ) : (
                              <TrendingUp className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{action.title}</p>
                          <p className="text-xs text-gray-500">{action.description}</p>
                        </div>
                      </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Tasks</CardTitle>
                  <CardDescription>High-priority items requiring attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData?.priorityTasks?.map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.description}</p>
                        </div>
                        <Badge variant={getStatusVariant(task.status)}>
                          {getStatusIcon(task.status)}
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Team Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Overview</CardTitle>
                <CardDescription>Current team metrics and productivity indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {dashboardData?.performanceMetrics?.taskCompletionRate || 0}%
                    </div>
                    <p className="text-sm text-gray-600">Task Completion Rate</p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {dashboardData?.performanceMetrics?.averagePerformance || 0}/5
                    </div>
                    <p className="text-sm text-gray-600">Average Performance</p>
                    <p className="text-xs text-gray-500">Last quarter</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {dashboardData?.performanceMetrics?.avgResponseTime || 0}h
                    </div>
                    <p className="text-sm text-gray-600">Avg. Response Time</p>
                    <p className="text-xs text-gray-500">Customer service</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used management functions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/manager/task-assignment'}
                  >
                    <Target className="h-6 w-6 mb-2" />
                    Assign Task
                  </Button>
                  <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/manager/leave-management'}
                  >
                    <Calendar className="h-6 w-6 mb-2" />
                    Approve Leave
                  </Button>
                  <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/manager/performance-rating'}
                  >
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Rate Performance
                  </Button>
                  <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/manager/report-generation'}
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}