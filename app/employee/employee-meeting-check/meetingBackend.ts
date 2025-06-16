import { supabase } from "@/utils/supabase";

interface MeetingStats {
    totalMeetings: number;
    attendanceRate: number;
    upcomingCount: number;
    mandatoryCount: number;
}

interface Meeting {
    id: string;
    title: string;
    date: string;
    time: string;
    location?: string;
    organizer: string;
    type: string;
    status?: string;
    attendance?: string;
    notes?: string;
    agenda?: string;
}

export const getMeetingStats = async (empId: string) => {
    try {
        // Get all meetings for the employee
        const { data: meetings, error } = await supabase
            .from('employeeMeeting')
            .select('*, meeting:meetingId(*)')
            .eq('empId', empId);

        if (error) throw error;

        // Calculate stats
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        // Filter meetings for the current year
        const yearMeetings = meetings?.filter(m => {
            const meetingDate = new Date(m.meeting?.date || m.startTime);
            return meetingDate.getFullYear() === currentYear;
        }) || [];

        // Filter upcoming meetings
        const upcomingMeetings = yearMeetings.filter(m => {
            const meetingDate = new Date(m.meeting?.date || m.startTime);
            return meetingDate >= currentDate;
        });

        // Filter mandatory meetings
        const mandatoryMeetings = upcomingMeetings.filter(m =>
            m.meeting?.type === 'Mandatory' || m.meeting?.status === 'Mandatory'
        );

        // Calculate attendance rate
        const attendedMeetings = yearMeetings.filter(m =>
            m.attendance === 'Present' || m.attendance === true
        ).length;
        const attendanceRate = yearMeetings.length > 0 ?
            (attendedMeetings / yearMeetings.length) * 100 : 0;

        return {
            totalMeetings: yearMeetings.length,
            attendanceRate,
            upcomingCount: upcomingMeetings.length,
            mandatoryCount: mandatoryMeetings.length
        };
    } catch (error) {
        console.error('Error fetching meeting stats:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch meeting stats'
        };
    }
};

export const getUpcomingMeetings = async (empId: string) => {
    try {
        const currentDate = new Date();

        // Get upcoming meetings for the employee
        const { data, error } = await supabase
            .from('employeeMeeting')
            .select('*, meeting:meetingId(*)')
            .eq('empId', empId)
            .gte('startTime', currentDate.toISOString())
            .order('startTime', { ascending: true });

        if (error) throw error;

        // Format the data
        return data.map(m => ({
            id: m.meetingId,
            title: m.meeting?.topic || 'Meeting',
            date: m.meeting?.date || m.startTime,
            time: m.startTime ? new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            location: m.meeting?.venue || 'Conference Room',
            organizer: m.meeting?.organizer || 'Manager',
            type: m.meeting?.type || 'General',
            status: m.meeting?.status || 'Scheduled',
            agenda: m.meeting?.description || 'General discussion'
        }));
    } catch (error) {
        console.error('Error fetching upcoming meetings:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch upcoming meetings'
        };
    }
};

export const getMeetingHistory = async (empId: string) => {
    try {
        const currentDate = new Date();

        // Get past meetings for the employee
        const { data, error } = await supabase
            .from('employeeMeeting')
            .select('*, meeting:meetingId(*)')
            .eq('empId', empId)
            .lt('startTime', currentDate.toISOString())
            .order('startTime', { ascending: false });

        if (error) throw error;

        // Format the data
        return data.map(m => ({
            id: m.meetingId,
            title: m.meeting?.topic || 'Meeting',
            date: m.meeting?.date || m.startTime,
            time: m.startTime ? new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            organizer: m.meeting?.organizer || 'Manager',
            type: m.meeting?.type || 'General',
            attendance: m.attendance ? 'Present' : 'Absent',
            notes: m.meeting?.notes || 'No notes available'
        }));
    } catch (error) {
        console.error('Error fetching meeting history:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch meeting history'
        };
    }
};