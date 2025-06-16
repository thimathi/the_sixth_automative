"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Award,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Target,
  Users,
  AlertCircle,
  FileText
} from "lucide-react"
import { useUser } from "@/context/user-context"
import { useEffect, useState } from "react"
import {
  getCurrentTrainings,
  getCompletedTrainings,
  getUpcomingTrainings,
  getTrainingStats
} from "./trainingBackend"
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

export default function EmployeeTrainingCheck() {
  const { user } = useUser();
  const [currentTrainings, setCurrentTrainings] = useState<any[]>([]);
  const [completedTrainings, setCompletedTrainings] = useState<any[]>([]);
  const [upcomingTrainings, setUpcomingTrainings] = useState<any[]>([]);
  const [trainingStats, setTrainingStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [current, completed, upcoming, stats] = await Promise.all([
            getCurrentTrainings(user.id),
            getCompletedTrainings(user.id),
            getUpcomingTrainings(user.id),
            getTrainingStats(user.id)
          ]);

          setCurrentTrainings(current);
          setCompletedTrainings(completed);
          setUpcomingTrainings(upcoming);
          setTrainingStats(stats);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch training data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

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

          <Skeleton className="h-96" />
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
            <h2 className="text-xl font-bold">Error loading training data</h2>
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
                <h1 className="text-3xl font-bold">Training Information</h1>
                <p className="text-muted-foreground">Track your training progress and certifications</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Trainings</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trainingStats?.totalCompleted || 0}</div>
                  <p className="text-xs text-muted-foreground">This year</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Trainings</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trainingStats?.currentEnrollments || 0}</div>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trainingStats?.averageScore?.toFixed(1) || 0}%</div>
                  <p className="text-xs text-muted-foreground">Training performance</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certificates</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trainingStats?.certificatesEarned || 0}</div>
                  <p className="text-xs text-muted-foreground">Earned</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Trainings</CardTitle>
                <CardDescription>Your ongoing training programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentTrainings.map((training) => (
                      <div key={training.trainingId} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium">{training.title}</h4>
                            <p className="text-sm text-muted-foreground">Provider: {training.provider}</p>
                          </div>
                          <div className="flex gap-2">
                            {training.mandatory && <Badge variant="destructive">Mandatory</Badge>}
                            <Badge variant={training.status === "In Progress" ? "default" : "secondary"}>
                              {training.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Start Date:</span>
                            <p className="font-medium">{training.startDate}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">End Date:</span>
                            <p className="font-medium">{training.endDate}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <p className="font-medium">{training.duration}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Format:</span>
                            <p className="font-medium">{training.format}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-muted-foreground">{training.progress}%</span>
                          </div>
                          <Progress value={training.progress} className="h-2" />
                        </div>

                        <div className="flex justify-end mt-3">
                          <Button size="sm" variant="outline">
                            Continue Training
                          </Button>
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Trainings</CardTitle>
                  <CardDescription>Available training programs you can enroll in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingTrainings.map((training) => (
                        <div key={training.trainingId} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{training.title}</h4>
                            {training.mandatory && <Badge variant="destructive">Mandatory</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">Provider: {training.provider}</p>

                          <div className="space-y-1 text-sm mb-3">
                            <div className="flex justify-between">
                              <span>Start Date:</span>
                              <span>{training.startDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span>{training.duration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Format:</span>
                              <span>{training.format}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Registration Deadline:</span>
                              <span className="text-red-600">{training.registrationDeadline}</span>
                            </div>
                          </div>

                          <Button size="sm" className="w-full">
                            Register Now
                          </Button>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training Calendar</CardTitle>
                  <CardDescription>Your training schedule overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentTrainings.map((training) => (
                        <div key={training.trainingId} className="p-3 bg-blue-50 rounded">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{training.startDate} - {training.endDate}</span>
                            <Badge variant="default">In Progress</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{training.title}</p>
                        </div>
                    ))}
                    {upcomingTrainings.map((training) => (
                        <div key={training.trainingId} className="p-3 bg-yellow-50 rounded">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{training.startDate}</span>
                            <Badge variant="outline">Upcoming</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{training.title}</p>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Completed Trainings & Certificates</CardTitle>
                <CardDescription>Your training history and earned certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Training Title</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Completed Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedTrainings.map((training) => (
                        <TableRow key={training.trainingId}>
                          <TableCell className="font-medium">{training.title}</TableCell>
                          <TableCell>{training.provider}</TableCell>
                          <TableCell>{training.completedDate}</TableCell>
                          <TableCell>{training.duration}</TableCell>
                          <TableCell>
                            <Badge
                                variant={training.score >= 90 ? "default" : training.score >= 80 ? "secondary" : "outline"}
                            >
                              {training.score}%
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{training.certificateNumber}</TableCell>
                          <TableCell>{training.expiryDate}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Download
                            </Button>
                          </TableCell>
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