import { supabase } from '@/utils/supabase'
import {Calendar, Building, TrendingUp, Award} from 'lucide-react'

export interface Meeting {
    id: string
    title: string
    description: string
    type: 'Regular' | 'Urgent' | 'Planning' | 'Training'
    date: string
    time: string
    location: string
    attendees: number;
    organizer: string
    participants: Array<{
        name: string
        avatar?: string
    }>
}

export interface MeetingRoom {
    id: string
    name: string
    capacity: number
    equipment: string
    status: 'Available' | 'Occupied'
    nextMeeting?: {
        title: string
        time: string
    }
}

export interface MeetingStats {
    upcomingCount: number
    todayCount: number
    participantsCount: number
    availableRooms: number
    totalRooms: number
    completedCount: number
}

export const verifyMDRole = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('employee')
        .select('role')
        .eq('empId', userId)
        .single()

    return !error && data?.role === 'md'
}

export const fetchMeetingStats = async (): Promise<MeetingStats> => {
    const { data: upcomingData } = await supabase
        .from('meeting')
        .select('*')
        .gte('date', new Date().toISOString())

    const { data: todayData } = await supabase
        .from('meeting')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])

    const { data: participantsData } = await supabase
        .from('employeeMeeting')
        .select('empId')

    const { data: roomsData } = await supabase
        .from('meetingRoom')
        .select('status')

    const { data: completedData } = await supabase
        .from('meeting')
        .select('*')
        .lt('date', new Date().toISOString())
        .gte('date', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString())

    return {
        upcomingCount: upcomingData?.length || 0,
        todayCount: todayData?.length || 0,
        participantsCount: participantsData?.length || 0,
        availableRooms: roomsData?.filter(r => r.status === 'Available').length || 0,
        totalRooms: roomsData?.length || 0,
        completedCount: completedData?.length || 0
    }
}

export const fetchUpcomingMeetings = async (): Promise<Meeting[]> => {
    const { data, error } = await supabase
        .from('meeting')
        .select(`
      meetingId,
      topic,
      description,
      type,
      date,
      startTime,
      endTime,
      location:meetingRoom(name),
      organizer:employee(first_name, last_name),
      participants:employeeMeeting(employee:employee(first_name, last_name, avatar))
    `)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })

    if (error) {
        console.error('Error fetching meetings:', error)
        return []
    }
    //@ts-ignore
    return data.map(meeting => ({
        id: meeting.meetingId,
        title: meeting.topic,
        description: meeting.description,
        type: meeting.type,
        date: new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        time: `${meeting.startTime} - ${meeting.endTime}`,
        // @ts-ignore
        location: meeting.location?.name || 'Virtual',
        // @ts-ignore
        organizer: `${meeting.organizer?.first_name} ${meeting.organizer?.last_name}` || 'Unknown',
        participants: meeting.participants?.map(p => ({
            // @ts-ignore
            name: `${p.employee?.first_name} ${p.employee?.last_name}`,
            // @ts-ignore
            avatar: p.employee?.avatar
        })) || []
    }))
}

export const fetchPastMeetings = async (): Promise<Meeting[]> => {
    const { data, error } = await supabase
        .from('meeting')
        .select(`
      meetingId,
      topic,
      description,
      date,
      startTime,
      endTime,
      attendees:employeeMeeting(count)
    `)
        .lt('date', new Date().toISOString())
        .order('date', { ascending: false })
        .limit(10)

    if (error) {
        console.error('Error fetching past meetings:', error)
        return []
    }

    // @ts-ignore
    return data.map(meeting => ({
        id: meeting.meetingId,
        title: meeting.topic,
        description: meeting.description,
        type: 'Completed',
        date: new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: `${meeting.startTime} - ${meeting.endTime}`,
        location: '',
        organizer: '',
        participants: [],
        attendees: meeting.attendees?.[0]?.count || 0
    }))
}

export const fetchMeetingRooms = async (): Promise<MeetingRoom[]> => {
    const { data, error } = await supabase
        .from('meetingRoom')
        .select(`
      roomId,
      name,
      capacity,
      equipment,
      status,
      nextMeeting:meeting(topic, startTime)
    `)
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching meeting rooms:', error)
        return []
    }

    return data.map(room => ({
        id: room.roomId,
        name: room.name,
        capacity: room.capacity,
        equipment: room.equipment,
        status: room.status,
        nextMeeting: room.nextMeeting?.[0] ? {
            title: room.nextMeeting[0].topic,
            time: room.nextMeeting[0].startTime
        } : undefined
    }))
}

export const scheduleMeeting = async (meetingData: {
    topic: string
    description: string
    type: string
    date: string
    startTime: string
    endTime: string
    location: string
    participants: string[]
}): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data, error } = await supabase
            .from('meeting')
            .insert([{
                topic: meetingData.topic,
                description: meetingData.description,
                type: meetingData.type,
                date: meetingData.date,
                startTime: meetingData.startTime,
                endTime: meetingData.endTime,
                roomId: meetingData.location
            }])
            .select('meetingId')
            .single()

        if (error) throw error

        const participantInserts = meetingData.participants.map(empId => ({
            meetingId: data.meetingId,
            empId
        }))

        const { error: participantError } = await supabase
            .from('employeeMeeting')
            .insert(participantInserts)

        if (participantError) throw participantError

        return { success: true }
    } catch (error) {
        console.error('Error scheduling meeting:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to schedule meeting'
        }
    }
}

export const getMDNavigation = () => [
    { name: "Dashboard", href: "/md/dashboard", icon: Building },
    { name: "Meeting Management", href: "/md/meeting-management", icon: Calendar },
    { name: "Performance Management", href: "/md/performance-management", icon: TrendingUp },
    { name: "Promote Employees", href: "/md/promote-employees", icon: Award }
]