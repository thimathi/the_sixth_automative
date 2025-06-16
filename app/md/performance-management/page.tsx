'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Award,
  BarChart3, Building,
  Download,
  Filter,
  LineChart,
  MoreHorizontal,
  PieChart,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { fetchPerformanceData, getRatingVariant, getRatingLabel } from "./mdPerformanceManagementBackend";
import { getMDNavigation } from "@/app/md/dashboard/mdDashboardBackend";
import { useUser } from "@/context/user-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {Calendar} from "@/components/ui/calendar";

const navigation = [
  { name: "Dashboard", href: "/md/dashboard", icon: Building },
  { name: "Meeting Management", href: "/md/meeting-management", icon: Calendar },
  { name: "Performance Management", href: "/md/performance-management", icon: TrendingUp },
  { name: "Promote Employees", href: "/md/promote-employees", icon: Award }
]

export default function PerformanceManagementPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role !== 'md') {
      router.push('/');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPerformanceData(user?.empId || '');
        setPerformanceData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'md') {
      loadData();
    }
  }, [user, userLoading, router]);

  if (userLoading || loading) {
    return (
        <DashboardLayout navigation={navigation} userRole="md" userName="Loading...">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </DashboardLayout>
    );
  }

  if (error) {
    return (
        <DashboardLayout navigation={navigation} userRole="md" userName="Loading...">
          <div className="flex items-center justify-center h-screen">
            <div className="text-red-500">{error}</div>
          </div>
        </DashboardLayout>
    );
  }

  if (!performanceData) {
    return (
        <DashboardLayout navigation={navigation} userRole="md" userName="Loading...">
          <div className="flex items-center justify-center h-screen">
            <div>No performance data available</div>
          </div>
        </DashboardLayout>
    );
  }

  return (
      <DashboardLayout navigation={navigation} userRole="md" userName="Loading...">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Performance Management</h1>
              <p className="text-muted-foreground">Monitor and analyze performance across The Sixth Automotive</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.overallPerformance}%</div>
                <div className="flex items-center">
                  <Badge className="text-xs" variant="default">
                    +5.2%
                  </Badge>
                  <p className="ml-2 text-xs text-muted-foreground">from last quarter</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.topPerformers}</div>
                <p className="text-xs text-muted-foreground">Employees with 4.5+ rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Improvement Needed</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.improvementNeeded}</div>
                <p className="text-xs text-muted-foreground">Employees below 3.0 rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Department Average</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.departmentAverage.toFixed(1)}/5.0</div>
                <div className="flex items-center">
                  <Badge className="text-xs" variant="default">
                    +0.3
                  </Badge>
                  <p className="ml-2 text-xs text-muted-foreground">from last review</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Performance metrics over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="mx-auto h-16 w-16 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Performance trend chart would appear here</p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Department Breakdown</CardTitle>
                <CardDescription>Performance distribution by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-4">
                  <PieChart className="h-40 w-40 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  {performanceData.departmentPerformance.map((department: any) => (
                      <div key={department.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${department.color}`} />
                          <span className="text-sm">{department.name}</span>
                        </div>
                        <span className="text-sm font-medium">{department.score.toFixed(1)}/5.0</span>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Performance Overview</TabsTrigger>
              <TabsTrigger value="employees">Employee Performance</TabsTrigger>
              <TabsTrigger value="departments">Department Analysis</TabsTrigger>
              <TabsTrigger value="goals">Goals & Objectives</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Performance Indicators</CardTitle>
                    <CardDescription>Critical metrics for business performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {performanceData.kpis.map((kpi: any) => (
                          <div key={kpi.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{kpi.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{kpi.value}</span>
                                <Badge
                                    variant={
                                      kpi.trend === "up" ? "secondary" :
                                          kpi.trend === "down" ? "destructive" :
                                              "default"
                                    }
                                >
                                  {kpi.change}
                                </Badge>
                              </div>
                            </div>
                            <Progress value={kpi.progress} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Target: {kpi.target}</span>
                              <span>{kpi.progress}% of target</span>
                            </div>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Operational efficiency and quality metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {performanceData.performanceMetrics.map((metric: any) => (
                          <div key={metric.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{metric.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{metric.value}</span>
                                {metric.trend === "up" ? (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : metric.trend === "down" ? (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                ) : null}
                              </div>
                            </div>
                            <Progress value={metric.percentage} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Industry Avg: {metric.industryAvg}</span>
                              <span>Best: {metric.best}</span>
                            </div>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>Key insights and recommendations for improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceData.performanceInsights.map((insight: any) => (
                        <div key={insight.id} className="rounded-lg border p-4">
                          <div className="flex items-start gap-4">
                            <div
                                className={`rounded-full p-2 ${insight.type === "positive" ? "bg-green-100 text-green-600" : insight.type === "warning" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}
                            >
                              {insight.type === "positive" ? (
                                  <TrendingUp className="h-4 w-4" />
                              ) : insight.type === "warning" ? (
                                  <BarChart3 className="h-4 w-4" />
                              ) : (
                                  <TrendingDown className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{insight.title}</h3>
                              <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline">{insight.department}</Badge>
                                <span className="text-xs text-muted-foreground">Impact: {insight.impact}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="employees" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search employees..." className="pl-8" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="parts">Parts</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="admin">Administrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Employee Performance Rankings</CardTitle>
                  <CardDescription>Performance ratings and rankings across all employees</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceData.employeePerformance.map((employee: any, index: number) => (
                        <div key={employee.id} className="rounded-lg border p-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                #{index + 1}
                              </div>
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={employee.avatar} alt={employee.name} />
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">{employee.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {employee.position} • {employee.department}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-start gap-2 md:items-end">
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {Array(5)
                                      .fill(0)
                                      .map((_, i) => (
                                          <Star
                                              key={i}
                                              className={`h-4 w-4 ${
                                                  i < Math.floor(employee.rating)
                                                      ? "fill-amber-500 text-amber-500"
                                                      : "text-muted-foreground"
                                              }`}
                                          />
                                      ))}
                                </div>
                                <span className="font-medium">{employee.rating.toFixed(1)}</span>
                              </div>
                              <Badge variant={getRatingVariant(employee.rating)}>
                                {getRatingLabel(employee.rating)}
                              </Badge>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Technical Skills</span>
                                <span>{employee.metrics.technical}%</span>
                              </div>
                              <Progress value={employee.metrics.technical} className="mt-1 h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Customer Service</span>
                                <span>{employee.metrics.customerService}%</span>
                              </div>
                              <Progress value={employee.metrics.customerService} className="mt-1 h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Efficiency</span>
                                <span>{employee.metrics.efficiency}%</span>
                              </div>
                              <Progress value={employee.metrics.efficiency} className="mt-1 h-2" />
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="departments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance Analysis</CardTitle>
                  <CardDescription>Detailed performance breakdown by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {performanceData.departmentAnalysis.map((department: any) => (
                        <div key={department.name} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">{department.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{department.employees} employees</Badge>
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Overall Rating</span>
                                <span>{department.overallRating.toFixed(1)}/5.0</span>
                              </div>
                              <Progress value={(department.overallRating / 5) * 100} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Productivity</span>
                                <span>{department.productivity}%</span>
                              </div>
                              <Progress value={department.productivity} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Quality Score</span>
                                <span>{department.qualityScore}%</span>
                              </div>
                              <Progress value={department.qualityScore} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Customer Satisfaction</span>
                                <span>{department.customerSatisfaction}%</span>
                              </div>
                              <Progress value={department.customerSatisfaction} className="h-2" />
                            </div>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-4">
                            <h4 className="mb-2 text-sm font-medium">Key Achievements</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {department.achievements.map((achievement: string, index: number) => (
                                  <li key={index}>• {achievement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="goals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Goals & Objectives</CardTitle>
                  <CardDescription>Track progress towards organizational and individual goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceData.performanceGoals.map((goal: any) => (
                        <div key={goal.id} className="rounded-lg border p-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{goal.title}</h3>
                                <Badge
                                    variant={
                                      goal.status === "On Track"
                                          ? "default"
                                          : goal.status === "At Risk"
                                              ? "secondary"
                                              : "destructive"
                                    }
                                >
                                  {goal.status}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{goal.department}</Badge>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={goal.owner.avatar} alt={goal.owner.name} />
                                <AvatarFallback>{goal.owner.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{goal.owner.name}</p>
                                <p className="text-xs text-muted-foreground">{goal.owner.position}</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Progress</span>
                                <span className="text-xs font-medium">{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-2 w-[200px]" />
                              <div className="text-xs text-muted-foreground">Due: {goal.dueDate}</div>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
  );
}