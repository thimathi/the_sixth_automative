"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  CheckCircle2,
  Clock, CreditCard, FileText,
  Filter,
  ListTodo,
  PlusCircle,
  Search,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useUser } from "@/context/user-context"
import { useState, useEffect } from "react"
import {
  getActiveTasks,
  getCompletedTasks,
  getTaskTemplates,
  createTask,
  updateTaskStatus,
  saveTaskTemplate
} from "./task-management-backend"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  type: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  assignee: {
    id: string;
    name: string;
    position: string;
    avatar?: string;
  };
  vehicleInfo?: {
    make?: string;
    model?: string;
    licensePlate?: string;
  };
}

interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  defaultAssignee?: string;
}

const navigation = [
  { name: "Dashboard", href: "/manager/dashboard", icon: Users },
  { name: "Task Management", href: "/manager/task-management", icon: ListTodo },
  { name: "Leave Management", href: "/manager/leave-management", icon: Calendar },
  { name: "Loan Management", href: "/manager/loan-management", icon: CreditCard },
  { name: "Performance Rating", href: "/manager/performance-rating", icon: TrendingUp },
  { name: "Report Generation", href: "/manager/report-generation", icon: FileText },
];

export default function TaskManagementPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("assign")
  const [activeTasks, setActiveTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")

  // Form state for new task
  const [taskTitle, setTaskTitle] = useState("")
  const [taskPriority, setTaskPriority] = useState("")
  const [taskType, setTaskType] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [taskDescription, setTaskDescription] = useState("")
  const [assignee, setAssignee] = useState("")
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleLicense, setVehicleLicense] = useState("")

  // Sample employees data (in a real app, this would come from your backend)
  const employees = [
    { id: "james", name: "James Wilson", position: "Senior Mechanic" },
    { id: "sarah", name: "Sarah Chen", position: "Service Advisor" },
    { id: "miguel", name: "Miguel Rodriguez", position: "Parts Specialist" },
    { id: "aisha", name: "Aisha Johnson", position: "Junior Mechanic" },
    { id: "robert", name: "Robert Lee", position: "Diagnostic Technician" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        if (user?.id) {
          const [activeRes, completedRes, templatesRes] = await Promise.all([
            getActiveTasks(user.id),
            getCompletedTasks(user.id),
            getTaskTemplates(user.id)
          ])

          if (activeRes.error) throw new Error(activeRes.error)
          if (completedRes.error) throw new Error(completedRes.error)
          if (templatesRes.error) throw new Error(templatesRes.error)

          setActiveTasks(activeRes.data)
          setCompletedTasks(completedRes.data)
          setTaskTemplates(templatesRes.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch task data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  const handleCreateTask = async () => {
    try {
      if (!user?.id) return
      if (!taskTitle || !taskPriority || !taskType || !dueDate || !assignee) {
        throw new Error("Please fill all required fields")
      }

      const response = await createTask(user.id, {
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        type: taskType,
        dueDate: dueDate.toISOString(),
        assigneeId: assignee,
        vehicleInfo: {
          make: vehicleMake,
          model: vehicleModel,
          licensePlate: vehicleLicense
        }
      })

      if (response.error) throw new Error(response.error)

      // Refresh active tasks
      const activeRes = await getActiveTasks(user.id)
      if (activeRes.error) throw new Error(activeRes.error)
      setActiveTasks(activeRes.data)

      // Reset form
      setTaskTitle("")
      setTaskPriority("")
      setTaskType("")
      setDueDate(undefined)
      setTaskDescription("")
      setAssignee("")
      setVehicleMake("")
      setVehicleModel("")
      setVehicleLicense("")

      // Switch to active tasks tab
      setActiveTab("active")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    }
  }

  const handleSaveTemplate = async () => {
    try {
      if (!user?.id) return
      if (!taskTitle || !taskPriority || !taskType) {
        throw new Error("Please fill all required fields")
      }

      const response = await saveTaskTemplate(user.id, {
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        type: taskType,
        defaultAssignee: assignee
      })

      if (response.error) throw new Error(response.error)

      // Refresh templates
      const templatesRes = await getTaskTemplates(user.id)
      if (templatesRes.error) throw new Error(templatesRes.error)
      setTaskTemplates(templatesRes.data)

      // Reset form
      setTaskTitle("")
      setTaskPriority("")
      setTaskType("")
      setTaskDescription("")
      setAssignee("")

      // Switch to templates tab
      setActiveTab("templates")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      if (!user?.id) return

      const response = await updateTaskStatus(user.id, taskId, status)
      if (response.error) throw new Error(response.error)

      // Refresh tasks
      const [activeRes, completedRes] = await Promise.all([
        getActiveTasks(user.id),
        getCompletedTasks(user.id)
      ])

      if (activeRes.error) throw new Error(activeRes.error)
      if (completedRes.error) throw new Error(completedRes.error)

      setActiveTasks(activeRes.data)
      setCompletedTasks(completedRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status')
    }
  }

  const taskStats = {
    totalTasks: activeTasks.length + completedTasks.length,
    assignedEmployees: [...new Set(activeTasks.map(task => task.assignee.name))].length,
    completedTasks: completedTasks.length,
    overdueTasks: activeTasks.filter(task => task.status === "overdue").length
  }

  const filteredActiveTasks = activeTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === "all" || task.priority.toLowerCase() === priorityFilter
    return matchesSearch && matchesPriority
  })

  if (loading) {
    return (
        <DashboardLayout navigation={navigation} userRole="manager" userName="Loading...">
          <div className="flex flex-col gap-5">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <ListTodo className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-bold">Error loading task data</h2>
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
      <DashboardLayout navigation={navigation} userRole="manager" userName={user?.name || "Manager"}>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
              <p className="text-muted-foreground">Assign and manage tasks for your automotive team</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button
                  size="sm"
                  onClick={() => setActiveTab("assign")}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskStats.totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {activeTasks.filter(task => new Date(task.dueDate).toDateString() === new Date().toDateString()).length} tasks due today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskStats.assignedEmployees}</div>
                <p className="text-xs text-muted-foreground">Out of {employees.length} total employees</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskStats.completedTasks}</div>
                <p className="text-xs text-muted-foreground">+8 from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskStats.overdueTasks}</div>
                <p className="text-xs text-muted-foreground">Requires immediate attention</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="assign">Assign Tasks</TabsTrigger>
              <TabsTrigger value="active">Active Tasks</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="templates">Task Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="assign" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Task</CardTitle>
                  <CardDescription>Assign a new task to an employee or team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="task-title">Task Title*</Label>
                        <Input
                            id="task-title"
                            placeholder="Enter task title"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-priority">Priority*</Label>
                        <Select
                            value={taskPriority}
                            onValueChange={setTaskPriority}
                        >
                          <SelectTrigger id="task-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="task-type">Task Type*</Label>
                        <Select
                            value={taskType}
                            onValueChange={setTaskType}
                        >
                          <SelectTrigger id="task-type">
                            <SelectValue placeholder="Select task type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="repair">Vehicle Repair</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="inspection">Vehicle Inspection</SelectItem>
                            <SelectItem value="customer">Customer Service</SelectItem>
                            <SelectItem value="admin">Administrative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date*</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              <span>
                              {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                            </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dueDate}
                                onSelect={setDueDate}
                                initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-description">Task Description</Label>
                      <Textarea
                          id="task-description"
                          placeholder="Enter detailed task description"
                          className="min-h-[100px]"
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Assign To*</Label>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Select
                            value={assignee}
                            onValueChange={setAssignee}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.name} - {employee.position}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add More Employees
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Vehicle Information (if applicable)</Label>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Input
                            placeholder="Make"
                            value={vehicleMake}
                            onChange={(e) => setVehicleMake(e.target.value)}
                        />
                        <Input
                            placeholder="Model"
                            value={vehicleModel}
                            onChange={(e) => setVehicleModel(e.target.value)}
                        />
                        <Input
                            placeholder="License Plate"
                            value={vehicleLicense}
                            onChange={(e) => setVehicleLicense(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                      variant="outline"
                      onClick={handleSaveTemplate}
                      disabled={!taskTitle || !taskPriority || !taskType}
                  >
                    Save as Template
                  </Button>
                  <Button
                      onClick={handleCreateTask}
                      disabled={!taskTitle || !taskPriority || !taskType || !dueDate || !assignee}
                  >
                    Assign Task
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="active" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Search active tasks..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Active Tasks</CardTitle>
                  <CardDescription>Currently assigned and in-progress tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredActiveTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <ListTodo className="h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium">No active tasks found</h3>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm ? "Try a different search term" : "Create a new task to get started"}
                          </p>
                        </div>
                    ) : (
                        filteredActiveTasks.map((task) => (
                            <div key={task.id} className="rounded-lg border p-4">
                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium">{task.title}</h3>
                                    <Badge variant={getPriorityVariant(task.priority)}>
                                      {task.priority}
                                    </Badge>
                                    {task.status === "overdue" && (
                                        <Badge variant="destructive">Overdue</Badge>
                                    )}
                                  </div>
                                  <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                                </div>
                                <div className="flex flex-col items-start gap-2 md:items-end">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                              </span>
                                  </div>
                                  <Badge variant="outline">{task.type}</Badge>
                                </div>
                              </div>
                              <Separator className="my-4" />
                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                                    <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{task.assignee.name}</p>
                                    <p className="text-xs text-muted-foreground">{task.assignee.position}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Select
                                      value={task.status}
                                      onValueChange={(value) => handleUpdateTaskStatus(task.id, value as Task['status'])}
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Update status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button variant="ghost" size="icon">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="completed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Tasks</CardTitle>
                  <CardDescription>Recently completed tasks and their details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completedTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <CheckCircle2 className="h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium">No completed tasks yet</h3>
                          <p className="text-sm text-muted-foreground">
                            Tasks will appear here once they're marked as completed
                          </p>
                        </div>
                    ) : (
                        completedTasks.map((task) => (
                            <div key={task.id} className="rounded-lg border p-4 bg-muted/30">
                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium">{task.title}</h3>
                                    <Badge variant="outline">Completed</Badge>
                                  </div>
                                  <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                                </div>
                                <div className="flex flex-col items-start gap-2 md:items-end">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">
                                Completed: {format(new Date(task.dueDate), "MMM d, yyyy")}
                              </span>
                                  </div>
                                  <Badge variant="outline">{task.type}</Badge>
                                </div>
                              </div>
                              <Separator className="my-4" />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                                    <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{task.assignee.name}</p>
                                    <p className="text-xs text-muted-foreground">{task.assignee.position}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  View Details
                                </Button>
                              </div>
                            </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Task Templates</CardTitle>
                  <CardDescription>Reusable task templates for common assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {taskTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <ListTodo className="h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium">No task templates yet</h3>
                          <p className="text-sm text-muted-foreground">
                            Save a task as a template to quickly assign similar tasks in the future
                          </p>
                        </div>
                    ) : (
                        taskTemplates.map((template) => (
                            <div key={template.id} className="rounded-lg border p-4">
                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <h3 className="font-medium">{template.title}</h3>
                                  <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{template.type}</Badge>
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setTaskTitle(template.title)
                                        setTaskDescription(template.description)
                                        setTaskPriority(template.priority)
                                        setTaskType(template.type)
                                        if (template.defaultAssignee) setAssignee(template.defaultAssignee)
                                        setActiveTab("assign")
                                      }}
                                  >
                                    Use Template
                                  </Button>
                                </div>
                              </div>
                            </div>
                        ))
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                      className="w-full"
                      onClick={() => setActiveTab("assign")}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Template
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
  )
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case "urgent":
      return "destructive"
    case "high":
      return "default"
    case "medium":
      return "secondary"
    case "low":
      return "outline"
    default:
      return "outline"
  }
}