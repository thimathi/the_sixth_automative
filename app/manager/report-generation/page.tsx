"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Download,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  Table2,
  Filter,
  Search,
  Users, Target, CreditCard, TrendingUp
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useUser } from "@/context/user-context"
import {
  getReportTemplates,
  getRecentReports,
  getScheduledReports,
  generateReport,
  scheduleReport,
  saveReportTemplate
} from "./reportGenerationBackend"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  lastUsed: string;
  createdBy: string;
}

interface RecentReport {
  id: string;
  name: string;
  date: string;
  status: "Completed" | "Processing" | "Failed";
  type: string;
  downloadUrl?: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  schedule: string;
  recipients: string[];
  nextRun: string;
  type: string;
  active: boolean;
}

const navigation = [
  { name: "Dashboard", href: "/manager/dashboard", icon: Users },
  { name: "Task Management", href: "/manager/task-management", icon: Target },
  { name: "Leave Management", href: "/manager/leave-management", icon: Calendar },
  { name: "Loan Management", href: "/manager/loan-management", icon: CreditCard },
  { name: "Performance Rating", href: "/manager/performance-rating", icon: TrendingUp },
  { name: "Report Generation", href: "/manager/report-generation", icon: FileText },
];

export default function ReportGenerationPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("templates")
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()

  // Form state for custom reports
  const [reportName, setReportName] = useState("")
  const [reportType, setReportType] = useState("")
  const [reportFormat, setReportFormat] = useState("pdf")
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        if (user?.id) {
          const [templatesRes, recentRes, scheduledRes] = await Promise.all([
            getReportTemplates(user.id),
            getRecentReports(user.id),
            getScheduledReports(user.id)
          ])

          if (templatesRes.error) throw new Error(templatesRes.error)
          if (recentRes.error) throw new Error(recentRes.error)
          if (scheduledRes.error) throw new Error(scheduledRes.error)

          setTemplates(templatesRes.data)
          setRecentReports(recentRes.data)
          setScheduledReports(scheduledRes.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch report data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || template.category.toLowerCase() === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleGenerateReport = async (templateId: string) => {
    try {
      if (!user?.id) return

      const response = await generateReport(templateId, user.id)
      if (response.error) throw new Error(response.error)

      // Refresh recent reports
      const recentRes = await getRecentReports(user.id)
      if (recentRes.error) throw new Error(recentRes.error)
      setRecentReports(recentRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    }
  }

  const handleCreateCustomReport = async () => {
    try {
      if (!user?.id || !reportName || !reportType) {
        throw new Error("Please fill all required fields")
      }

      const selectedSectionIds = Object.keys(selectedSections).filter(id => selectedSections[id])
      if (selectedSectionIds.length === 0) {
        throw new Error("Please select at least one data section")
      }

      const response = await generateReport(null, user.id, {
        name: reportName,
        type: reportType,
        format: reportFormat,
        dateRange,
        sections: selectedSectionIds
      })

      if (response.error) throw new Error(response.error)

      // Refresh recent reports
      const recentRes = await getRecentReports(user.id)
      if (recentRes.error) throw new Error(recentRes.error)
      setRecentReports(recentRes.data)

      // Reset form
      setReportName("")
      setReportType("")
      setSelectedSections({})
      setDateRange(undefined)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create custom report')
    }
  }

  const handleSaveTemplate = async () => {
    try {
      if (!user?.id || !reportName || !reportType) {
        throw new Error("Please fill all required fields")
      }

      const selectedSectionIds = Object.keys(selectedSections).filter(id => selectedSections[id])
      if (selectedSectionIds.length === 0) {
        throw new Error("Please select at least one data section")
      }

      const response = await saveReportTemplate(user.id, {
        name: reportName,
        type: reportType,
        format: reportFormat,
        dateRange,
        sections: selectedSectionIds
      })

      if (response.error) throw new Error(response.error)

      // Refresh templates
      const templatesRes = await getReportTemplates(user.id)
      if (templatesRes.error) throw new Error(templatesRes.error)
      setTemplates(templatesRes.data)

      // Reset form
      setReportName("")
      setReportType("")
      setSelectedSections({})
      setDateRange(undefined)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    }
  }

  const handleDownloadReport = async (reportId: string) => {
    try {
      const report = recentReports.find(r => r.id === reportId)
      if (!report?.downloadUrl) {
        throw new Error("Download URL not available")
      }

      // Create a temporary anchor element to trigger download
      const a = document.createElement('a')
      a.href = report.downloadUrl
      a.download = `${report.name}.${report.type === 'excel' ? 'xlsx' : report.type}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report')
    }
  }

  const reportStats = {
    totalReports: recentReports.length,
    generatedThisWeek: recentReports.filter(r => {
      const reportDate = new Date(r.date)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return reportDate >= oneWeekAgo
    }).length,
    scheduledReports: scheduledReports.length,
    sharedReports: scheduledReports.filter(r => r.recipients.length > 1).length
  }

  const dataSections = [
    { id: "executive", name: "Executive Summary" },
    { id: "performance", name: "Performance Metrics" },
    { id: "financial", name: "Financial Data" },
    { id: "employee", name: "Employee Statistics" },
    { id: "inventory", name: "Inventory Analysis" },
    { id: "customer", name: "Customer Satisfaction" },
    { id: "service", name: "Service Department" },
    { id: "sales", name: "Sales Performance" }
  ]

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
              <FileText className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-bold">Error loading report data</h2>
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
              <h1 className="text-3xl font-bold tracking-tight">Report Generation</h1>
              <p className="text-muted-foreground">Create and manage reports for The Sixth Automotive</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button
                  size="sm"
                  onClick={() => setActiveTab("custom")}
              >
                <FileText className="mr-2 h-4 w-4" />
                New Report
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportStats.totalReports}</div>
                <p className="text-xs text-muted-foreground">+12 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Generated This Week</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportStats.generatedThisWeek}</div>
                <p className="text-xs text-muted-foreground">+8 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportStats.scheduledReports}</div>
                <p className="text-xs text-muted-foreground">Auto-generated weekly/monthly</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shared Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportStats.sharedReports}</div>
                <p className="text-xs text-muted-foreground">Accessible by team members</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="templates">Report Templates</TabsTrigger>
              <TabsTrigger value="recent">Recent Reports</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
              <TabsTrigger value="custom">Custom Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="templates" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Search templates..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                    <Card key={template.id} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">{template.description}</CardDescription>
                          </div>
                          {template.category === "performance" && <BarChart3 className="h-5 w-5 text-blue-500" />}
                          {template.category === "financial" && <LineChart className="h-5 w-5 text-green-500" />}
                          {template.category === "inventory" && <PieChart className="h-5 w-5 text-amber-500" />}
                          {template.category === "employee" && <Table2 className="h-5 w-5 text-purple-500" />}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between border-t bg-muted/50 p-4">
                        <div className="text-xs text-muted-foreground">Last used: {template.lastUsed}</div>
                        <Button
                            size="sm"
                            onClick={() => handleGenerateReport(template.id)}
                        >
                          Generate
                        </Button>
                      </CardFooter>
                    </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="recent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>Reports generated in the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-4">
                            {report.type === "performance" && <BarChart3 className="h-5 w-5 text-blue-500" />}
                            {report.type === "financial" && <LineChart className="h-5 w-5 text-green-500" />}
                            {report.type === "inventory" && <PieChart className="h-5 w-5 text-amber-500" />}
                            {report.type === "employee" && <Table2 className="h-5 w-5 text-purple-500" />}
                            <div>
                              <h3 className="font-medium">{report.name}</h3>
                              <p className="text-sm text-muted-foreground">Generated: {format(new Date(report.date), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={report.status === "Completed" ? "default" : "secondary"}>
                              {report.status}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadReport(report.id)}
                                disabled={report.status !== "Completed" || !report.downloadUrl}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="scheduled" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Reports</CardTitle>
                  <CardDescription>Automatically generated reports on a schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scheduledReports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-4">
                            {report.type === "performance" && <BarChart3 className="h-5 w-5 text-blue-500" />}
                            {report.type === "financial" && <LineChart className="h-5 w-5 text-green-500" />}
                            {report.type === "inventory" && <PieChart className="h-5 w-5 text-amber-500" />}
                            {report.type === "employee" && <Table2 className="h-5 w-5 text-purple-500" />}
                            <div>
                              <h3 className="font-medium">{report.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Schedule: {report.schedule} • Next run: {format(new Date(report.nextRun), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{report.recipients.length} recipients</Badge>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="custom" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create Custom Report</CardTitle>
                  <CardDescription>Build a custom report with specific metrics and data points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="report-name">Report Name*</Label>
                        <Input
                            id="report-name"
                            placeholder="Enter report name"
                            value={reportName}
                            onChange={(e) => setReportName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="report-type">Report Type*</Label>
                        <Select
                            value={reportType}
                            onValueChange={setReportType}
                        >
                          <SelectTrigger id="report-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="performance">Performance Report</SelectItem>
                            <SelectItem value="financial">Financial Report</SelectItem>
                            <SelectItem value="inventory">Inventory Report</SelectItem>
                            <SelectItem value="employee">Employee Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Date Range</Label>
                        <div className="grid gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span>
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                                          {format(dateRange.to, 'LLL dd, y')}
                                        </>
                                    ) : (
                                        format(dateRange.from, 'LLL dd, y')
                                    )
                                ) : (
                                    'Pick a date range'
                                )}
                              </span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                  mode="range"
                                  selected={dateRange}
                                  //@ts-ignore
                                  onSelect={setDateRange}
                                  numberOfMonths={2}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="report-format">Report Format</Label>
                        <Select
                            value={reportFormat}
                            onValueChange={setReportFormat}
                        >
                          <SelectTrigger id="report-format">
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF Document</SelectItem>
                            <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                            <SelectItem value="csv">CSV File</SelectItem>
                            <SelectItem value="html">HTML Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Data Sections*</Label>
                      <div className="grid gap-2 md:grid-cols-2">
                        {dataSections.map((section) => (
                            <div key={section.id} className="flex items-center space-x-2 rounded-md border p-3">
                              <input
                                  type="checkbox"
                                  id={`section-${section.id}`}
                                  className="h-4 w-4 rounded border-gray-300"
                                  checked={!!selectedSections[section.id]}
                                  onChange={(e) => setSelectedSections(prev => ({
                                    ...prev,
                                    [section.id]: e.target.checked
                                  }))}
                              />
                              <Label htmlFor={`section-${section.id}`} className="flex-1">
                                {section.name}
                              </Label>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                      variant="outline"
                      onClick={handleSaveTemplate}
                      disabled={!reportName || !reportType || Object.keys(selectedSections).filter(id => selectedSections[id]).length === 0}
                  >
                    Save Template
                  </Button>
                  <Button
                      onClick={handleCreateCustomReport}
                      disabled={!reportName || !reportType || Object.keys(selectedSections).filter(id => selectedSections[id]).length === 0}
                  >
                    Generate Report
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
  )
}