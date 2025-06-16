"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Star,
  StarHalf,
  Download,
  Filter,
  BarChart3,
  UserCheck,
  Users,
  Target,
  Calendar,
  CreditCard, TrendingUp, FileText
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useUser } from "@/context/user-context"
import { getPerformanceRatings, updatePerformanceRating, exportPerformanceData } from "./performanceRatingBackend"
import { Skeleton } from "@/components/ui/skeleton"

interface EmployeeRating {
  id: string;
  name: string;
  position: string;
  department: string;
  rating: number;
  metrics: {
    technical: number;
    customerService: number;
    efficiency: number;
    teamwork?: number;
    sales?: number;
    inventory?: number;
  };
  lastUpdated: string;
  reviewer?: string;
  comments?: string;
}

const navigation = [
  { name: "Dashboard", href: "/manager/dashboard", icon: Users },
  { name: "Task Management", href: "/manager/task-management", icon: Target },
  { name: "Leave Management", href: "/manager/leave-management", icon: Calendar },
  { name: "Loan Management", href: "/manager/loan-management", icon: CreditCard },
  { name: "Performance Rating", href: "/manager/performance-rating", icon: TrendingUp },
  { name: "Report Generation", href: "/manager/report-generation", icon: FileText },
];

export default function PerformanceRatingPage() {
  const { user } = useUser()
  const [employees, setEmployees] = useState<EmployeeRating[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeRating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [activeTab, setActiveTab] = useState("all")
  const [editingRatings, setEditingRatings] = useState<Record<string, number>>({})
  const [editingMetrics, setEditingMetrics] = useState<Record<string, Record<string, number>>>({})

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true)
        if (user?.id) {
          const response = await getPerformanceRatings(user.id)
          if (response.error) throw new Error(response.error)
          setEmployees(response.data)
          setFilteredEmployees(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch performance data')
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
  }, [user?.id])

  useEffect(() => {
    let results = [...employees]

    // Apply department filter
    if (activeTab !== "all") {
      results = results.filter(emp => emp.department.toLowerCase() === activeTab)
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(emp =>
          emp.name.toLowerCase().includes(term) ||
          emp.position.toLowerCase().includes(term))
    }

    // Apply sorting
    switch (sortBy) {
      case "highest":
        results.sort((a, b) => b.rating - a.rating)
        break
      case "lowest":
        results.sort((a, b) => a.rating - b.rating)
        break
      case "name":
        results.sort((a, b) => a.name.localeCompare(b.name))
        break
      default: // "recent"
        results.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    }

    setFilteredEmployees(results)
  }, [employees, searchTerm, sortBy, activeTab])

  const handleRatingChange = (employeeId: string, value: number) => {
    setEditingRatings(prev => ({
      ...prev,
      [employeeId]: value / 20 // Convert slider value (0-100) to rating (0-5)
    }))
  }

  const handleMetricChange = (employeeId: string, metric: string, value: number) => {
    setEditingMetrics(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [metric]: value
      }
    }))
  }

  const saveRatingChanges = async (employeeId: string) => {
    try {
      if (!user?.id) return

      const updatedRating = editingRatings[employeeId]
      const updatedMetrics = editingMetrics[employeeId]

      if (!updatedRating && !updatedMetrics) return

      const response = await updatePerformanceRating(
          employeeId,
          user.id,
          updatedRating,
          updatedMetrics
      )

      if (response.error) throw new Error(response.error)

      // Update local state
      setEmployees(prev => prev.map(emp => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            rating: updatedRating !== undefined ? updatedRating : emp.rating,
            metrics: updatedMetrics ? { ...emp.metrics, ...updatedMetrics } : emp.metrics,
            lastUpdated: new Date().toISOString(),
            //@ts-ignore
            reviewer: `${user.firstName} ${user.lastName}`
          }
        }
        return emp
      }))

      // Clear editing state
      setEditingRatings(prev => {
        const newState = { ...prev }
        delete newState[employeeId]
        return newState
      })
      setEditingMetrics(prev => {
        const newState = { ...prev }
        delete newState[employeeId]
        return newState
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rating')
    }
  }

  const handleExport = async () => {
    try {
      const response = await exportPerformanceData(user?.id || '')
      if (response.error) throw new Error(response.error)

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `performance-ratings-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
    }
  }

  const performanceStats = {
    totalEmployees: employees.length,
    ratedEmployees: employees.filter(emp => emp.rating > 0).length,
    averageRating: employees.length > 0
        ? employees.reduce((sum, emp) => sum + emp.rating, 0) / employees.length
        : 0,
    topPerformers: employees.filter(emp => emp.rating >= 4.5).length,
    needsImprovement: employees.filter(emp => emp.rating < 3).length,
  }

  if (loading) {
    return (
        <DashboardLayout navigation={navigation} userRole="manager" userName="Loading...">
          <div className="flex flex-col gap-5">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
              ))}
            </div>

            <Skeleton className="h-[400px]" />
          </div>
        </DashboardLayout>
    )
  }

  if (error) {
    return (
        <DashboardLayout navigation={navigation} userRole="manager" userName="Loading...">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <UserCheck className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-bold">Error loading performance data</h2>
              <p className="text-gray-600">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </DashboardLayout>
    )
  }

  return (
      <DashboardLayout navigation={navigation} userRole="manager" userName="Loading...">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Performance Rating</h1>
              <p className="text-muted-foreground">Evaluate and manage employee performance metrics</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees Rated</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceStats.ratedEmployees}/{performanceStats.totalEmployees}
                </div>
                <p className="text-xs text-muted-foreground">
                  {performanceStats.totalEmployees - performanceStats.ratedEmployees} remaining
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceStats.averageRating.toFixed(1)}/5
                </div>
                <p className="text-xs text-muted-foreground">
                  {performanceStats.averageRating >= 4 ? 'Excellent' :
                      performanceStats.averageRating >= 3 ? 'Good' : 'Needs improvement'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <Star className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceStats.topPerformers}</div>
                <p className="text-xs text-muted-foreground">Employees with 4.5+ rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
                <StarHalf className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceStats.needsImprovement}</div>
                <p className="text-xs text-muted-foreground">Employees below 3.0 rating</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Employees</TabsTrigger>
              <TabsTrigger value="mechanics">Mechanics</TabsTrigger>
              <TabsTrigger value="service">Service Advisors</TabsTrigger>
              <TabsTrigger value="parts">Parts Department</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Search employees..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Updated</SelectItem>
                    <SelectItem value="highest">Highest Rated</SelectItem>
                    <SelectItem value="lowest">Lowest Rated</SelectItem>
                    <SelectItem value="name">Employee Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Employee Performance Ratings</CardTitle>
                  <CardDescription>
                    Review and update performance ratings for your team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredEmployees.map((employee) => (
                        <div key={employee.id} className="rounded-lg border p-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                {employee.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-medium">{employee.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {employee.position} • {employee.department}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 md:items-end">
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {Array(5)
                                      .fill(0)
                                      .map((_, i) =>
                                          i < Math.floor(employee.rating) ? (
                                              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                                          ) : i < employee.rating ? (
                                              <StarHalf key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                                          ) : (
                                              <Star key={i} className="h-4 w-4 text-muted-foreground" />
                                          ),
                                      )}
                                </div>
                                <span className="font-medium">
                              {editingRatings[employee.id] !== undefined
                                  ? editingRatings[employee.id].toFixed(1)
                                  : employee.rating.toFixed(1)}
                            </span>
                              </div>
                              <Badge variant={getRatingVariant(employee.rating)}>
                                {getRatingLabel(
                                    editingRatings[employee.id] !== undefined
                                        ? editingRatings[employee.id]
                                        : employee.rating
                                )}
                              </Badge>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Performance Metrics</h4>
                              <div className="space-y-2">
                                {Object.entries(employee.metrics).map(([metric, value]) => (
                                    <div key={metric}>
                                      <div className="flex items-center justify-between text-sm">
                                        <span>{formatMetricName(metric)}</span>
                                        <span>
                                    {editingMetrics[employee.id]?.[metric] !== undefined
                                        ? editingMetrics[employee.id][metric]
                                        : value}%
                                  </span>
                                      </div>
                                      <Progress
                                          value={
                                            editingMetrics[employee.id]?.[metric] !== undefined
                                                ? editingMetrics[employee.id][metric]
                                                : value
                                          }
                                          className="h-2"
                                      />
                                    </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Update Rating</h4>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label>Overall Rating</Label>
                                    <span className="text-sm">
                                  {editingRatings[employee.id] !== undefined
                                      ? editingRatings[employee.id].toFixed(1)
                                      : employee.rating.toFixed(1)}
                                </span>
                                  </div>
                                  <Slider
                                      defaultValue={[employee.rating * 20]}
                                      value={[
                                        editingRatings[employee.id] !== undefined
                                            ? editingRatings[employee.id] * 20
                                            : employee.rating * 20
                                      ]}
                                      onValueChange={(val) => handleRatingChange(employee.id, val[0])}
                                      max={100}
                                      step={5}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Update Metrics</Label>
                                  {Object.entries(employee.metrics).map(([metric]) => (
                                      <div key={metric} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                          <span>{formatMetricName(metric)}</span>
                                          <span>
                                      {editingMetrics[employee.id]?.[metric] !== undefined
                                          ? editingMetrics[employee.id][metric]
                                          : employee.metrics[metric as keyof typeof employee.metrics]}%
                                    </span>
                                        </div>
                                        <Slider
                                            //@ts-ignore
                                            defaultValue={[employee.metrics[metric as keyof typeof employee.metrics]]}
                                            value={[
                                              //@ts-ignore
                                              editingMetrics[employee.id]?.[metric] !== undefined
                                                  ? editingMetrics[employee.id][metric]
                                                  : employee.metrics[metric as keyof typeof employee.metrics]
                                            ]}
                                            onValueChange={(val) => handleMetricChange(employee.id, metric, val[0])}
                                            max={100}
                                            step={5}
                                        />
                                      </div>
                                  ))}
                                </div>
                                <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => saveRatingChanges(employee.id)}
                                    disabled={
                                        !editingRatings[employee.id] &&
                                        !editingMetrics[employee.id]
                                    }
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="mechanics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mechanics Performance</CardTitle>
                  <CardDescription>Specialized metrics for automotive technicians</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {filteredEmployees.length > 0
                        ? `${filteredEmployees.length} mechanics found`
                        : "No mechanics in this department"}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="service" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Advisors Performance</CardTitle>
                  <CardDescription>Customer satisfaction and service metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {filteredEmployees.length > 0
                        ? `${filteredEmployees.length} service advisors found`
                        : "No service advisors in this department"}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="parts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parts Department Performance</CardTitle>
                  <CardDescription>Inventory and sales metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {filteredEmployees.length > 0
                        ? `${filteredEmployees.length} parts specialists found`
                        : "No parts specialists in this department"}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
  )
}

function getRatingVariant(rating: number) {
  if (rating >= 4.5) return "default"
  if (rating >= 3.5) return "default"
  if (rating >= 2.5) return "secondary"
  return "destructive"
}

function getRatingLabel(rating: number) {
  if (rating >= 4.5) return "Excellent"
  if (rating >= 3.5) return "Good"
  if (rating >= 2.5) return "Average"
  return "Needs Improvement"
}

function formatMetricName(metric: string) {
  return metric
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
}