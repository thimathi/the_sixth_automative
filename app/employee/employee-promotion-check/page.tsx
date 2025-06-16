'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Award,
  Calendar,
  Target,
  Clock,
  DollarSign,
  FileText,
  Users,
  AlertCircle,
  AlertTriangle
} from "lucide-react"
import { useUser } from "@/context/user-context"
import { useEffect, useState } from "react"
import { getCurrentPosition, getPromotionHistory, getEligiblePositions, getPromotionCriteria } from "@/app/employee/employee-promotion-check/promotionBackend"
import { Skeleton } from "@/components/ui/skeleton"
import ProtectedRoute from "@/components/protectedRoute"
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

export default function EmployeePromotionCheck() {
  const { user } = useUser();
  const [currentPosition, setCurrentPosition] = useState<any>(null);
  const [promotionHistory, setPromotionHistory] = useState<any[]>([]);
  const [eligiblePositions, setEligiblePositions] = useState<any[]>([]);
  const [promotionCriteria, setPromotionCriteria] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const [position, history, positions, criteria] = await Promise.all([
            getCurrentPosition(user.id),
            getPromotionHistory(user.id),
            getEligiblePositions(user.id),
            getPromotionCriteria(user.id)
          ]);
          //@ts-ignore
          setCurrentPosition(position);
          //@ts-ignore
          setPromotionHistory(history);
          //@ts-ignore
          setEligiblePositions(positions);
          //@ts-ignore
          setPromotionCriteria(criteria);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch promotion data');
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

  const calculateYearsInPosition = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return (diffTime / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
  };

  const criteriaProgress = promotionCriteria.length > 0
      ? (promotionCriteria.filter((c) => c.met).length / promotionCriteria.length) * 100
      : 0;

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
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
  );

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="employee" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading promotion data</h2>
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
                <h1 className="text-3xl font-bold">Promotion Information</h1>
                <p className="text-muted-foreground">Track your career progression and promotion eligibility</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentPosition?.level || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">{currentPosition?.title || 'Current position'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Years in Position</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentPosition?.startDate ? calculateYearsInPosition(currentPosition.startDate) : '0.0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Since {currentPosition?.startDate ? formatDate(currentPosition.startDate) : 'N/A'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{promotionHistory.length}</div>
                  <p className="text-xs text-muted-foreground">Career progression</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Promotion Readiness</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{criteriaProgress.toFixed(0)}%</div>
                  <p className="text-xs text-muted-foreground">Criteria met</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Current Position</CardTitle>
                  <CardDescription>Your current role and responsibilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Position:</span>
                      <span>{currentPosition?.title || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Level:</span>
                      <span>{currentPosition?.level || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Department:</span>
                      <span>{currentPosition?.department || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Start Date:</span>
                      <span>{currentPosition?.startDate ? formatDate(currentPosition.startDate) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Time in Position:</span>
                      <span>
                      {currentPosition?.startDate ? calculateYearsInPosition(currentPosition.startDate) : '0.0'} years
                    </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Promotion Readiness</CardTitle>
                  <CardDescription>Your progress towards next promotion</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{criteriaProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={criteriaProgress} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    {promotionCriteria.map((criteria, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{criteria.category}</p>
                            <p className="text-xs text-muted-foreground">{criteria.currentStatus}</p>
                          </div>
                          <Badge variant={criteria.met ? "default" : "secondary"}>
                            {criteria.met ? "Met" : "Pending"}
                          </Badge>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Eligible Positions</CardTitle>
                <CardDescription>Positions you can be promoted to</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eligiblePositions.map((position, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{position.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {position.level} • {position.department}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              +${position.estimatedSalaryIncrease?.toLocaleString() || '0'}
                            </p>
                            <p className="text-xs text-muted-foreground">Estimated increase</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Requirements:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {position.requirements?.map((req: string, reqIndex: number) => (
                                <li key={reqIndex}>• {req}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 flex justify-between items-center">
                          <Badge variant="outline">{position.eligibilityStatus || 'Eligibility pending'}</Badge>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promotion History</CardTitle>
                <CardDescription>Your career progression timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>From Position</TableHead>
                      <TableHead>To Position</TableHead>
                      <TableHead>Salary Increase</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotionHistory.map((promotion) => (
                        <TableRow key={promotion.promotionId}>
                          <TableCell>{formatDate(promotion.promotionDate)}</TableCell>
                          <TableCell>{promotion.oldPosition}</TableCell>
                          <TableCell className="font-medium">{promotion.newPosition}</TableCell>
                          <TableCell className="text-green-600 font-medium">
                            +${promotion.salaryIncrease?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{promotion.reason || 'Performance based'}</TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Career Development Tips</CardTitle>
                <CardDescription>How to improve your promotion prospects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Skill Development</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Complete remaining certification requirements</li>
                      <li>• Attend leadership training programs</li>
                      <li>• Develop customer service skills</li>
                      <li>• Learn new automotive technologies</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Performance Excellence</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Maintain excellent performance ratings</li>
                      <li>• Take on additional responsibilities</li>
                      <li>• Mentor junior team members</li>
                      <li>• Contribute to process improvements</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  );
}