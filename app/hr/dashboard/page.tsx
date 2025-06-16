'use client'

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Calendar, GraduationCap, TrendingUp, DollarSign, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getHRDashboardData, getHRDetails } from "@/app/hr/dashboard/hrDashboardBackend";
import { useUser } from "@/context/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/protectedRoute";

const navigation = [
  { name: "Dashboard", href: "/hr/dashboard", icon: Users },
  { name: "Employee Management", href: "/hr/employee-management", icon: Users },
  { name: "Employee Registration", href: "/hr/employee-registration", icon: UserPlus },
  { name: "Leave Arrangement", href: "/hr/leave-arrangement", icon: Calendar },
  { name: "Training Arrangement", href: "/hr/training-arrangement", icon: GraduationCap },
  { name: "KPI Generation", href: "/hr/kpi-generation", icon: TrendingUp },
  { name: "Add Salary", href: "/hr/add-salary", icon: DollarSign },
];

export default function HRDashboard() {
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [hrDetails, setHRDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [dashboardRes, detailsRes] = await Promise.all([
            getHRDashboardData(user.id),
            getHRDetails(user.id)
          ]);

          if (dashboardRes.error) throw new Error(dashboardRes.error);
          if (detailsRes.error) throw new Error(detailsRes.error);

          setDashboardData(dashboardRes);
          setHRDetails(detailsRes.details);
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
      <DashboardLayout navigation={navigation} userRole="hr" userName="Loading...">
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
      <DashboardLayout navigation={navigation} userRole="hr" userName="Error">
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
      <ProtectedRoute allowedRoles={['hr']}>
        <DashboardLayout
            navigation={navigation}
            userRole="hr"
            userName={hrDetails?.fullName || 'HR Manager'}
        >
          <div className="space-y-6">
            {/* Header with HR stats */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
                <p className="text-gray-600">Manage employees, training, and human resources operations.</p>
              </div>

              {hrDetails && (
                  <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{hrDetails.position}</p>
                      <p className="text-sm text-gray-600">
                        Department: {hrDetails.department}
                      </p>
                      <p className="text-sm text-gray-600">
                        Employees Managed: {hrDetails.employeesManaged}
                      </p>
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{hrDetails.attendanceStats.presentDays} present</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>{hrDetails.attendanceStats.absentDays} absent</span>
                      </div>
                    </div>
                  </div>
              )}
            </div>

            {/* HR Overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.hrOverview?.totalEmployees || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardData?.hrOverview?.newEmployeesThisMonth || 0} new this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.hrOverview?.pendingLeaveRequests || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Pending approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Training Sessions</CardTitle>
                  <GraduationCap className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.hrOverview?.trainingSessionsThisMonth || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                  <UserPlus className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData?.hrOverview?.openPositions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Actively recruiting</p>
                </CardContent>
              </Card>
            </div>

            {/* HR Activities */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent HR Activities</CardTitle>
                  <CardDescription>Latest human resources actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData?.recentActivities?.map((activity: any) => (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className={`${
                            activity.type === 'employee' ? 'bg-green-100' :
                                activity.type === 'leave' ? 'bg-blue-100' :
                                    'bg-purple-100'
                        } p-2 rounded-full`}>
                          {activity.type === 'employee' ? (
                              <UserPlus className="h-4 w-4 text-green-600" />
                          ) : activity.type === 'leave' ? (
                              <Calendar className="h-4 w-4 text-blue-600" />
                          ) : (
                              <GraduationCap className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.description}</p>
                        </div>
                      </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Tasks</CardTitle>
                  <CardDescription>Items requiring HR attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData?.pendingTasks?.map((task: any) => (
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

            {/* Department Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Department Overview</CardTitle>
                <CardDescription>Employee distribution across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {dashboardData?.departmentOverview?.map((dept: any) => (
                      <div key={dept.name} className="text-center p-4 border rounded-lg">
                        <div className={`text-2xl font-bold ${
                            dept.name === 'Service' ? 'text-blue-600' :
                                dept.name === 'Sales' ? 'text-green-600' :
                                    dept.name === 'Parts' ? 'text-orange-600' :
                                        dept.name === 'Administration' ? 'text-purple-600' :
                                            dept.name === 'Finance' ? 'text-red-600' :
                                                'text-indigo-600'
                        }`}>
                          {dept.count}
                        </div>
                        <p className="text-sm text-gray-600">{dept.name} Department</p>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used HR functions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/hr/employee-registration'}
                  >
                    <UserPlus className="h-6 w-6 mb-2" />
                    Add Employee
                  </Button>
                  <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/hr/leave-arrangement'}
                  >
                    <Calendar className="h-6 w-6 mb-2" />
                    Manage Leave
                  </Button>
                  <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/hr/training-arrangement'}
                  >
                    <GraduationCap className="h-6 w-6 mb-2" />
                    Schedule Training
                  </Button>
                  <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => window.location.href = '/hr/kpi-generation'}
                  >
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Generate KPI
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}