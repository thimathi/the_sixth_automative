"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, CreditCard, FileText, Calculator, AlertCircle, Clock, Calendar, Users, TrendingUp, Award, Target } from "lucide-react";
import { useUser } from "@/context/user-context";
import { getEmployeeProfile, getLoanApplications, getLoanTypes, submitLoanApplication } from "./loanBackend";
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

export default function LoanApplication() {
  const { user } = useUser();
  const [loanType, setLoanType] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [repaymentPeriod, setRepaymentPeriod] = useState("");
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const [loanApplications, setLoanApplications] = useState<any[]>([]);
  const [loanTypes, setLoanTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [profile, applications, types] = await Promise.all([
            getEmployeeProfile(user.id),
            getLoanApplications(user.id),
            getLoanTypes()
          ]);
          setEmployeeProfile(profile);
          setLoanApplications(applications);
          setLoanTypes(types);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch loan data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const calculateEligibility = () => {
    if (!employeeProfile) return { maxEMI: "0", eligibilityScore: 0, recommendedAmount: 0 };

    const monthlyIncome = employeeProfile.salary / 12;
    const existingEMI = employeeProfile.existingLoans / 12;
    const availableIncome = monthlyIncome - existingEMI;
    const maxEMI = availableIncome * 0.4; // 40% of available income

    return {
      maxEMI: maxEMI.toFixed(2),
      eligibilityScore: Math.min(100, (employeeProfile.creditScore / 850) * 100),
      recommendedAmount: Math.min(employeeProfile.maxEligibleAmount, maxEMI * 36),
    };
  };

  const eligibility = calculateEligibility();

  const calculateMonthlyPayment = () => {
    if (!loanAmount || !repaymentPeriod) return 0;
    const amount = parseFloat(loanAmount);
    const months = parseInt(repaymentPeriod);
    const interestRate = 8; // Default, would be calculated properly in backend
    const monthlyRate = interestRate / 100 / 12;
    return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      if (!user?.id) throw new Error("User not authenticated");
      if (!loanType) throw new Error("Please select a loan type");
      if (!loanAmount) throw new Error("Please enter a loan amount");
      if (!repaymentPeriod) throw new Error("Please select a repayment period");
      if (!loanPurpose) throw new Error("Please provide a loan purpose");

      await submitLoanApplication(user.id, {
        type: loanType,
        amount: parseFloat(loanAmount),
        purpose: loanPurpose,
        repaymentPeriod: parseInt(repaymentPeriod)
      });

      // Refresh data
      const [applications] = await Promise.all([
        getLoanApplications(user.id)
      ]);
      setLoanApplications(applications);

      // Reset form
      setLoanType("");
      setLoanAmount("");
      setLoanPurpose("");
      setRepaymentPeriod("");
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit loan application');
    } finally {
      setSubmitting(false);
    }
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

          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>

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
            <h2 className="text-xl font-bold">Error loading loan data</h2>
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
                <h1 className="text-3xl font-bold">Loan Application</h1>
                <p className="text-muted-foreground">Apply for loans and manage your loan applications</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Max Eligible Amount</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${employeeProfile?.maxEligibleAmount?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">Based on 3x annual salary</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employeeProfile?.creditScore || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    {employeeProfile?.creditScore >= 750 ? 'Excellent' :
                        employeeProfile?.creditScore >= 650 ? 'Good' : 'Fair'} rating
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Existing Loans</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${employeeProfile?.existingLoans?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">Current outstanding</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Max Monthly EMI</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${eligibility.maxEMI}</div>
                  <p className="text-xs text-muted-foreground">40% of available income</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Apply for Loan</CardTitle>
                  <CardDescription>Submit a new loan application</CardDescription>
                </CardHeader>
                <CardContent>
                  {submitSuccess && (
                      <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                        Loan application submitted successfully!
                      </div>
                  )}
                  {submitError && (
                      <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
                        {submitError}
                      </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="loanType">Loan Type</Label>
                      <Select
                          value={loanType}
                          onValueChange={setLoanType}
                          required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                        <SelectContent>
                          {loanTypes.map((type) => (
                              <SelectItem key={type.type} value={type.type}>
                                {type.type}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                      <Input
                          id="loanAmount"
                          type="number"
                          placeholder="Enter loan amount"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          min="1"
                          max={employeeProfile?.maxEligibleAmount}
                          required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="repaymentPeriod">Repayment Period (months)</Label>
                      <Select
                          value={repaymentPeriod}
                          onValueChange={setRepaymentPeriod}
                          required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select repayment period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                          <SelectItem value="48">48 months</SelectItem>
                          <SelectItem value="60">60 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loanPurpose">Purpose of Loan</Label>
                      <Textarea
                          id="loanPurpose"
                          placeholder="Please describe the purpose of this loan"
                          value={loanPurpose}
                          onChange={(e) => setLoanPurpose(e.target.value)}
                          rows={3}
                          required
                      />
                    </div>

                    {/* Optional: File attachment
                  <div className="space-y-2">
                    <Label htmlFor="attachment">Attachment (if needed)</Label>
                    <Input id="attachment" type="file" />
                  </div> */}

                    {loanAmount && repaymentPeriod && (
                        <div className="p-3 bg-muted rounded space-y-2">
                          <div className="flex justify-between">
                            <span>Estimated Monthly Payment:</span>
                            <span className="font-bold">
                          ${calculateMonthlyPayment().toFixed(2)}
                        </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Interest Rate:</span>
                            <span>8% (estimated)</span>
                          </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Loan Eligibility</CardTitle>
                  <CardDescription>Your loan eligibility assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Eligibility Score</span>
                      <span>{eligibility.eligibilityScore.toFixed(0)}%</span>
                    </div>
                    <Progress value={eligibility.eligibilityScore} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Annual Salary:</span>
                      <span>${employeeProfile?.salary?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tenure:</span>
                      <span>{employeeProfile?.tenure || '0'} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Credit Score:</span>
                      <span>{employeeProfile?.creditScore || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Recommended Amount:</span>
                      <span className="font-bold text-green-600">
                      ${eligibility.recommendedAmount.toLocaleString()}
                    </span>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-sm text-green-800">
                      ✓ You are eligible for loans up to ${eligibility.recommendedAmount.toLocaleString()} based on your
                      profile.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Available Loan Types</CardTitle>
                <CardDescription>Different loan options available to you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {loanTypes.map((loan, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">{loan.type}</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Max Amount:</span>
                            <span>${loan.maxAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Interest Rate:</span>
                            <span>{loan.interestRate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Tenure:</span>
                            <span>{loan.maxTenure}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{loan.description}</p>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loan Application History</CardTitle>
                <CardDescription>Your previous and current loan applications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Repayment Period</TableHead>
                      <TableHead>Monthly Payment</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanApplications.map((application) => (
                        <TableRow key={application.loanId}>
                          <TableCell>{application.type}</TableCell>
                          <TableCell>${application.amount.toLocaleString()}</TableCell>
                          <TableCell className="max-w-xs truncate">{application.purpose}</TableCell>
                          <TableCell>{application.appliedDate}</TableCell>
                          <TableCell>{application.repaymentPeriod} months</TableCell>
                          <TableCell>
                            {application.monthlyPayment > 0 ? `$${application.monthlyPayment.toFixed(2)}` : "-"}
                          </TableCell>
                          <TableCell>{application.interestRate}%</TableCell>
                          <TableCell>
                            <Badge
                                variant={
                                  application.status === "Approved"
                                      ? "default"
                                      : application.status === "Under Review"
                                          ? "secondary"
                                          : "destructive"
                                }
                            >
                              {application.status}
                            </Badge>
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