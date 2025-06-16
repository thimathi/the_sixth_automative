"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {Calendar, FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Award, Target, Users, DollarSign} from "lucide-react";
import { useUser } from "@/context/user-context";
import { getLeaveBalances, getLeaveApplications, submitLeaveApplication } from "./leaveBackend";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/protectedRoute";
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

export default function LeaveApplication() {
  const { user } = useUser();
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [leaveApplications, setLeaveApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [balances, applications] = await Promise.all([
            getLeaveBalances(user.id),
            getLeaveApplications(user.id)
          ]);
          setLeaveBalance(balances);
          setLeaveApplications(applications);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leave data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      if (!user?.id) throw new Error("User not authenticated");
      if (!leaveType) throw new Error("Please select a leave type");
      if (!startDate || !endDate) throw new Error("Please select start and end dates");
      if (!reason) throw new Error("Please provide a reason");

      const days = calculateDays();
      await submitLeaveApplication(user.id, {
        type: leaveType,
        startDate,
        endDate,
        reason,
        days
      });

      // Refresh data
      const [balances, applications] = await Promise.all([
        getLeaveBalances(user.id),
        getLeaveApplications(user.id)
      ]);
      setLeaveBalance(balances);
      setLeaveApplications(applications);

      // Reset form
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
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
        </div>
      </DashboardLayout>
  );

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading leave data</h2>
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
                <h1 className="text-3xl font-bold">Leave Application</h1>
                <p className="text-muted-foreground">Apply for leave and manage your leave balance</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Annual Leave</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveBalance?.annual.remaining || 0}</div>
                  <p className="text-xs text-muted-foreground">of {leaveBalance?.annual.total || 0} days remaining</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveBalance?.sick.remaining || 0}</div>
                  <p className="text-xs text-muted-foreground">of {leaveBalance?.sick.total || 0} days remaining</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Personal Leave</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveBalance?.personal.remaining || 0}</div>
                  <p className="text-xs text-muted-foreground">of {leaveBalance?.personal.total || 0} days remaining</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emergency Leave</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveBalance?.emergency.remaining || 0}</div>
                  <p className="text-xs text-muted-foreground">of {leaveBalance?.emergency.total || 0} days remaining</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Apply for Leave</CardTitle>
                  <CardDescription>Submit a new leave application</CardDescription>
                </CardHeader>
                <CardContent>
                  {submitSuccess && (
                      <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                        Leave application submitted successfully!
                      </div>
                  )}
                  {submitError && (
                      <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
                        {submitError}
                      </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="leaveType">Leave Type</Label>
                      <Select value={leaveType} onValueChange={setLeaveType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                          <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                          <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                          <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                          <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                          <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {startDate && endDate && (
                        <div className="p-3 bg-muted rounded">
                          <div className="flex justify-between">
                            <span>Total Days:</span>
                            <span className="font-bold">{calculateDays()} days</span>
                          </div>
                        </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Leave</Label>
                      <Textarea
                          id="reason"
                          placeholder="Please provide a reason for your leave application"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={4}
                          required
                      />
                    </div>

                    {/* Optional: File attachment
                  <div className="space-y-2">
                    <Label htmlFor="attachment">Attachment (if needed)</Label>
                    <Input id="attachment" type="file" />
                  </div> */}

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leave Balance Summary</CardTitle>
                  <CardDescription>Your current leave entitlements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {leaveBalance && Object.entries(leaveBalance).map(([type, balance]: [string, any]) => (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{type} Leave</span>
                          <span className="text-sm text-muted-foreground">
                        {balance.remaining}/{balance.total} days
                      </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(balance.remaining / balance.total) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Used: {balance.used} days | Remaining: {balance.remaining} days
                        </div>
                      </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Leave Application History</CardTitle>
                <CardDescription>Your previous and current leave applications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approver</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveApplications.map((application) => (
                        <TableRow key={application.leaveId}>
                          <TableCell>{application.type}</TableCell>
                          <TableCell>{application.startDate}</TableCell>
                          <TableCell>{application.endDate}</TableCell>
                          <TableCell>{application.days}</TableCell>
                          <TableCell className="max-w-xs truncate">{application.reason}</TableCell>
                          <TableCell>{application.appliedDate}</TableCell>
                          <TableCell>
                            <Badge
                                variant={
                                  application.status === "Approved"
                                      ? "default"
                                      : application.status === "Pending"
                                          ? "secondary"
                                          : "destructive"
                                }
                            >
                              {application.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{application.approver}</TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}