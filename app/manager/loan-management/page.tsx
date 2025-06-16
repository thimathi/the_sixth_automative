"use client"

import {useEffect, useState} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Banknote,
  Percent,
  CalendarDays,
  Users,
  Target, CreditCard, TrendingUp, FileText
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useUser } from "@/context/user-context"
import { getManagerLoanRequests, approveLoanRequest, rejectLoanRequest } from "./loanManagementBackend"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface LoanRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  loanType: string;
  amount: number;
  interestRate: number;
  durationMonths: number;
  requestDate: string;
  status: "Pending" | "Approved" | "Rejected";
  monthlyPayment: number;
  totalRepayment: number;
  reason: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewComments?: string;
}

const navigation = [
  { name: "Dashboard", href: "/manager/dashboard", icon: Users },
  { name: "Task Management", href: "/manager/task-management", icon: Target },
  { name: "Leave Management", href: "/manager/leave-management", icon: Calendar },
  { name: "Loan Management", href: "/manager/loan-management", icon: CreditCard },
  { name: "Performance Rating", href: "/manager/performance-rating", icon: TrendingUp },
  { name: "Report Generation", href: "/manager/report-generation", icon: FileText },
];

export default function LoanManagement() {
  const { user } = useUser();
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null)
  const [reviewComment, setReviewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLoanRequests = async () => {
      try {
        setLoading(true)
        if (user?.id) {
          const response = await getManagerLoanRequests(user.id)
          if (response.error) throw new Error(response.error)
          setLoanRequests(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch loan requests')
      } finally {
        setLoading(false)
      }
    }

    fetchLoanRequests()
  }, [user?.id])

  const loanStats = {
    totalRequests: loanRequests.length,
    pendingRequests: loanRequests.filter((req) => req.status === "Pending").length,
    approvedRequests: loanRequests.filter((req) => req.status === "Approved").length,
    rejectedRequests: loanRequests.filter((req) => req.status === "Rejected").length,
    totalAmountPending: loanRequests
        .filter((req) => req.status === "Pending")
        .reduce((sum, req) => sum + req.amount, 0),
  }

  const handleApprove = async (requestId: string) => {
    try {
      if (!user?.id) return

      const response = await approveLoanRequest(requestId, user.id, reviewComment)
      if (response.error) throw new Error(response.error)

      // Update the local state
      setLoanRequests(loanRequests.map(req =>
          req.id === requestId
              ? {
                ...req,
                status: "Approved",
                reviewedBy: user.id,
                reviewDate: new Date().toISOString(),
                reviewComments: reviewComment
              }
              : req
      ))
      setSelectedRequest(null)
      setReviewComment("")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve loan request')
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      if (!user?.id) return

      const response = await rejectLoanRequest(requestId, user.id, reviewComment)
      if (response.error) throw new Error(response.error)

      // Update the local state
      setLoanRequests(loanRequests.map(req =>
          req.id === requestId
              ? {
                ...req,
                status: "Rejected",
                reviewedBy: user.id,
                reviewDate: new Date().toISOString(),
                reviewComments: reviewComment
              }
              : req
      ))
      setSelectedRequest(null)
      setReviewComment("")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject loan request')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
        <DashboardLayout navigation={navigation} userRole="manager" userName="Loading...">
          <div className="space-y-6">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />

            <div className="grid gap-4 md:grid-cols-4">
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
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-bold">Error loading loan requests</h2>
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Loan Management</h1>
              <p className="text-muted-foreground">Review and approve employee loan requests</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loanStats.totalRequests}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loanStats.pendingRequests}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(loanStats.totalAmountPending)}</div>
                <p className="text-xs text-muted-foreground">In pending requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loanStats.totalRequests > 0
                      ? Math.round((loanStats.approvedRequests / loanStats.totalRequests) * 100)
                      : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Historical approval rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loan Requests</CardTitle>
              <CardDescription>Review and approve employee loan applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select
                    defaultValue="all"
                    onValueChange={(value) => {
                      // Filter logic would be implemented here
                      console.log("Filter by:", value)
                    }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                    defaultValue="all-types"
                    onValueChange={(value) => {
                      // Filter logic would be implemented here
                      console.log("Filter by type:", value)
                    }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    <SelectItem value="personal">Personal Loan</SelectItem>
                    <SelectItem value="emergency">Emergency Loan</SelectItem>
                    <SelectItem value="housing">Housing Loan</SelectItem>
                    <SelectItem value="vehicle">Vehicle Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Monthly</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loanRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{request.employeeId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{request.loanType}</TableCell>
                        <TableCell>{formatCurrency(request.amount)}</TableCell>
                        <TableCell>{request.durationMonths} months</TableCell>
                        <TableCell>{formatCurrency(request.monthlyPayment)}</TableCell>
                        <TableCell>
                          {format(new Date(request.requestDate), 'MM, dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge
                              variant={
                                request.status === "Approved"
                                    ? "default"
                                    : request.status === "Pending"
                                        ? "secondary"
                                        : "destructive"
                              }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedRequest(request)}
                                    disabled={request.status !== "Pending"}
                                >
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Loan Request Review</DialogTitle>
                                  <DialogDescription>
                                    Review and approve/reject the loan request
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedRequest && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">Employee</label>
                                          <p>{selectedRequest.employeeName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Employee ID</label>
                                          <p>{selectedRequest.employeeId}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Loan Type</label>
                                          <p>{selectedRequest.loanType}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Request Date</label>
                                          <p>{format(new Date(selectedRequest.requestDate), 'MMM dd, yyyy')}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Loan Amount</label>
                                          <p>{formatCurrency(selectedRequest.amount)}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Interest Rate</label>
                                          <p>{selectedRequest.interestRate}%</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Loan Duration</label>
                                          <p>{selectedRequest.durationMonths} months</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Monthly Payment</label>
                                          <p>{formatCurrency(selectedRequest.monthlyPayment)}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Total Repayment</label>
                                          <p>{formatCurrency(selectedRequest.totalRepayment)}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Reason for Loan</label>
                                        <p className="text-sm text-muted-foreground">{selectedRequest.reason}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Review Comments</label>
                                        <Textarea
                                            placeholder="Add your comments here..."
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleApprove(selectedRequest.id)}
                                            className="flex-1"
                                            disabled={selectedRequest.status !== "Pending"}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve
                                        </Button>
                                        <Button
                                            onClick={() => handleReject(selectedRequest.id)}
                                            variant="destructive"
                                            className="flex-1"
                                            disabled={selectedRequest.status !== "Pending"}
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject
                                        </Button>
                                      </div>
                                    </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Loan Policy Guidelines</CardTitle>
                <CardDescription>Important loan policy information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Personal Loans</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Maximum amount: 3 months salary</li>
                    <li>• Interest rate: 5% per annum</li>
                    <li>• Maximum duration: 24 months</li>
                    <li>• Processing fee: 1% of loan amount</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Emergency Loans</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Maximum amount: 2 months salary</li>
                    <li>• Interest rate: 3% per annum</li>
                    <li>• Maximum duration: 12 months</li>
                    <li>• No processing fee</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loan Calculator</CardTitle>
                <CardDescription>Calculate monthly payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Loan Amount</label>
                      <input
                          type="number"
                          className="w-full p-2 border rounded"
                          placeholder="e.g. 5000"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Interest Rate</label>
                      <input
                          type="number"
                          className="w-full p-2 border rounded"
                          placeholder="e.g. 5"
                          step="0.1"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Duration (months)</label>
                      <input
                          type="number"
                          className="w-full p-2 border rounded"
                          placeholder="e.g. 12"
                      />
                    </div>
                  </div>
                  <Button className="w-full">
                    Calculate Monthly Payment
                  </Button>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Payment:</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Interest:</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Repayment:</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
  )
}