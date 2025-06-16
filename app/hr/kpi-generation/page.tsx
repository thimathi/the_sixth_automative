"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserPlus,
  Calendar,
  GraduationCap,
  TrendingUp,
  DollarSign,
  BarChart3,
  Target,
  Download,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
  getKPIData,
  getDepartmentKPIs,
  getPerformanceTrends,
  getPerformanceDistribution,
  generateKPIReport,
  exportKPIData
} from "./kpi-generation-backend"
import { KPI, DepartmentKPI, PerformanceTrend, PerformanceDistribution } from "./kpi-types"

const navigation = [
  { name: "Dashboard", href: "/hr/dashboard", icon: Users },
  { name: "Employee Management", href: "/hr/employee-management", icon: Users },
  { name: "Employee Registration", href: "/hr/employee-registration", icon: UserPlus },
  { name: "Leave Arrangement", href: "/hr/leave-arrangement", icon: Calendar },
  { name: "Training Arrangement", href: "/hr/training-arrangement", icon: GraduationCap },
  { name: "KPI Generation", href: "/hr/kpi-generation", icon: TrendingUp },
  { name: "Add Salary", href: "/hr/add-salary", icon: DollarSign },
]

export default function KPIGenerationPage() {
  const { toast } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState("Q2 2023")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [kpiData, setKpiData] = useState<KPI[]>([])
  const [departmentKPIs, setDepartmentKPIs] = useState<DepartmentKPI[]>([])
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([])
  const [performanceDistribution, setPerformanceDistribution] = useState<PerformanceDistribution[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch data based on selected filters
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [kpiData, deptKPIs, trends, distribution] = await Promise.all([
        getKPIData(selectedPeriod, selectedDepartment),
        getDepartmentKPIs(selectedPeriod),
        getPerformanceTrends(),
        getPerformanceDistribution(selectedPeriod)
      ])

      setKpiData(kpiData)
      setDepartmentKPIs(deptKPIs)
      setPerformanceTrends(trends)
      setPerformanceDistribution(distribution)
    } catch (error) {
      toast({
        title: "Error loading data",
        description: error instanceof Error ? error.message : "Failed to fetch KPI data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle report generation
  const handleGenerateReport = async () => {
    try {
      setIsLoading(true)
      await generateKPIReport(selectedPeriod, selectedDepartment)
      toast({
        title: "Report generated successfully",
        description: "The KPI report has been generated and saved.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error generating report",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle data export
  const handleExportData = async () => {
    try {
      setIsLoading(true)
      await exportKPIData(selectedPeriod, selectedDepartment)
      toast({
        title: "Export successful",
        description: "KPI data has been exported successfully.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <DashboardLayout navigation={navigation} userRole="hr" userName="Michael Chen">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KPI Generation</h1>
            <p className="text-gray-600">Generate and manage Key Performance Indicators for employees.</p>
          </div>

          {/* KPI Overview */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">86.3</div>
                <p className="text-xs text-muted-foreground">Company average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Score ≥ 90</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">Out of 156 employees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Improvement Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+5.2%</div>
                <p className="text-xs text-muted-foreground">From last quarter</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                <div>
                  <Label htmlFor="period">Review Period</Label>
                  <Select
                      value={selectedPeriod}
                      onValueChange={(value) => {
                        setSelectedPeriod(value)
                        fetchData()
                      }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1 2023">Q1 2023</SelectItem>
                      <SelectItem value="Q2 2023">Q2 2023</SelectItem>
                      <SelectItem value="Q3 2023">Q3 2023</SelectItem>
                      <SelectItem value="Q4 2023">Q4 2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                      value={selectedDepartment}
                      onValueChange={(value) => {
                        setSelectedDepartment(value)
                        fetchData()
                      }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="parts">Parts</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleGenerateReport} disabled={isLoading}>
                    {isLoading ? "Generating..." : "Generate Report"}
                  </Button>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
                    <Download className="mr-2 h-4 w-4" />
                    {isLoading ? "Exporting..." : "Export"}
                  </Button>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" disabled={isLoading}>
                    Bulk Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Tabs */}
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="individual">Individual KPIs</TabsTrigger>
              <TabsTrigger value="department">Department</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="individual" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Individual Performance Reviews</CardTitle>
                  <CardDescription>Employee KPI scores and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div>Loading employee KPIs...</div>
                      </div>
                  ) : (
                      <div className="space-y-6">
                        {kpiData.map((kpi) => (
                            <div key={kpi.id} className="border rounded-lg p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-medium">{kpi.employee}</h3>
                                  <p className="text-sm text-gray-600">
                                    {kpi.position} - {kpi.department}
                                  </p>
                                  <p className="text-xs text-gray-500">{kpi.period}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-blue-600">{kpi.overallScore}</div>
                                  <p className="text-xs text-gray-500">Overall Score</p>
                                  <Badge variant={kpi.status === "Completed" ? "default" : "secondary"} className="mt-1">
                                    {kpi.status}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {Object.entries(kpi.metrics).map(([metric, value]) => (
                                    <div key={metric}>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>{metric.charAt(0).toUpperCase() + metric.slice(1)}</span>
                                        <span>{value}%</span>
                                      </div>
                                      <Progress value={value} className="h-2" />
                                    </div>
                                ))}
                              </div>

                              <div className="flex justify-end mt-4 space-x-2">
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                                <Button size="sm">Edit Review</Button>
                              </div>
                            </div>
                        ))}
                      </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="department" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Average KPI scores by department</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div>Loading department KPIs...</div>
                      </div>
                  ) : (
                      <div className="space-y-6">
                        {departmentKPIs.map((dept) => (
                            <div key={dept.name} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h3 className="font-medium">{dept.name}</h3>
                                <p className="text-sm text-gray-600">{dept.employees} employees</p>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="text-lg font-bold">{dept.score}</div>
                                  <div className="text-xs text-green-600">{dept.trend}</div>
                                </div>
                                <div className="w-32">
                                  <Progress value={dept.score} className="h-2" />
                                </div>
                              </div>
                            </div>
                        ))}
                      </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Quarterly performance comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                          <div>Loading performance trends...</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                          {performanceTrends.map((trend) => (
                              <div key={trend.period} className="flex justify-between items-center">
                                <span>{trend.period}</span>
                                <div className="flex items-center space-x-2">
                                  <Progress value={trend.score} className="w-32 h-2" />
                                  <span className="text-sm font-medium">{trend.score}</span>
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Distribution</CardTitle>
                    <CardDescription>Employee score distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                          <div>Loading performance distribution...</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                          {performanceDistribution.map((dist) => (
                              <div key={dist.range} className="flex justify-between items-center">
                                <span>{dist.range}</span>
                                <div className="flex items-center space-x-2">
                                  <Progress
                                      value={(dist.count / performanceDistribution.reduce((sum, d) => sum + d.count, 0)) * 100}
                                      className="w-32 h-2"
                                  />
                                  <span className="text-sm font-medium">{dist.count} employees</span>
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
  )
}