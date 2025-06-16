'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {Gift, TrendingUp, Calendar, DollarSign, Clock, FileText, Award, Target, AlertCircle, Users} from "lucide-react";
import {DashboardLayout} from "@/components/layout/dashboard-layout";
import { useUser } from "@/context/user-context";
import { useEffect, useState } from "react";
import { getEmployeeBonuses, getBonusStats } from "@/app/employee/employee-bonus-check/bonusBackend";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/protectedRoute";
import { toast } from "sonner";

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

export default function EmployeeBonusCheck() {
  const { user } = useUser();
  const [bonusHistory, setBonusHistory] = useState<any[]>([]);
  const [bonusStats, setBonusStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [history, stats] = await Promise.all([
            getEmployeeBonuses(user.id),
            getBonusStats(user.id)
          ]);

          // @ts-ignore
          setBonusHistory(history);
          setBonusStats(stats);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bonus data');
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

  const upcomingBonuses = [
    {
      type: "Mid-year",
      estimatedAmount: bonusStats?.averageBonus || 0,
      expectedDate: `${new Date().getFullYear()}-06-30`,
      eligibility: "Eligible"
    },
    {
      type: "Festival",
      estimatedAmount: 1200,
      expectedDate: `${new Date().getFullYear()}-04-15`,
      eligibility: "Eligible"
    },
  ];

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
        </div>
      </DashboardLayout>
  );

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading bonus data</h2>
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
                <h1 className="text-3xl font-bold">Bonus Information</h1>
                <p className="text-muted-foreground">View your bonus history and upcoming bonuses</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bonuses</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${bonusStats?.totalBonuses?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">This year</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Bonuses</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${bonusStats?.pendingBonuses?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Awaiting payment</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Bonus</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${bonusStats?.lastBonusAmount?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {bonusStats?.lastBonusType || 'No bonus yet'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bonus Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bonusStats?.bonusRate?.toFixed(1) || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Of annual salary</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Bonus History</CardTitle>
                  <CardDescription>Your bonus payments and history</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bonusHistory.map((bonus) => (
                          <TableRow key={bonus.bonusId}>
                            <TableCell>{bonus.type}</TableCell>
                            <TableCell className="font-medium">
                              ${bonus.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>{formatDate(bonus.bonusDate)}</TableCell>
                            <TableCell>
                              <Badge variant={bonus.status === "paid" ? "default" : "secondary"}>
                                {bonus.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bonuses</CardTitle>
                  <CardDescription>Expected bonuses based on your eligibility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingBonuses.map((bonus, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{bonus.type} Bonus</h4>
                          <p className="text-sm text-muted-foreground">
                            Expected: {formatDate(bonus.expectedDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            ${bonus.estimatedAmount.toLocaleString()}
                          </p>
                          <Badge variant="outline">{bonus.eligibility}</Badge>
                        </div>
                      </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Bonus Details</CardTitle>
                <CardDescription>Detailed information about your bonuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bonusHistory.map((bonus) => (
                      <div key={bonus.bonusId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{bonus.type} Bonus</h4>
                            <Badge variant={bonus.status === "paid" ? "default" : "secondary"}>
                              {bonus.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{bonus.reason}</p>
                          <p className="text-sm text-muted-foreground">
                            Date: {formatDate(bonus.bonusDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ${bonus.amount.toLocaleString()}
                          </p>
                          {bonus.status === "paid" && (
                              <Button size="sm" variant="outline" className="mt-2">
                                View Receipt
                              </Button>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}