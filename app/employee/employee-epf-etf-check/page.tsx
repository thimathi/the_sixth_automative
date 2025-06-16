'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  PiggyBank,
  TrendingUp,
  FileText,
  Calculator,
  Clock,
  Calendar,
  DollarSign,
  Award,
  Users,
  AlertCircle, Target
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useUser } from "@/context/user-context";
import { useEffect, useState } from "react";
import { getEPFETFDetails, getContributionHistory } from "@/app/employee/employee-epf-etf-check/epfEtfBackend";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/protectedRoute";


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

export default function EmployeeEpfEtfCheck() {
  const { user } = useUser();
  const [epfEtfDetails, setEpfEtfDetails] = useState<any>(null);
  const [contributionHistory, setContributionHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [details, history] = await Promise.all([
            getEPFETFDetails(user.id),
            getContributionHistory(user.id)
          ]);

          setEpfEtfDetails(details);
          //@ts-ignore
          setContributionHistory(history);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch EPF/ETF data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const retirementAge = 60;
  //@ts-ignore
  const currentAge = user?.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : 32;
  const yearsToRetirement = retirementAge - currentAge;
  const retirementProgress = (currentAge / retirementAge) * 100;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
            <h2 className="text-xl font-bold">Error loading EPF/ETF data</h2>
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
                <h1 className="text-3xl font-bold">EPF & ETF Information</h1>
                <p className="text-muted-foreground">View your provident fund and trust fund details</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">EPF Balance</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(epfEtfDetails?.epfBalance || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{formatCurrency(epfEtfDetails?.totalEpfContribution || 0)}/month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ETF Balance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(epfEtfDetails?.etfBalance || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{formatCurrency(epfEtfDetails?.etfContribution || 0)}/month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                        (epfEtfDetails?.totalEpfContribution || 0) +
                        (epfEtfDetails?.etfContribution || 0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">EPF + ETF contributions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Years to Retirement</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{yearsToRetirement}</div>
                  <p className="text-xs text-muted-foreground">At age {retirementAge}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>EPF Details</CardTitle>
                  <CardDescription>Employee Provident Fund information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">EPF Number:</span>
                      <span className="text-sm">{epfEtfDetails?.epfNumber || 'Not available'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Current Balance:</span>
                      <span className="text-sm font-bold">
                      {formatCurrency(epfEtfDetails?.epfBalance || 0)}
                    </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Your Contribution (8%):</span>
                      <span className="text-sm">
                      {formatCurrency(epfEtfDetails?.employeeEpfContribution || 0)}
                    </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Employer Contribution (8%):</span>
                      <span className="text-sm">
                      {formatCurrency(epfEtfDetails?.employerEpfContribution || 0)}
                    </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Monthly:</span>
                      <span className="font-bold">
                      {formatCurrency(epfEtfDetails?.totalEpfContribution || 0)}
                    </span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded">
                    <h4 className="font-medium mb-2">Retirement Projection</h4>
                    <p className="text-2xl font-bold">
                      {formatCurrency(epfEtfDetails?.epfProjectedBalance || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Estimated balance at retirement</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ETF Details</CardTitle>
                  <CardDescription>Employee Trust Fund information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">ETF Number:</span>
                      <span className="text-sm">{epfEtfDetails?.etfNumber || 'Not available'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Current Balance:</span>
                      <span className="text-sm font-bold">
                      {formatCurrency(epfEtfDetails?.etfBalance || 0)}
                    </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Employer Contribution (2.5%):</span>
                      <span className="text-sm">
                      {formatCurrency(epfEtfDetails?.etfContribution || 0)}
                    </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Your Contribution:</span>
                      <span className="text-sm">$0 (Employer funded)</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded">
                    <h4 className="font-medium mb-2">Projected Balance</h4>
                    <p className="text-2xl font-bold">
                      {formatCurrency(epfEtfDetails?.etfProjectedBalance || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Estimated balance at retirement</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Retirement Progress</CardTitle>
                <CardDescription>Your journey towards retirement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Retirement Age</span>
                    <span>{retirementProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={retirementProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current Age: {currentAge}</span>
                    <span>Retirement Age: {retirementAge}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-4 bg-muted rounded">
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                          (epfEtfDetails?.epfBalance || 0) +
                          (epfEtfDetails?.etfBalance || 0)
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Current Balance</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                          (epfEtfDetails?.totalEpfContribution || 0) +
                          (epfEtfDetails?.etfContribution || 0)
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Monthly Contributions</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                          (epfEtfDetails?.epfProjectedBalance || 0) +
                          (epfEtfDetails?.etfProjectedBalance || 0)
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Projected Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contribution History</CardTitle>
                <CardDescription>Recent EPF and ETF contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Statement
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>EPF (Employee)</TableHead>
                      <TableHead>EPF (Employer)</TableHead>
                      <TableHead>ETF</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributionHistory.map((contribution: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(contribution.appliedDate)}</TableCell>
                          <TableCell>{formatCurrency(contribution.epfCalculation)}</TableCell>
                          <TableCell>{formatCurrency(contribution.epfCalculation)}</TableCell>
                          <TableCell>{formatCurrency(contribution.etfCalculation)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(
                                contribution.epfCalculation * 2 +
                                contribution.etfCalculation
                            )}
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