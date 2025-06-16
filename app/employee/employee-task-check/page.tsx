'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ClipboardList, Clock, CheckCircle, AlertCircle, Calendar, DollarSign, TrendingUp, FileText, Award, Target, Users } from "lucide-react"
import { useUser } from "@/context/user-context"
import { useEffect, useState } from "react"
import { getCurrentTasks, getTaskHistory, getTaskStats } from "@/app/employee/employee-task-check/taskBackend"
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

export default function EmployeeTaskCheck() {
  const { user } = useUser();
  const [currentTasks, setCurrentTasks] = useState<any[]>([]);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [tasks, history, stats] = await Promise.all([
            getCurrentTasks(user.id),
            getTaskHistory(user.id),
            getTaskStats(user.id)
          ]);
          //@ts-ignore
          setCurrentTasks(tasks);
          //@ts-ignore
          setTaskHistory(history);
          setTaskStats(stats);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch task data');
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

  const calculateAverageRating = () => {
    if (taskHistory.length === 0) return 0;
    const sum = taskHistory.reduce((total, task) => total + (task.rating || 0), 0);
    return sum / taskHistory.length;
  };

  const averageRating = calculateAverageRating();

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
            <h2 className="text-xl font-bold">Error loading task data</h2>
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
                <h1 className="text-3xl font-bold">Task Information</h1>
                <p className="text-muted-foreground">View your assigned tasks and work history</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{taskStats?.totalTasks || 0}</div>
                  <p className="text-xs text-muted-foreground">Currently assigned</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{taskStats?.inProgressTasks || 0}</div>
                  <p className="text-xs text-muted-foreground">Being worked on</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{taskStats?.completedTasks || 0}</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5</div>
                  <p className="text-xs text-muted-foreground">Performance rating</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Tasks</CardTitle>
                <CardDescription>Your currently assigned tasks and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentTasks.map((task) => (
                      <div key={task.taskId} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          </div>
                          <Badge
                              variant={
                                task.priority === "High" ? "destructive" :
                                    task.priority === "Medium" ? "secondary" : "outline"
                              }
                          >
                            {task.priority}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Assigned by:</span>
                            <p className="font-medium">{task.assignedBy}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Due date:</span>
                            <p className="font-medium">{task.dueDate ? formatDate(task.dueDate) : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Estimated:</span>
                            <p className="font-medium">{task.estimatedHours || 0}h</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Actual:</span>
                            <p className="font-medium">{task.actualHours || 0}h</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Progress</span>
                            <Badge
                                variant={
                                  task.status === "Completed" ? "default" :
                                      task.status === "In Progress" ? "secondary" : "outline"
                                }
                            >
                              {task.status || 'Not Started'}
                            </Badge>
                          </div>
                          <Progress value={task.progress || 0} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{task.progress || 0}% complete</span>
                            <span>
                          {task.status === "Completed" ? "Finished" : `${100 - (task.progress || 0)}% remaining`}
                        </span>
                          </div>
                        </div>

                        <div className="flex justify-end mt-3">
                          <Button size="sm" variant="outline">
                            Update Progress
                          </Button>
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task History</CardTitle>
                <CardDescription>Your completed tasks and performance feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Title</TableHead>
                      <TableHead>Completed Date</TableHead>
                      <TableHead>Assigned By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taskHistory.map((task) => (
                        <TableRow key={task.taskId}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>{task.completedDate ? formatDate(task.completedDate) : 'N/A'}</TableCell>
                          <TableCell>{task.assignedBy || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="default">{task.status || 'Completed'}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="font-medium">{task.rating || 0}/5</span>
                              <div className="ml-2 flex">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`text-xs ${i < (task.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                                    >
                                ★
                              </span>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{task.feedback || 'No feedback'}</TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Your task completion and quality metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">{taskStats?.onTimeCompletion || '0'}%</div>
                    <div className="text-sm text-muted-foreground">On-time Completion</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">{taskStats?.monthlyCompleted || 0}</div>
                    <div className="text-sm text-muted-foreground">Tasks Completed This Month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}