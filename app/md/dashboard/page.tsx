'use client'

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Users, TrendingUp, Calendar, Award, Target, DollarSign, BarChart3, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchMDDashboardData, getMDNavigation } from "@/app/md/dashboard/mdDashboardBackend";
import { useUser } from "@/context/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/protectedRoute";
import { useRouter } from "next/navigation";

const navigation = getMDNavigation();

export default function MDDashboard() {
    const { user } = useUser();
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (user?.id) {
                    const data = await fetchMDDashboardData(user.id);
                    if (data.error) throw new Error(data.error);
                    setDashboardData(data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        }).format(value / 1000000) + 'M';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return (
        //@ts-ignore
        <DashboardLayout navigation={navigation} userRole="md" userName="Loading...">
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
        //@ts-ignore
        <DashboardLayout navigation={navigation} userRole="md" userName="Error">
            <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
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
        <ProtectedRoute allowedRoles={['md']}>
            <DashboardLayout
                //@ts-ignore
                navigation={navigation}
                userRole="md"
                //@ts-ignore
                userName={`${user?.firstName} ${user?.lastName}` || 'Managing Director'}
            >
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Managing Director Dashboard</h1>
                            <p className="text-gray-600">Strategic oversight and executive management</p>
                        </div>

                        {dashboardData && (
                            <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <Building className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Managing Director</p>
                                    <p className="text-sm text-gray-600">
                                        Company Performance: {dashboardData.performance.score}%
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Revenue Change: {dashboardData.revenue.change >= 0 ? '+' : ''}{dashboardData.revenue.change}%
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {dashboardData ? formatCurrency(dashboardData.revenue.total) : 'N/A'}
                                </div>
                                <p className={`text-xs ${dashboardData?.revenue.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {dashboardData?.revenue.change >= 0 ? '+' : ''}{dashboardData?.revenue.change || 0}% from last quarter
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Company Performance</CardTitle>
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {dashboardData?.performance.score || 0}%
                                </div>
                                <p className="text-xs text-muted-foreground">Overall efficiency</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Employee Satisfaction</CardTitle>
                                <Users className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {dashboardData?.satisfaction.avg_satisfaction.toFixed(1) || 0}/5
                                </div>
                                <p className="text-xs text-muted-foreground">Average rating</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Strategic Goals</CardTitle>
                                <Target className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {dashboardData?.goals.achieved || 0}/{dashboardData?.goals.total || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">Achieved this year</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Department Performance and Meetings */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Department Performance</CardTitle>
                                <CardDescription>Key metrics by department</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {dashboardData?.departments.map((dept: any) => (
                                    <div key={dept.name} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-medium">{dept.name}</h3>
                                            <Badge variant={dept.performance > 85 ? 'default' : dept.performance > 70 ? 'secondary' : 'destructive'}>
                                                {dept.performance}%
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{dept.metric}: {dept.value}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Meetings</CardTitle>
                                <CardDescription>Your scheduled executive meetings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {dashboardData?.meetings.map((meeting: any) => (
                                    <div key={meeting.topic} className="flex items-start gap-4">
                                        <div className={`p-2 rounded-lg ${
                                            meeting.type === 'board' ? 'bg-red-100' :
                                                meeting.type === 'department' ? 'bg-blue-100' : 'bg-green-100'
                                        }`}>
                                            <Calendar className={`h-5 w-5 ${
                                                meeting.type === 'board' ? 'text-red-600' :
                                                    meeting.type === 'department' ? 'text-blue-600' : 'text-green-600'
                                            }`} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{meeting.topic}</h3>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(meeting.date)}
                                            </p>
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
                            <CardDescription>Frequently used executive functions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <Button
                                    variant="outline"
                                    className="h-20 flex-col"
                                    onClick={() => router.push('/md/meeting-management')}
                                >
                                    <Calendar className="h-6 w-6 mb-2" />
                                    Schedule Meeting
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-20 flex-col"
                                    onClick={() => router.push('/md/performance-management')}
                                >
                                    <TrendingUp className="h-6 w-6 mb-2" />
                                    Performance Review
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-20 flex-col"
                                    onClick={() => router.push('/md/promote-employees')}
                                >
                                    <Award className="h-6 w-6 mb-2" />
                                    Promote Employee
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-20 flex-col"
                                    onClick={() => router.push('/md/analytics')}
                                >
                                    <BarChart3 className="h-6 w-6 mb-2" />
                                    View Analytics
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}