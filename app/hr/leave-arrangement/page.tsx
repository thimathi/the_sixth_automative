"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Calendar, GraduationCap, TrendingUp, DollarSign, CheckCircle, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  getLeaveRequests,
  updateLeaveRequestStatus,
  getLeaveStats,
  getLeavePolicies
} from "./leave-arrangement-backend"
import { Skeleton } from "@/components/ui/skeleton"
import ProtectedRoute from "@/components/protectedRoute"

const navigation = [
  { name: "Dashboard", href: "/hr/dashboard", icon: Users },
  { name: "Employee Management", href: "/hr/employee-management", icon: Users },
  { name: "Employee Registration", href: "/hr/employee-registration", icon: UserPlus },
  { name: "Leave Arrangement", href: "/hr/leave-arrangement", icon: Calendar },
  { name: "Training Arrangement", href: "/hr/training-arrangement", icon: GraduationCap },
  { name: "KPI Generation", href: "/hr/kpi-generation", icon: TrendingUp },
  { name: "Add Salary", href: "/hr/add-salary", icon: DollarSign },
]

export default function LeaveArrangementPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [leaveStats, setLeaveStats] = useState<any>(null)
  const [leavePolicies, setLeavePolicies] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [requests, stats, policies] = await Promise.all([
          getLeaveRequests(),
          getLeaveStats(),
          getLeavePolicies()
        ])
        setLeaveRequests(requests)
        setLeaveStats(stats)
        setLeavePolicies(policies)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leave data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleStatusUpdate = async (leaveId: string, newStatus: string) => {
    try {
      setLoading(true)
      // @ts-ignore
      await updateLeaveRequestStatus(leaveId, newStatus)
      const updatedRequests = await getLeaveRequests()
      setLeaveRequests(updatedRequests)
      toast({
        title: "Status updated successfully",
        description: `Leave request has been ${newStatus.toLowerCase()}.`,
        variant: "default",
      })
    } catch (err) {
      toast({
        title: "Error updating status",
        description: err instanceof Error ? err.message : 'Failed to update leave status',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = leaveRequests.filter(request => {
    if (activeTab === "pending") return request.status === "Pending"
    if (activeTab === "approved") return request.status === "Approved"
    if (activeTab === "rejected") return request.status === "Rejected"
    return true
  })

  if (loading) return (
      <DashboardLayout navigation={navigation} userRole="hr" userName="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-24" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
  )

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="hr" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <X className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading leave data</h2>
            <p className="text-gray-600">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
  )

  return (
      <ProtectedRoute allowedRoles={['hr']}>
        <DashboardLayout navigation={navigation} userRole="hr" userName="Michael Chen">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Arrangement</h1>
              <p className="text-gray-600">Manage employee leave requests and policies.</p>
            </div>

            {/* Leave Overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveStats?.pendingRequests || 0}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveStats?.approvedThisMonth || 0}</div>
                  <p className="text-xs text-muted-foreground">Total days: {leaveStats?.approvedDaysThisMonth || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Employees on Leave</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveStats?.employeesOnLeave || 0}</div>
                  <p className="text-xs text-muted-foreground">Currently on leave</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveStats?.avgLeaveBalance || 0}%</div>
                  <p className="text-xs text-muted-foreground">Avg. remaining days</p>
                </CardContent>
              </Card>
            </div>

            {/* Leave Requests */}
            <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Leave Requests</CardTitle>
                    <CardDescription>Requests awaiting your approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      {filteredRequests.length > 0 ? (
                          filteredRequests.map((request) => (
                              <div key={request.leaveId} className="border-b p-4 last:border-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-4">
                                    <Avatar className="h-10 w-10 mt-0.5">
                                      <AvatarImage src="/placeholder.svg" alt={request.employee.name} />
                                      <AvatarFallback>{request.employee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h4 className="text-sm font-medium">{request.employee.name}</h4>
                                      <p className="text-xs text-gray-500">
                                        {request.employee.department} - {request.employee.email}
                                      </p>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        <Badge variant="outline">{request.leaveType}</Badge>
                                        <span className="text-xs text-gray-500">
                                    {new Date(request.startDate).toLocaleDateString()} -{" "}
                                          {new Date(request.endDate).toLocaleDateString()}
                                  </span>
                                        <span className="text-xs font-medium">{request.duration} days</span>
                                      </div>
                                      <p className="mt-1 text-sm">{request.reason}</p>
                                    </div>
                                  </div>
                                  <Badge variant="secondary">Pending</Badge>
                                </div>
                                <div className="mt-4 flex justify-end space-x-2">
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center"
                                      onClick={() => handleStatusUpdate(request.leaveId, "Rejected")}
                                      disabled={loading}
                                  >
                                    <X className="mr-1 h-4 w-4" />
                                    Reject
                                  </Button>
                                  <Button
                                      size="sm"
                                      className="flex items-center"
                                      onClick={() => handleStatusUpdate(request.leaveId, "Approved")}
                                      disabled={loading}
                                  >
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                          ))
                      ) : (
                          <div className="p-8 text-center text-gray-500">
                            No pending leave requests
                          </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="approved" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Approved Leave Requests</CardTitle>
                    <CardDescription>Leave requests that have been approved</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      {filteredRequests.length > 0 ? (
                          filteredRequests.map((request) => (
                              <div key={request.leaveId} className="border-b p-4 last:border-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-4">
                                    <Avatar className="h-10 w-10 mt-0.5">
                                      <AvatarImage src="/placeholder.svg" alt={request.employee.name} />
                                      <AvatarFallback>{request.employee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h4 className="text-sm font-medium">{request.employee.name}</h4>
                                      <p className="text-xs text-gray-500">
                                        {request.employee.department} - {request.employee.email}
                                      </p>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        <Badge variant="outline">{request.leaveType}</Badge>
                                        <span className="text-xs text-gray-500">
                                    {new Date(request.startDate).toLocaleDateString()} -{" "}
                                          {new Date(request.endDate).toLocaleDateString()}
                                  </span>
                                        <span className="text-xs font-medium">{request.duration} days</span>
                                      </div>
                                      <p className="mt-1 text-sm">{request.reason}</p>
                                    </div>
                                  </div>
                                  <Badge variant="default">Approved</Badge>
                                </div>
                                <div className="mt-4 flex justify-end">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                          ))
                      ) : (
                          <div className="p-8 text-center text-gray-500">
                            No approved leave requests
                          </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rejected" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rejected Leave Requests</CardTitle>
                    <CardDescription>Leave requests that have been rejected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      {filteredRequests.length > 0 ? (
                          filteredRequests.map((request) => (
                              <div key={request.leaveId} className="border-b p-4 last:border-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-4">
                                    <Avatar className="h-10 w-10 mt-0.5">
                                      <AvatarImage src="/placeholder.svg" alt={request.employee.name} />
                                      <AvatarFallback>{request.employee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h4 className="text-sm font-medium">{request.employee.name}</h4>
                                      <p className="text-xs text-gray-500">
                                        {request.employee.department} - {request.employee.email}
                                      </p>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        <Badge variant="outline">{request.leaveType}</Badge>
                                        <span className="text-xs text-gray-500">
                                    {new Date(request.startDate).toLocaleDateString()} -{" "}
                                          {new Date(request.endDate).toLocaleDateString()}
                                  </span>
                                        <span className="text-xs font-medium">{request.duration} days</span>
                                      </div>
                                      <p className="mt-1 text-sm">{request.reason}</p>
                                    </div>
                                  </div>
                                  <Badge variant="destructive">Rejected</Badge>
                                </div>
                                <div className="mt-4 flex justify-end">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                          ))
                      ) : (
                          <div className="p-8 text-center text-gray-500">
                            No rejected leave requests
                          </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Leave Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Policies</CardTitle>
                <CardDescription>Company leave policy overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leavePolicies.map((policy) => (
                      <div key={policy.leaveTypeId} className="rounded-md border p-4">
                        <h3 className="font-medium">{policy.leaveType}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {policy.description || 'No description available'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Entitlement: {policy.totalLeavePerMonth || 'Not specified'}
                        </p>
                      </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Update Company Leave Policy
                </Button>
              </CardFooter>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  )
}