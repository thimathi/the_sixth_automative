'use client'

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, DollarSign, TrendingUp, CheckCircle, AlertCircle, FileText, Users, Target, Award, MapPin, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/context/user-context";
import { markAttendance, getTodayAttendance, getWeeklyAttendance, getMonthlyStats } from "@/app/employee/attendance-marking/attendanceBackend";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/protectedRoute";
import { toast } from "sonner";

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

export default function AttendanceMarkingPage() {
  const { user } = useUser();
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch attendance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [todayData, weeklyDataRes, monthlyStatsRes] = await Promise.all([
            getTodayAttendance(user.id),
            getWeeklyAttendance(user.id),
            getMonthlyStats(user.id)
          ]);

          setAttendanceData(todayData);
          //@ts-ignore
          setWeeklyData(weeklyDataRes);
          setMonthlyStats(monthlyStatsRes);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleCheckIn = async () => {
    try {
      //@ts-ignore
      const result = await markAttendance(user?.id, 'check-in');
      if (result.error) {
        throw new Error(result.error);
      }
      setAttendanceData(result);
      toast.success('Checked in successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      //@ts-ignore
      const result = await markAttendance(user?.id, 'check-out');
      if (result.error) {
        throw new Error(result.error);
      }
      setAttendanceData(result);
      toast.success('Checked out successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to check out');
    }
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { weekday: 'short' });
  };

  if (loading) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>

          <Skeleton className="h-64" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
  );

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading attendance</h2>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance Marking</h1>
              <p className="text-gray-600">Mark your daily attendance and track your work hours.</p>
            </div>

            {/* Current Status */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Attendance</CardTitle>
                  <CardDescription>
                    Current attendance status for {new Date().toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <p className="text-gray-600">Current Time</p>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                          attendanceData?.inTime ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {formatTime(attendanceData?.inTime)}
                      </div>
                      <p className="text-sm text-gray-600">Check In</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                          attendanceData?.outTime ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {formatTime(attendanceData?.outTime)}
                      </div>
                      <p className="text-sm text-gray-600">Check Out</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {!attendanceData?.outTime ? (
                        <Button
                            onClick={attendanceData?.inTime ? handleCheckOut : handleCheckIn}
                            variant={attendanceData?.inTime ? 'destructive' : 'default'}
                            className="w-full h-12 text-lg"
                        >
                          <Clock className="mr-2 h-5 w-5" />
                          {attendanceData?.inTime ? 'Check Out' : 'Check In'}
                        </Button>
                    ) : (
                        <Button disabled className="w-full h-12 text-lg">
                          Attendance completed for today
                        </Button>
                    )}

                    <div className="flex items-center justify-center space-x-2">
                      {attendanceData?.status === 'present' ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-600 font-medium">Present</span>
                          </>
                      ) : attendanceData?.inTime ? (
                          <>
                            <Clock className="h-5 w-5 text-orange-600" />
                            <span className="text-orange-600 font-medium">Checked In</span>
                          </>
                      ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-600">Not Checked In</span>
                          </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location & Photo Verification</CardTitle>
                  <CardDescription>Verify your location and take a photo for attendance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">Current Location</p>
                    <p className="font-medium">The Sixth Automotive</p>
                    <p className="text-xs text-gray-500">123 Main Street, City</p>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">Take Photo</p>
                    <Button variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      Capture Photo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Summary */}
            <Card>
              <CardHeader>
                <CardTitle>This Week's Summary</CardTitle>
                <CardDescription>Your attendance record for the current week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-4">
                  {weeklyData.map((day) => (
                      <div key={day.date} className="text-center p-4 border rounded-lg">
                        <div className="font-medium text-sm mb-2">{formatDate(day.date)}</div>
                        <div className="space-y-1">
                          {day.status === 'present' ? (
                              <>
                                <Badge variant="default" className="text-xs">
                                  Present
                                </Badge>
                                <div className="text-xs text-gray-500">
                                  <div>In: {formatTime(day.inTime)}</div>
                                  <div>Out: {formatTime(day.outTime)}</div>
                                </div>
                              </>
                          ) : day.status === 'weekend' ? (
                              <Badge variant="secondary" className="text-xs">
                                Weekend
                              </Badge>
                          ) : day.status === 'leave' ? (
                              <Badge variant="outline" className="text-xs">
                                On Leave
                              </Badge>
                          ) : (
                              <Badge variant="destructive" className="text-xs">
                                Absent
                              </Badge>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Statistics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Days Present</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyStats?.daysPresent || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of {monthlyStats?.workingDays || 0} working days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyStats?.totalHours || 0}h</div>
                  <p className="text-xs text-muted-foreground">Regular working hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyStats?.overtimeHours || 0}h</div>
                  <p className="text-xs text-muted-foreground">Extra hours worked</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyStats?.attendanceRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}