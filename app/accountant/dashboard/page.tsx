'use client'

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calculator, DollarSign, TrendingUp, FileText, PiggyBank, Clock,
  CreditCard, User, Calendar, AlertCircle, CheckCircle, XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAccountantDashboardData, getAccountantDetails} from "@/app/accountant/dashboard/accountantDashboardBackend";
import { useUser } from "@/context/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import  ProtectedRoute  from "@/components/protectedRoute"

const navigation = [
  { name: "Dashboard", href: "/accountant/dashboard", icon: Calculator },
  { name: "Salary Calculation", href: "/accountant/salary-calculation", icon: DollarSign },
  { name: "Bonus Calculation", href: "/accountant/bonus-calculation", icon: TrendingUp },
  { name: "OT Calculation", href: "/accountant/ot-calculation", icon: Clock },
  { name: "EPF/ETF Management", href: "/accountant/epf-etf-management", icon: PiggyBank },
  { name: "Increment Management", href: "/accountant/increment-management", icon: TrendingUp },
  { name: "Loan Eligibility Check", href: "/accountant/check-loan-eligibility", icon: CreditCard },
];

export default function AccountantDashboard() {

  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [accountantDetails, setAccountantDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [dashboardRes, detailsRes] = await Promise.all([
            getAccountantDashboardData(user.id),
            getAccountantDetails(user.id)
          ]);

          if (dashboardRes.error) throw new Error(dashboardRes.error);
          if (detailsRes.error) throw new Error(detailsRes.error);

          setDashboardData(dashboardRes);
          setAccountantDetails(detailsRes.details);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'urgent': return 'destructive';
      case 'in-progress': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'urgent': return <AlertCircle className="h-4 w-4 mr-1" />;
      case 'in-progress': return <Clock className="h-4 w-4 mr-1" />;
      default: return <CheckCircle className="h-4 w-4 mr-1" />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'salary': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'bonus': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'ot': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'epf': return <PiggyBank className="h-4 w-4 text-purple-600" />;
      case 'increment': return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case 'loan': return <CreditCard className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBgColor = (type: string) => {
    switch (type) {
      case 'salary': return 'bg-green-100';
      case 'bonus': return 'bg-blue-100';
      case 'ot': return 'bg-orange-100';
      case 'epf': return 'bg-purple-100';
      case 'increment': return 'bg-yellow-100';
      case 'loan': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return (
      <DashboardLayout navigation={navigation} userRole="accountant" userName="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
            ))}
          </div>

          <Skeleton className="h-48" />
        </div>
      </DashboardLayout>
  );

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="accountant" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading dashboard</h2>
            <p className="text-gray-600">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
  );

  return (
      <ProtectedRoute allowedRoles={['accountant']}>
      <DashboardLayout
          navigation={navigation}
          userRole="accountant"
          userName={accountantDetails?.fullName || 'Accountant'}
      >
        <div className="space-y-6">
          {/* Header with accountant stats */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Accountant Dashboard</h1>
              <p className="text-gray-600">Manage payroll, calculations, and financial operations.</p>
            </div>

            {accountantDetails && (
                <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{accountantDetails.position}</p>
                    <p className="text-sm text-gray-600">
                      Salary: ${accountantDetails.salary?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-600">
                      KPI: {accountantDetails.kpi.value} ({accountantDetails.kpi.rank})
                    </p>
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{accountantDetails.attendanceStats.presentDays} present</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>{accountantDetails.attendanceStats.absentDays} absent</span>
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dashboardData?.financialOverview?.monthlyPayroll?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">Current month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bonus Payments</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dashboardData?.financialOverview?.bonusPayments?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">OT Payments</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dashboardData?.financialOverview?.otPayments?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">Current month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">EPF/ETF</CardTitle>
                <PiggyBank className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dashboardData?.financialOverview?.epfEtfContributions?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">Contributions this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals and Recent Transactions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Tasks requiring your attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Salary Increments</p>
                      <p className="text-xs text-gray-500">
                        {dashboardData?.pendingIncrementsCount || 0} pending requests
                      </p>
                    </div>
                  </div>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/accountant/increment-management'}
                  >
                    Review
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Loan Requests</p>
                      <p className="text-xs text-gray-500">
                        {dashboardData?.pendingLoanRequestsCount || 0} pending applications
                      </p>
                    </div>
                  </div>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/accountant/check-loan-eligibility'}
                  >
                    Review
                  </Button>
                </div>

                {dashboardData?.pendingTasks?.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          {task.employeeName} • Due: {formatDate(task.deadline)}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(task.status)}>
                        {getStatusIcon(task.status)}
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest financial activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.recentTransactions?.map((transaction: any) => (
                    <div
                        key={transaction.id}
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          // Navigate to relevant page based on transaction type
                          const routeMap: Record<string, string> = {
                            'salary': '/accountant/salary-calculation',
                            'bonus': '/accountant/bonus-calculation',
                            'ot': '/accountant/ot-calculation',
                            'epf': '/accountant/epf-etf-management'
                          };
                          if (routeMap[transaction.type]) {
                            window.location.href = routeMap[transaction.type];
                          }
                        }}
                    >
                      <div className={`${getTransactionBgColor(transaction.type)} p-2 rounded-full`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1 ml-3">
                        <p className="text-sm font-medium">{transaction.title}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.employeeName} • {formatDate(transaction.date)}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        ${transaction.amount?.toLocaleString()}
                      </div>
                    </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used accounting functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {dashboardData?.quickActions?.map((action: any) => (
                    <Button
                        key={action.id}
                        variant="outline"
                        className="h-20 flex-col"
                        onClick={() => window.location.href = action.route}
                    >
                      {action.icon === 'Calculator' && <Calculator className="h-6 w-6 mb-2" />}
                      {action.icon === 'TrendingUp' && <TrendingUp className="h-6 w-6 mb-2" />}
                      {action.icon === 'Clock' && <Clock className="h-6 w-6 mb-2" />}
                      {action.icon === 'PiggyBank' && <PiggyBank className="h-6 w-6 mb-2" />}
                      {action.icon === 'CreditCard' && <CreditCard className="h-6 w-6 mb-2" />}
                      {action.icon === 'FileText' && <FileText className="h-6 w-6 mb-2" />}
                      <span className="text-xs">{action.title}</span>
                    </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
      </ProtectedRoute>
  );
}