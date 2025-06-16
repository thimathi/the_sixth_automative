'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Award,
  Building,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Filter,
  PlusCircle,
  Search,
  Star,
  TrendingUp,
  Users
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { fetchPromotionData, getReadinessVariant } from "./mdPromoteEmployeesBackend";
import { getMDNavigation } from "@/app/md/dashboard/mdDashboardBackend";
import { useUser } from "@/context/user-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/md/dashboard", icon: Building },
  { name: "Meeting Management", href: "/md/meeting-management", icon: Calendar },
  { name: "Performance Management", href: "/md/performance-management", icon: TrendingUp },
  { name: "Promote Employees", href: "/md/promote-employees", icon: Award }
]

export default function PromoteEmployeesPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [promotionData, setPromotionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role !== 'md') {
      router.push('/');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchPromotionData(user?.empId || '');
        setPromotionData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load promotion data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'md') {
      loadData();
    }
  }, [user, userLoading, router]);

  if (userLoading || loading) {
    return (
        <DashboardLayout navigation={navigation} userRole="md" userName="Loading...">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </DashboardLayout>
    );
  }

  if (error) {
    return (
        <DashboardLayout navigation={navigation} userRole="md" userName="Loading...">
          <div className="flex items-center justify-center h-screen">
            <div className="text-red-500">{error}</div>
          </div>
        </DashboardLayout>
    );
  }

  if (!promotionData) {
    return (
        <DashboardLayout navigation={navigation} userRole="md" userName="Loading...">
          <div className="flex items-center justify-center h-screen">
            <div>No promotion data available</div>
          </div>
        </DashboardLayout>
    );
  }

  return (
      <DashboardLayout navigation={navigation} userRole="md" userName="Loading...">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Promote Employees</h1>
              <p className="text-muted-foreground">
                Manage employee promotions and career advancement at The Sixth Automotive
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Promotion
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promotion Candidates</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{promotionData.stats.candidates}</div>
                <p className="text-xs text-muted-foreground">Eligible for promotion</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{promotionData.stats.pendingReviews}</div>
                <p className="text-xs text-muted-foreground">Awaiting final approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promotions This Year</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{promotionData.stats.promotionsThisYear}</div>
                <p className="text-xs text-muted-foreground">+6 from last year</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{promotionData.stats.successRate}%</div>
                <p className="text-xs text-muted-foreground">Promotion success rate</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="candidates" className="w-full">
            <TabsList>
              <TabsTrigger value="candidates">Promotion Candidates</TabsTrigger>
              <TabsTrigger value="process">Promotion Process</TabsTrigger>
              <TabsTrigger value="history">Promotion History</TabsTrigger>
              <TabsTrigger value="criteria">Promotion Criteria</TabsTrigger>
            </TabsList>
            <TabsContent value="candidates" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search candidates..." className="pl-8" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="parts">Parts</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="admin">Administrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Promotion Candidates</CardTitle>
                  <CardDescription>Employees eligible for promotion based on performance and tenure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {promotionData.promotionCandidates.map((candidate: any) => (
                        <div key={candidate.id} className="rounded-lg border p-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                                <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">{candidate.name}</h3>
                                <p className="text-sm text-muted-foreground">{candidate.currentPosition}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge variant="outline">{candidate.department}</Badge>
                                  <Badge variant="secondary">{candidate.tenure} years</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-start gap-2 md:items-end">
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {Array(5)
                                      .fill(0)
                                      .map((_, i) => (
                                          <Star
                                              key={i}
                                              className={`h-4 w-4 ${
                                                  i < Math.floor(candidate.performanceRating)
                                                      ? "fill-amber-500 text-amber-500"
                                                      : "text-muted-foreground"
                                              }`}
                                          />
                                      ))}
                                </div>
                                <span className="font-medium">{candidate.performanceRating.toFixed(1)}</span>
                              </div>
                              <Badge variant={getReadinessVariant(candidate.readiness)}>
                                {candidate.readiness}
                              </Badge>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Proposed Promotion</h4>
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium">New Position:</span> {candidate.proposedPosition}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Salary Increase:</span> {candidate.salaryIncrease}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Effective Date:</span> {candidate.effectiveDate}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Readiness Assessment</h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Skills</span>
                                  <span>{candidate.assessment.skills}%</span>
                                </div>
                                <Progress value={candidate.assessment.skills} className="h-2" />
                                <div className="flex items-center justify-between text-sm">
                                  <span>Leadership</span>
                                  <span>{candidate.assessment.leadership}%</span>
                                </div>
                                <Progress value={candidate.assessment.leadership} className="h-2" />
                                <div className="flex items-center justify-between text-sm">
                                  <span>Experience</span>
                                  <span>{candidate.assessment.experience}%</span>
                                </div>
                                <Progress value={candidate.assessment.experience} className="h-2" />
                              </div>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">Last Review: {candidate.lastReview}</div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                Review Details
                              </Button>
                              <Button size="sm">Initiate Promotion</Button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="process" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Initiate Promotion Process</CardTitle>
                  <CardDescription>Start the promotion process for a selected employee</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="employee-select">Select Employee</Label>
                        <Select>
                          <SelectTrigger id="employee-select">
                            <SelectValue placeholder="Choose employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {promotionData.promotionCandidates.map((candidate: any) => (
                                <SelectItem
                                    key={candidate.id}
                                    value={candidate.id.toString()}
                                >
                                  {candidate.name} - {candidate.currentPosition}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="promotion-type">Promotion Type</Label>
                        <Select>
                          <SelectTrigger id="promotion-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="position">Position Advancement</SelectItem>
                            <SelectItem value="salary">Salary Increase</SelectItem>
                            <SelectItem value="both">Position & Salary</SelectItem>
                            <SelectItem value="lateral">Lateral Move</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="current-position">Current Position</Label>
                        <Input id="current-position" placeholder="Current position" readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-position">New Position</Label>
                        <Input id="new-position" placeholder="Enter new position" />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="current-salary">Current Salary</Label>
                        <Input id="current-salary" placeholder="Current salary" readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-salary">New Salary</Label>
                        <Input id="new-salary" placeholder="Enter new salary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Effective Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>Pick effective date</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="justification">Promotion Justification</Label>
                      <Textarea
                          id="justification"
                          placeholder="Provide detailed justification for this promotion..."
                          className="min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="approvers">Required Approvers</Label>
                      <div className="rounded-md border p-4">
                        <div className="space-y-2">
                          {promotionData.requiredApprovers.map((approver: any) => (
                              <div key={approver.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={approver.avatar} alt={approver.name} />
                                    <AvatarFallback>{approver.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{approver.name}</p>
                                    <p className="text-xs text-muted-foreground">{approver.position}</p>
                                  </div>
                                </div>
                                <Badge variant="outline">{approver.role}</Badge>
                              </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Save as Draft</Button>
                  <Button>Submit for Approval</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Promotion History</CardTitle>
                  <CardDescription>Recent promotions and their outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {promotionData.promotionHistory.map((promotion: any) => (
                        <div key={promotion.id} className="rounded-lg border p-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={promotion.employee.avatar}
                                    alt={promotion.employee.name}
                                />
                                <AvatarFallback>{promotion.employee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">{promotion.employee.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {promotion.fromPosition} → {promotion.toPosition}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-start gap-2 md:items-end">
                              <Badge
                                  variant={
                                    promotion.status === "Completed"
                                        ? "default"
                                        : promotion.status === "Pending"
                                            ? "secondary"
                                            : "destructive"
                                  }
                              >
                                {promotion.status}
                              </Badge>
                              <div className="text-sm text-muted-foreground">{promotion.date}</div>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">Salary Change:</span> {promotion.salaryChange}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Department:</span> {promotion.department}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">Approved By:</span> {promotion.approvedBy}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Effective Date:</span> {promotion.effectiveDate}
                              </p>
                            </div>
                          </div>
                          {promotion.notes && (
                              <>
                                <Separator className="my-4" />
                                <div className="text-sm">
                                  <span className="font-medium">Notes:</span> {promotion.notes}
                                </div>
                              </>
                          )}
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="criteria" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Promotion Criteria</CardTitle>
                  <CardDescription>Standards and requirements for employee promotions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {promotionData.promotionCriteria.map((criteria: any) => (
                        <div key={criteria.position} className="space-y-4">
                          <h3 className="text-lg font-medium">{criteria.position}</h3>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Requirements</h4>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {criteria.requirements.map((requirement: string, index: number) => (
                                    <li key={index}>• {requirement}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Qualifications</h4>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {criteria.qualifications.map((qualification: string, index: number) => (
                                    <li key={index}>• {qualification}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-4">
                            <h4 className="mb-2 text-sm font-medium">Salary Range</h4>
                            <p className="text-sm">{criteria.salaryRange}</p>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
  );
}