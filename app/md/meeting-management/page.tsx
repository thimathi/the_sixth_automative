'use client'

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// @ts-ignore
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Filter,
  PlusCircle,
  Search,
  Settings,
  Users,
  Video,
  X,
} from "lucide-react"
import { useUser } from '@/context/user-context'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  fetchMeetingStats,
  fetchUpcomingMeetings,
  fetchPastMeetings,
  fetchMeetingRooms,
  scheduleMeeting,
  verifyMDRole,
  Meeting,
  MeetingRoom,
  MeetingStats, getMDNavigation
} from '@/app/md/meeting-management/meetingBackend'

export default function MeetingManagementPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [stats, setStats] = useState<MeetingStats | null>(null)
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([])
  const [pastMeetings, setPastMeetings] = useState<Meeting[]>([])
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState('upcoming')

  // Form state for scheduling meetings
  const [meetingForm, setMeetingForm] = useState({
    topic: '',
    description: '',
    type: 'Regular',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    participants: [] as string[]
  })

  const navigation = [
    { name: "Dashboard", href: "/md/dashboard", icon: Building },
    { name: "Meeting Management", href: "/md/meeting-management", icon: Calendar },
    { name: "Performance Management", href: "/md/performance-management", icon: TrendingUp },
    { name: "Promote Employees", href: "/md/promote-employees", icon: Award }
  ]

  useEffect(() => {
    if (!userLoading && (!user || !verifyMDRole(user.id))) {
      router.push('/auth/login')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    getMDNavigation();
    const loadData = async () => {
      if (user?.role === 'md') {
        try {
          setLoading(true)
          const [statsData, upcomingData, pastData, roomsData] = await Promise.all([
            fetchMeetingStats(),
            fetchUpcomingMeetings(),
            fetchPastMeetings(),
            fetchMeetingRooms(),
          ])
          setStats(statsData)
          setUpcomingMeetings(upcomingData)
          setPastMeetings(pastData)
          setMeetingRooms(roomsData)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load meeting data')
        } finally {
          setLoading(false)
        }
      }
    }

    loadData()
  }, [user])

  const handleScheduleMeeting = async () => {
    try {
      const result = await scheduleMeeting(meetingForm)
      if (result.success) {
        // Refresh data
        const [upcomingData, pastData] = await Promise.all([
          fetchUpcomingMeetings(),
          fetchPastMeetings()
        ])
        setUpcomingMeetings(upcomingData)
        setPastMeetings(pastData)
        setSelectedTab('upcoming')
        // Reset form
        setMeetingForm({
          topic: '',
          description: '',
          type: 'Regular',
          date: '',
          startTime: '',
          endTime: '',
          location: '',
          participants: []
        })
      } else {
        setError(result.error || 'Failed to schedule meeting')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule meeting')
    }
  }

  if (userLoading || loading) {
    return (
        <DashboardLayout
            navigation={navigation}
            userRole="Managing Director"
            userName="Loading..."
        >
          <div className="flex justify-center items-center h-64">
            <p>Loading meeting data...</p>
          </div>
        </DashboardLayout>
    )
  }

  if (error) {
    return (
        <DashboardLayout
            navigation={navigation}
            userRole="Managing Director"
            userName={user?.name || ''}
        >
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        </DashboardLayout>
    )
  }

  if (!stats || !user) {
    return (
        <DashboardLayout
            navigation={navigation}
            userRole="Managing Director"
            userName={user?.name || ''}
        >
          <div className="flex justify-center items-center h-64">
            <p>No meeting data available</p>
          </div>
        </DashboardLayout>
    )
  }

  // @ts-ignore
  return (
      <DashboardLayout
          navigation={navigation}
          userRole="Managing Director"
          // @ts-ignore
          userName={user.name}
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Meeting Management</h1>
              <p className="text-muted-foreground">Schedule and manage meetings for The Sixth Automotive</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button size="sm" onClick={() => setSelectedTab('schedule')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingCount}</div>
                <p className="text-xs text-muted-foreground">{stats.todayCount} meetings today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.participantsCount}</div>
                <p className="text-xs text-muted-foreground">Across all scheduled meetings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meeting Rooms</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.availableRooms}/{stats.totalRooms}</div>
                <p className="text-xs text-muted-foreground">Available meeting spaces</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Meetings</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedCount}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
              <TabsTrigger value="schedule">Schedule Meeting</TabsTrigger>
              <TabsTrigger value="past">Past Meetings</TabsTrigger>
              <TabsTrigger value="rooms">Meeting Rooms</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search meetings..." className="pl-8" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meetings</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <CardDescription>Scheduled meetings for The Sixth Automotive</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingMeetings.map((meeting) => (
                        <div key={meeting.id} className="rounded-lg border p-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{meeting.title}</h3>
                                <Badge
                                    variant={
                                      meeting.type === "Urgent"
                                          ? "destructive"
                                          : meeting.type === "Regular"
                                              ? "default"
                                              : "secondary"
                                    }
                                >
                                  {meeting.type}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{meeting.description}</p>
                            </div>
                            <div className="flex flex-col items-start gap-2 md:items-end">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{meeting.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{meeting.time}</span>
                              </div>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-medium">Location: {meeting.location}</p>
                              <p className="text-sm text-muted-foreground">Organized by: {meeting.organizer}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {meeting.participants.slice(0, 3).map((participant, index) => (
                                    <Avatar key={index} className="h-8 w-8 border-2 border-background">
                                      <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {meeting.participants.length > 3 && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                                      +{meeting.participants.length - 3}
                                    </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule New Meeting</CardTitle>
                  <CardDescription>Create a new meeting and invite participants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="meeting-title">Meeting Title</Label>
                        <Input
                            id="meeting-title"
                            placeholder="Enter meeting title"
                            value={meetingForm.topic}
                            onChange={(e) => setMeetingForm({...meetingForm, topic: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meeting-type">Meeting Type</Label>
                        <Select
                            value={meetingForm.type}
                            onValueChange={(value) => setMeetingForm({...meetingForm, type: value})}
                        >
                          <SelectTrigger id="meeting-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Regular">Regular</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                            <SelectItem value="Planning">Planning</SelectItem>
                            <SelectItem value="Training">Training</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {meetingForm.date ? new Date(meetingForm.date).toLocaleDateString() : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                // @ts-ignore
                                mode="single"
                                selected={meetingForm.date ? new Date(meetingForm.date) : undefined}
                                // @ts-ignore
                                onSelect={(date) => setMeetingForm({...meetingForm, date: date?.toISOString() || ''})}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid gap-4 grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="start-time">Start Time</Label>
                          <Select
                              value={meetingForm.startTime}
                              onValueChange={(value) => setMeetingForm({...meetingForm, startTime: value})}
                          >
                            <SelectTrigger id="start-time">
                              <SelectValue placeholder="Start" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="09:00">9:00 AM</SelectItem>
                              <SelectItem value="10:00">10:00 AM</SelectItem>
                              <SelectItem value="11:00">11:00 AM</SelectItem>
                              <SelectItem value="12:00">12:00 PM</SelectItem>
                              <SelectItem value="13:00">1:00 PM</SelectItem>
                              <SelectItem value="14:00">2:00 PM</SelectItem>
                              <SelectItem value="15:00">3:00 PM</SelectItem>
                              <SelectItem value="16:00">4:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-time">End Time</Label>
                          <Select
                              value={meetingForm.endTime}
                              onValueChange={(value) => setMeetingForm({...meetingForm, endTime: value})}
                          >
                            <SelectTrigger id="end-time">
                              <SelectValue placeholder="End" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10:00">10:00 AM</SelectItem>
                              <SelectItem value="11:00">11:00 AM</SelectItem>
                              <SelectItem value="12:00">12:00 PM</SelectItem>
                              <SelectItem value="13:00">1:00 PM</SelectItem>
                              <SelectItem value="14:00">2:00 PM</SelectItem>
                              <SelectItem value="15:00">3:00 PM</SelectItem>
                              <SelectItem value="16:00">4:00 PM</SelectItem>
                              <SelectItem value="17:00">5:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meeting-location">Location</Label>
                      <Select
                          value={meetingForm.location}
                          onValueChange={(value) => setMeetingForm({...meetingForm, location: value})}
                      >
                        <SelectTrigger id="meeting-location">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {meetingRooms.map(room => (
                              <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meeting-description">Meeting Description</Label>
                      <Textarea
                          id="meeting-description"
                          placeholder="Enter meeting agenda and details"
                          className="min-h-[100px]"
                          value={meetingForm.description}
                          onChange={(e) => setMeetingForm({...meetingForm, description: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Participants</Label>
                      <div className="rounded-md border">
                        <div className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {meetingForm.participants.map((participantId) => (
                                <Badge key={participantId} variant="secondary" className="flex items-center gap-1">
                                  {participantId}
                                  <button
                                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                      onClick={() => setMeetingForm({
                                        ...meetingForm,
                                        participants: meetingForm.participants.filter(id => id !== participantId)
                                      })}
                                  >
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Remove participant</span>
                                  </button>
                                </Badge>
                            ))}
                            <Button variant="outline" size="sm" className="h-7">
                              <PlusCircle className="mr-2 h-3.5 w-3.5" />
                              Add Participant
                            </Button>
                          </div>
                        </div>
                        <Separator />
                        <div className="p-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="department" className="text-sm">
                              Filter by Department:
                            </Label>
                            <Select defaultValue="all">
                              <SelectTrigger id="department" className="h-8 w-[180px]">
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
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Attachments</Label>
                      <div className="flex items-center gap-2">
                        <Input type="file" className="hidden" id="file-upload" />
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <div className="flex h-9 items-center justify-center rounded-md border border-dashed px-4">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            <span>Add Files</span>
                          </div>
                        </Label>
                        <div className="text-sm text-muted-foreground">Max file size: 10MB</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Save as Draft</Button>
                  <Button onClick={handleScheduleMeeting}>Schedule Meeting</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Past Meetings</CardTitle>
                  <CardDescription>Review previous meetings and access minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pastMeetings.map((meeting) => (
                        <div key={meeting.id} className="rounded-lg border p-4 bg-muted/30">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{meeting.title}</h3>
                                <Badge variant="outline">Completed</Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {meeting.date} • {meeting.time}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <FileText className="mr-2 h-4 w-4" />
                                View Minutes
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">Key Outcomes:</span> {meeting.description}
                            </div>
                            <Badge variant="secondary">{meeting.attendees} attendees</Badge>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rooms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Rooms</CardTitle>
                  <CardDescription>Manage and view availability of meeting spaces</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {meetingRooms.map((room) => (
                        <div key={room.id} className="rounded-lg border p-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{room.name}</h3>
                                <Badge
                                    variant={room.status === "Available" ? "default" : "destructive"}
                                    className={
                                      room.status === "Available"
                                          ? "bg-green-500 text-white hover:bg-green-500/80"
                                          : undefined
                                    }
                                >
                                  {room.status}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Capacity: {room.capacity} people • {room.equipment}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                View Schedule
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {room.nextMeeting && (
                              <>
                                <Separator className="my-4" />
                                <div className="text-sm">
                                  <span className="font-medium">Next Meeting:</span> {room.nextMeeting.title} at{" "}
                                  {room.nextMeeting.time}
                                </div>
                              </>
                          )}
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
  )
}

// Add these icon components at the bottom of your file
function Building(props: { className?: string }) {
  return <div className={props.className} />
}

function Calendar(props: { className?: string }) {
  return <div className={props.className} />
}

function TrendingUp(props: { className?: string }) {
  return <div className={props.className} />
}

function Award(props: { className?: string }) {
  return <div className={props.className} />
}