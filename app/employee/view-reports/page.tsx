"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Award,
  Target, Users
} from "lucide-react";
import { useUser } from "@/context/user-context";
import {
  getEmployeeReports,
  getReportCategories,
  getQuickStats,
  downloadReport,
  generateReport
} from "./reportsBackend";
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


export default function ViewReports() {
  const { user } = useUser();
  const [availableReports, setAvailableReports] = useState<any[]>([]);
  const [reportCategories, setReportCategories] = useState<any[]>([]);
  const [quickStats, setQuickStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [reports, categories, stats] = await Promise.all([
            getEmployeeReports(user.id),
            getReportCategories(),
            getQuickStats(user.id)
          ]);
          setAvailableReports(reports);
          setReportCategories(categories);
          setQuickStats(stats);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleDownload = async (reportId: string) => {
    try {
      if (!user?.id) return;
      setDownloadingId(reportId);
      await downloadReport(reportId, user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleGenerateReport = async (reportType: string) => {
    try {
      if (!user?.id) return;
      setGeneratingReport(true);
      await generateReport(user.id, reportType);
      // Refresh reports after generation
      const reports = await getEmployeeReports(user.id);
      setAvailableReports(reports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const filteredReports = availableReports.filter(report => {
    const categoryMatch = selectedCategory === "all" || report.type.toLowerCase() === selectedCategory;
    const yearMatch = report.period.includes(selectedYear) || report.generatedDate.includes(selectedYear);
    return categoryMatch && yearMatch;
  });

  if (loading) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName={user?.name || 'Employee'}>
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
        </div>
      </DashboardLayout>
  );

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading reports</h2>
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
        <DashboardLayout navigation={navigation} userRole="employee" userName="Loading...">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">View Reports</h1>
                <p className="text-muted-foreground">Access and download your personal reports</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{quickStats?.totalReports || 0}</div>
                  <p className="text-xs text-muted-foreground">Available for download</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ready to Download</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{quickStats?.availableReports || 0}</div>
                  <p className="text-xs text-muted-foreground">Reports ready</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processing</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{quickStats?.processingReports || 0}</div>
                  <p className="text-xs text-muted-foreground">Being generated</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {quickStats?.lastGenerated ? new Date(quickStats.lastGenerated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest report</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filter Reports</CardTitle>
                <CardDescription>Filter reports by category and period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedYear("2024");
                      }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
                <CardDescription>Your personal reports ready for download</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Generated Date</TableHead>
                      <TableHead>File Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length > 0 ? (
                        filteredReports.map((report) => (
                            <TableRow key={report.reportId}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{report.name}</div>
                                  <div className="text-sm text-muted-foreground">{report.description}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{report.type}</Badge>
                              </TableCell>
                              <TableCell>{report.period}</TableCell>
                              <TableCell>{report.generatedDate}</TableCell>
                              <TableCell>{report.fileSize}</TableCell>
                              <TableCell>
                                <Badge variant={report.status === "Available" ? "default" : "secondary"}>
                                  {report.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {report.status === "Available" ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDownload(report.reportId)}
                                        disabled={downloadingId === report.reportId}
                                    >
                                      {downloadingId === report.reportId ? (
                                          "Downloading..."
                                      ) : (
                                          <>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                          </>
                                      )}
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" disabled>
                                      Processing...
                                    </Button>
                                )}
                              </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No reports found matching your filters
                          </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Generate new reports or access frequently used ones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                      className="w-full justify-start"
                      onClick={() => handleGenerateReport("Attendance")}
                      disabled={generatingReport}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {generatingReport ? "Generating..." : "Generate Current Month Attendance"}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Latest Payslip
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Performance Dashboard
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Export Leave History
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Information</CardTitle>
                  <CardDescription>Important information about reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Report Generation</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Reports are generated automatically at month-end</li>
                      <li>• Custom reports can be requested through HR</li>
                      <li>• Processing time: 1-2 business days</li>
                      <li>• Reports are available for 12 months</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">File Formats</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• PDF format for official documents</li>
                      <li>• Excel format for data analysis</li>
                      <li>• All reports are digitally signed</li>
                      <li>• Password protected for security</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}