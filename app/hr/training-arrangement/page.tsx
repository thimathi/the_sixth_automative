"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Calendar, GraduationCap, TrendingUp, DollarSign, Plus, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  getTrainingSessions,
  createTrainingSession,
  getTrainingStats,
  getDepartments
} from "./training-arrangement-backend"
import { Skeleton } from "@/components/ui/skeleton"
import ProtectedRoute from "@/components/protectedRoute"

const navigation = [
  { name: "Dashboard", href: "/hr/dashboard", icon: Users },
  { name: "Employee Management", href: "/hr/employee-management", icon: Users },
  { name: "Employee Registration", href: "/hr/employee-registration", icon: UserPlus },
  { name: "Leave Arrangement", href: "/hr/leave-arrangement", icon: Calendar },
  { name: "Training Arrangement", href: "/hr/training-arrangement", icon: GraduationCap },
  { name: "KPI Generation", href: "/hr/kpi-generation", icon: TrendingUp },
  { name: "Add Salary", href: "/hr/add-salary", icon: DollarSign },
]

export default function TrainingArrangementPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trainingSessions, setTrainingSessions] = useState<any[]>([])
  const [trainingStats, setTrainingStats] = useState<any>(null)
  const [departments, setDepartments] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchTerm, setSearchTerm] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    department: "",
    trainer: "",
    location: "",
    maxParticipants: "",
    description: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [sessions, stats, depts] = await Promise.all([
          getTrainingSessions(),
          getTrainingStats(),
          getDepartments()
        ])
        setTrainingSessions(sessions)
        setTrainingStats(stats)
        setDepartments(depts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch training data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateTraining = async () => {
    try {
      setLoading(true)
      await createTrainingSession(formData)
      const updatedSessions = await getTrainingSessions()
      setTrainingSessions(updatedSessions)
      setDialogOpen(false)
      toast({
        title: "Training scheduled successfully",
        description: "The new training session has been created.",
        variant: "default",
      })
      // Reset form
      setFormData({
        title: "",
        startDate: "",
        endDate: "",
        department: "",
        trainer: "",
        location: "",
        maxParticipants: "",
        description: ""
      })
    } catch (err) {
      toast({
        title: "Error creating training",
        description: err instanceof Error ? err.message : 'Failed to create training session',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = trainingSessions
      .filter(session => {
        if (activeTab === "upcoming") return session.status === "Upcoming"
        if (activeTab === "completed") return session.status === "Completed"
        return true
      })
      .filter(session =>
          session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.trainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.department.toLowerCase().includes(searchTerm.toLowerCase())
      )

  if (loading) return (
      <DashboardLayout navigation={navigation} userRole="hr" userName="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-24" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
  )

  if (error) return (
      <DashboardLayout navigation={navigation} userRole="hr" userName="Error">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <GraduationCap className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Error loading training data</h2>
            <p className="text-gray-600">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
  )

  return (
      <ProtectedRoute allowedRoles={['hr']}>
        <DashboardLayout navigation={navigation} userRole="hr" userName="Michael Chen">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Training Arrangement</h1>
              <p className="text-gray-600">Manage employee training programs and sessions.</p>
            </div>

            {/* Training Overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Trainings</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trainingStats?.upcomingTrainings || 0}</div>
                  <p className="text-xs text-muted-foreground">Next 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Trainings</CardTitle>
                  <GraduationCap className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trainingStats?.completedTrainings || 0}</div>
                  <p className="text-xs text-muted-foreground">This year</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Training Budget</CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${trainingStats?.budgetUsed || 0}</div>
                  <p className="text-xs text-muted-foreground">${trainingStats?.totalBudget || 0} allocated</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trainers</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trainingStats?.trainersCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Internal & external</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Add */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                    type="search"
                    placeholder="Search trainings..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Training
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Schedule New Training</DialogTitle>
                    <DialogDescription>Fill in the details to create a new training session.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Training Title</Label>
                      <Input
                          id="title"
                          placeholder="Enter training title"
                          value={formData.title}
                          onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                            value={formData.department}
                            onValueChange={(value) => handleSelectChange('department', value)}
                        >
                          <SelectTrigger id="department">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="trainer">Trainer</Label>
                        <Input
                            id="trainer"
                            placeholder="Trainer name"
                            value={formData.trainer}
                            onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            placeholder="Training location"
                            value={formData.location}
                            onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="maxParticipants">Max Participants</Label>
                        <Input
                            id="maxParticipants"
                            type="number"
                            placeholder="Enter number"
                            value={formData.maxParticipants}
                            onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Training Description</Label>
                      <Textarea
                          id="description"
                          placeholder="Enter training details..."
                          value={formData.description}
                          onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTraining} disabled={loading}>
                      {loading ? "Scheduling..." : "Schedule Training"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Training List */}
            <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Training Sessions</CardTitle>
                    <CardDescription>Trainings scheduled in the coming weeks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredSessions.length > 0 ? (
                        <div className="rounded-md border">
                          <div className="grid grid-cols-6 bg-gray-100 p-4 font-medium text-sm">
                            <div className="col-span-2">Training</div>
                            <div>Department</div>
                            <div>Date</div>
                            <div>Participants</div>
                            <div>Actions</div>
                          </div>
                          <div className="divide-y">
                            {filteredSessions.map((session) => (
                                <div key={session.id} className="grid grid-cols-6 p-4 text-sm items-center">
                                  <div className="col-span-2">
                                    <div className="font-medium">{session.title}</div>
                                    <div className="text-xs text-gray-500">Trainer: {session.trainer}</div>
                                  </div>
                                  <div>{session.department}</div>
                                  <div>
                                    <div>{new Date(session.startDate).toLocaleDateString()}</div>
                                    <div className="text-xs text-gray-500">{session.duration}</div>
                                  </div>
                                  <div>{session.participants} registered</div>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                    <Button size="sm">Manage</Button>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-32 text-gray-500">
                          No upcoming training sessions found
                        </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="completed" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Training Sessions</CardTitle>
                    <CardDescription>Past training sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredSessions.length > 0 ? (
                        <div className="rounded-md border">
                          <div className="grid grid-cols-6 bg-gray-100 p-4 font-medium text-sm">
                            <div className="col-span-2">Training</div>
                            <div>Department</div>
                            <div>Date</div>
                            <div>Participants</div>
                            <div>Actions</div>
                          </div>
                          <div className="divide-y">
                            {filteredSessions.map((session) => (
                                <div key={session.id} className="grid grid-cols-6 p-4 text-sm items-center">
                                  <div className="col-span-2">
                                    <div className="font-medium">{session.title}</div>
                                    <div className="text-xs text-gray-500">Trainer: {session.trainer}</div>
                                  </div>
                                  <div>{session.department}</div>
                                  <div>
                                    <div>{new Date(session.startDate).toLocaleDateString()}</div>
                                    <div className="text-xs text-gray-500">{session.duration}</div>
                                  </div>
                                  <div>{session.participants} attended</div>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                      Report
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      Feedback
                                    </Button>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-32 text-gray-500">
                          No completed training sessions found
                        </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="all" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Training Sessions</CardTitle>
                    <CardDescription>Complete list of training sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trainingSessions.length > 0 ? (
                        <div className="rounded-md border">
                          <div className="grid grid-cols-7 bg-gray-100 p-4 font-medium text-sm">
                            <div className="col-span-2">Training</div>
                            <div>Department</div>
                            <div>Date</div>
                            <div>Participants</div>
                            <div>Status</div>
                            <div>Actions</div>
                          </div>
                          <div className="divide-y">
                            {trainingSessions.map((session) => (
                                <div key={session.id} className="grid grid-cols-7 p-4 text-sm items-center">
                                  <div className="col-span-2">
                                    <div className="font-medium">{session.title}</div>
                                    <div className="text-xs text-gray-500">Trainer: {session.trainer}</div>
                                  </div>
                                  <div>{session.department}</div>
                                  <div>
                                    <div>{new Date(session.startDate).toLocaleDateString()}</div>
                                    <div className="text-xs text-gray-500">{session.duration}</div>
                                  </div>
                                  <div>{session.participants}</div>
                                  <div>
                                    <Badge
                                        variant={
                                          session.status === "Upcoming"
                                              ? "default"
                                              : session.status === "Completed"
                                                  ? "secondary"
                                                  : "outline"
                                        }
                                    >
                                      {session.status}
                                    </Badge>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-32 text-gray-500">
                          No training sessions found
                        </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Training Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Training Calendar</CardTitle>
                <CardDescription>Monthly view of scheduled trainings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-7 gap-1 font-medium text-sm text-center">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>
                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }, (_, i) => i + 1).map((day) => {
                      const hasTraining = trainingSessions.some(session => {
                        const sessionDate = new Date(session.startDate).getDate()
                        return sessionDate === (day <= 31 ? day : day - 31)
                      })

                      return (
                          <div key={day} className="aspect-square border rounded-md p-1">
                            <div className="text-xs font-medium">{day <= 31 ? day : day - 31}</div>
                            {hasTraining && (
                                <div className="mt-1 bg-blue-100 text-blue-800 text-[10px] p-0.5 rounded">Training</div>
                            )}
                          </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
  )
}