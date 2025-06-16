'use client'

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Calendar, CheckCircle, XCircle, Clock, Users, Target, CreditCard, TrendingUp, FileText} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getLeaveRequests,
  getLeaveStats,
  getTeamLeaveCalendar,
  updateLeaveStatus,
  getLeavePolicies
} from "./managerLeaveBackend";
import { useUser } from "@/context/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/protectedRoute";

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedDate: string;
  status: string;
  remainingBalance: number;
  coveringEmployee: string;
  reviewedBy?: string;
  reviewDate?: string;
}

interface LeavePolicy {
  id: string;
  leaveType: string;
  description: string;
  annualEntitlement: number;
  carryOverRules: string;
  noticePeriod: string;
  documentationRequired: string;
  approvalWorkflow: string;
}

const navigation = [
  { name: "Dashboard", href: "/manager/dashboard", icon: Users },
  { name: "Task Management", href: "/manager/task-management", icon: Target },
  { name: "Leave Management", href: "/manager/leave-management", icon: Calendar },
  { name: "Loan Management", href: "/manager/loan-management", icon: CreditCard },
  { name: "Performance Rating", href: "/manager/performance-rating", icon: TrendingUp },
  { name: "Report Generation", href: "/manager/report-generation", icon: FileText },
];

export default function LeaveManagement() {
  const { user } = useUser();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveStats, setLeaveStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });
  const [teamLeaveCalendar, setTeamLeaveCalendar] = useState<any[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all-types");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [
            leaveRequestsRes,
            leaveStatsRes,
            teamLeaveCalendarRes,
            leavePoliciesRes
          ] = await Promise.all([
            getLeaveRequests(user.id),
            getLeaveStats(user.id),
            getTeamLeaveCalendar(user.id),
            getLeavePolicies()
          ]);

          if (leaveRequestsRes.error) throw new Error(leaveRequestsRes.error);
          if (leaveStatsRes.error) throw new Error(leaveStatsRes.error);
          if (teamLeaveCalendarRes.error) throw new Error(teamLeaveCalendarRes.error);
          if (leavePoliciesRes.error) throw new Error(leavePoliciesRes.error);

          setLeaveRequests(leaveRequestsRes.leaveRequests || []);
          setLeaveStats(leaveStatsRes.stats || {
            totalRequests: 0,
            pendingRequests: 0,
            approvedRequests: 0,
            rejectedRequests: 0
          });
          setTeamLeaveCalendar(teamLeaveCalendarRes.calendar || []);
          setLeavePolicies(leavePoliciesRes.policies || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleApprove = async (requestId: string) => {
    try {
      if (!user?.id) return;

      const { error } = await updateLeaveStatus(
          requestId,
          'approved',
          //@ts-ignore
          `${user.first_name} ${user.last_name}`,
          reviewComment
      );

      if (error) throw new Error(error);

      // Refresh data
      const leaveRequestsRes = await getLeaveRequests(user.id);
      if (leaveRequestsRes.error) throw new Error(leaveRequestsRes.error);
      setLeaveRequests(leaveRequestsRes.leaveRequests || []);

      const leaveStatsRes = await getLeaveStats(user.id);
      if (leaveStatsRes.error) throw new Error(leaveStatsRes.error);
      setLeaveStats(leaveStatsRes.stats || {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0
      });

      setSelectedRequest(null);
      setReviewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve leave request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      if (!user?.id) return;

      const { error } = await updateLeaveStatus(
          requestId,
          'rejected',
          //@ts-ignore
          `${user.first_name} ${user.last_name}`,
          reviewComment
      );

      if (error) throw new Error(error);

      // Refresh data
      const leaveRequestsRes = await getLeaveRequests(user.id);
      if (leaveRequestsRes.error) throw new Error(leaveRequestsRes.error);
      setLeaveRequests(leaveRequestsRes.leaveRequests || []);

      const leaveStatsRes = await getLeaveStats(user.id);
      if (leaveStatsRes.error) throw new Error(leaveStatsRes.error);
      setLeaveStats(leaveStatsRes.stats || {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0
      });

      setSelectedRequest(null);
      setReviewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject leave request');
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const statusMatch = filterStatus === "all" ||
        (filterStatus === "pending" && request.status === "pending") ||
        (filterStatus === "approved" && request.status === "approved") ||
        (filterStatus === "rejected" && request.status === "rejected");

    const typeMatch = filterType === "all-types" ||
        (filterType === "annual" && request.leaveType.toLowerCase().includes("annual")) ||
        (filterType === "sick" && request.leaveType.toLowerCase().includes("sick")) ||
        (filterType === "personal" && request.leaveType.toLowerCase().includes("personal")) ||
        (filterType === "emergency" && request.leaveType.toLowerCase().includes("emergency"));

    return statusMatch && typeMatch;
  });

  if (loading) return (
      <ProtectedRoute allowedRoles={['manager']}>
        <DashboardLayout navigation={navigation} userRole="manager" userName="Loading...">
          <div className="space-y-6">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />

            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="md:col-span-2 h-96" />
              <Skeleton className="h-96" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );

  if (error) return (
      <ProtectedRoute allowedRoles={['manager']}>
        <DashboardLayout navigation={navigation} userRole="manager" userName="Error">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-bold">Error loading leave management</h2>
              <p className="text-gray-600">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );

  return (
      <ProtectedRoute allowedRoles={['manager']}>
        <DashboardLayout
            navigation={navigation}
            userRole="manager"
            //@ts-ignore
            userName={`${user?.first_name} ${user?.last_name}`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Leave Management</h1>
                <p className="text-muted-foreground">Review and manage team leave requests</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveStats.totalRequests}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveStats.pendingRequests}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveStats.approvedRequests}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Coverage</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">95%</div>
                  <p className="text-xs text-muted-foreground">Coverage rate</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Leave Requests</CardTitle>
                  <CardDescription>Review and approve team leave requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Requests</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-types">All Types</SelectItem>
                        <SelectItem value="annual">Annual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal Leave</SelectItem>
                        <SelectItem value="emergency">Emergency Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{request.employeeName}</div>
                                <div className="text-sm text-muted-foreground">{request.employeeId}</div>
                              </div>
                            </TableCell>
                            <TableCell>{request.leaveType}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>{request.days}</TableCell>
                            <TableCell>
                              <Badge
                                  variant={
                                    request.status === "approved"
                                        ? "default"
                                        : request.status === "pending"
                                            ? "secondary"
                                            : "destructive"
                                  }
                              >
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedRequest(request)}
                                        disabled={request.status !== "pending"}
                                    >
                                      Review
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Leave Request Review</DialogTitle>
                                      <DialogDescription>Review and approve/reject the leave request</DialogDescription>
                                    </DialogHeader>
                                    {selectedRequest && (
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <label className="text-sm font-medium">Employee</label>
                                              <p>{selectedRequest.employeeName}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium">Leave Type</label>
                                              <p>{selectedRequest.leaveType}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium">Start Date</label>
                                              <p>{new Date(selectedRequest.startDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium">End Date</label>
                                              <p>{new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium">Total Days</label>
                                              <p>{selectedRequest.days} days</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium">Remaining Balance</label>
                                              <p>{selectedRequest.remainingBalance} days</p>
                                            </div>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Reason</label>
                                            <p className="text-sm text-muted-foreground">{selectedRequest.reason}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Covering Employee</label>
                                            <p>{selectedRequest.coveringEmployee}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Manager Comments</label>
                                            <Textarea
                                                placeholder="Add your comments here..."
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                            />
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleApprove(selectedRequest.id)}
                                                className="flex-1"
                                            >
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Approve
                                            </Button>
                                            <Button
                                                onClick={() => handleReject(selectedRequest.id)}
                                                variant="destructive"
                                                className="flex-1"
                                            >
                                              <XCircle className="h-4 w-4 mr-2" />
                                              Reject
                                            </Button>
                                          </div>
                                        </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Leave Calendar</CardTitle>
                  <CardDescription>Upcoming team leave schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamLeaveCalendar.map((leave, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">{new Date(leave.date).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">{leave.employee}</p>
                            <p className="text-xs text-muted-foreground">
                              {leave.type} {leave.status === 'pending' ? '(Pending)' : ''}
                            </p>
                          </div>
                        </div>
                    ))}
                    {teamLeaveCalendar.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No upcoming leave scheduled
                        </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Policy Guidelines</CardTitle>
                  <CardDescription>Important leave policy information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {leavePolicies.map((policy) => (
                      <div key={policy.id} className="space-y-2">
                        <h4 className="font-medium">{policy.leaveType}</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Annual entitlement: {policy.annualEntitlement} days</li>
                          <li>• Carry over rules: {policy.carryOverRules}</li>
                          <li>• Notice period: {policy.noticePeriod}</li>
                          <li>• Documentation required: {policy.documentationRequired}</li>
                          <li>• Approval workflow: {policy.approvalWorkflow}</li>
                        </ul>
                      </div>
                  ))}
                  {leavePolicies.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No leave policies found
                      </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common leave management tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Team Calendar
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Bulk Approve Requests
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Check Team Coverage
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Generate Leave Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}