'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Calendar,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Award,
  Target,
  AlertCircle
} from "lucide-react"
import { useUser } from "@/context/user-context"
import { useEffect, useState } from "react"
import { getMeetingStats, getUpcomingMeetings, getMeetingHistory } from "@/app/employee/employee-meeting-check/meetingBackend"
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

export default function EmployeeMeetingCheck() {
  const { user } = useUser();
  const [meetingStats, setMeetingStats] = useState<any>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [meetingHistory, setMeetingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [stats, upcoming, history] = await Promise.all([
            getMeetingStats(user.id),
            getUpcomingMeetings(user.id),
            getMeetingHistory(user.id)
          ]);

          setMeetingStats(stats);
          //@ts-ignore
          setUpcomingMeetings(upcoming);
          //@ts-ignore
          setMeetingHistory(history);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch meeting data');
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
          </div>
        </div>
      </DashboardLayout>
  );

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading meeting data</h2>
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
                <h1 className="text-3xl font-bold">Meeting Information</h1>
                <p className="text-muted-foreground">View your meeting schedule and attendance history</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{meetingStats?.upcomingCount || 0}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mandatory Meetings</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{meetingStats?.mandatoryCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Require attendance</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{meetingStats?.attendanceRate?.toFixed(1) || 0}%</div>
                  <p className="text-xs text-muted-foreground">This year</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{meetingStats?.totalMeetings || 0}</div>
                  <p className="text-xs text-muted-foreground">This year</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
                <CardDescription>Your scheduled meetings and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                      <div key={meeting.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{meeting.title}</h4>
                            <Badge variant={meeting.status === "Mandatory" ? "destructive" : "secondary"}>
                              {meeting.status}
                            </Badge>
                          </div>
                          <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(meeting.date)}
                          </span>
                              <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                                {meeting.time}
                          </span>
                            </div>
                            <p>Location: {meeting.location}</p>
                            <p>Organizer: {meeting.organizer}</p>
                            <p className="text-xs">{meeting.agenda}</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meeting History</CardTitle>
                <CardDescription>Your past meeting attendance and notes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meeting Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetingHistory.map((meeting) => (
                        <TableRow key={meeting.id}>
                          <TableCell className="font-medium">{meeting.title}</TableCell>
                          <TableCell>{formatDate(meeting.date)}</TableCell>
                          <TableCell>{meeting.time}</TableCell>
                          <TableCell>{meeting.organizer}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{meeting.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={meeting.attendance === "Present" ? "default" : "destructive"}>
                              {meeting.attendance}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{meeting.notes}</TableCell>
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