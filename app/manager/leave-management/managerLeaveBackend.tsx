import { supabase } from "@/utils/supabase";

// Types for our data
interface LeaveRequest {
    id: string;
    employeeName: string;
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    appliedDate: string;
    status: string;
    remainingBalance: number;
    coveringEmployee: string;
    reviewedBy?: string;
    reviewDate?: string;
}

interface LeaveStats {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
}

interface TeamLeaveCalendar {
    date: string;
    employee: string;
    type: string;
    status?: string;
}

export const getLeaveRequests = async (managerId: string) => {
    try {
        const { data, error } = await supabase
            .from('leave')
            .select(`
        leaveId: id,
        leaveStatus: status,
        leaveFromDate: startDate,
        leaveToDate: endDate,
        leaveReason: reason,
        appliedDate,
        duration: days,
        leaveType: leaveType(type),
        employee: empId(first_name, last_name, empId),
        coveringEmployee: coveringEmployee(first_name, last_name),
        reviewedBy,
        reviewDate,
        remainingBalance
      `)
            .in('empId',
                // @ts-ignore
                supabase
                    .from('employee')
                    .select('empId')
                    .eq('managerId', managerId)
            )
            .order('appliedDate', { ascending: false });

        if (error) throw error;

        // Transform data to match our frontend interface
        const formattedData: LeaveRequest[] = data.map((leave: any) => ({
            id: leave.leaveId,
            employeeName: `${leave.employee?.first_name} ${leave.employee?.last_name}`,
            employeeId: leave.employee?.empId,
            leaveType: leave.leaveType?.type || 'Unknown',
            startDate: leave.leaveFromDate,
            endDate: leave.leaveToDate,
            days: leave.duration,
            reason: leave.leaveReason,
            appliedDate: leave.appliedDate,
            status: leave.leaveStatus,
            remainingBalance: leave.remainingBalance || 0,
            coveringEmployee: leave.coveringEmployee ?
                `${leave.coveringEmployee?.first_name} ${leave.coveringEmployee?.last_name}` : 'None',
            reviewedBy: leave.reviewedBy,
            reviewDate: leave.reviewDate
        }));

        return {
            leaveRequests: formattedData,
            error: null
        };
    } catch (error) {
        return {
            leaveRequests: null,
            error: error instanceof Error ? error.message : 'Failed to fetch leave requests'
        };
    }
};

export const getLeaveStats = async (managerId: string) => {
    try {
        const { data, error } = await supabase
            .from('leave')
            .select('status')
            .in(`empId`,
                //@ts-ignore
                supabase
                    .from('employee')
                    .select('empId')
                    .eq('managerId', managerId)
            )



        if (error) throw error;

        const stats: LeaveStats = {
            totalRequests: data?.length || 0,
            pendingRequests: data?.filter((req: any) => req.status === 'pending').length || 0,
            approvedRequests: data?.filter((req: any) => req.status === 'approved').length || 0,
            rejectedRequests: data?.filter((req: any) => req.status === 'rejected').length || 0
        };

        return {
            stats,
            error: null
        };
    } catch (error) {
        return {
            stats: null,
            error: error instanceof Error ? error.message : 'Failed to fetch leave stats'
        };
    }
};

export const getTeamLeaveCalendar = async (managerId: string) => {
    try {
        // @ts-ignore
        const { data, error } = await supabase
            .from('leave')
            .select(`
        leaveFromDate: startDate,
        leaveToDate: endDate,
        leaveType: leaveType(type),
        employee: empId(first_name, last_name),
        leaveStatus: status
      `)
            .in('empId',
                // @ts-ignore
                supabase
                    .from('employee')
                    .select('empId')
                    .eq('managerId', managerId)
            )
            .gte('leaveToDate', new Date().toISOString())
            .order('leaveFromDate', { ascending: true });

        if (error) throw error;

        const calendar: TeamLeaveCalendar[] = data.map((leave: any) => ({
            date: leave.leaveFromDate,
            employee: `${leave.employee?.first_name} ${leave.employee?.last_name}`,
            type: leave.leaveType?.type || 'Unknown',
            status: leave.leaveStatus
        }));

        return {
            calendar,
            error: null
        };
    } catch (error) {
        return {
            calendar: null,
            error: error instanceof Error ? error.message : 'Failed to fetch team leave calendar'
        };
    }
};

export const updateLeaveStatus = async (
    leaveId: string,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    comments?: string
) => {
    try {
        const { data, error } = await supabase
            .from('leave')
            .update({
                status,
                reviewedBy,
                reviewDate: new Date().toISOString(),
                comments
            })
            .eq('id', leaveId)
            .select();

        if (error) throw error;

        return {
            updatedRequest: data?.[0],
            error: null
        };
    } catch (error) {
        return {
            updatedRequest: null,
            error: error instanceof Error ? error.message : 'Failed to update leave status'
        };
    }
};

export const getLeavePolicies = async () => {
    try {
        const { data, error } = await supabase
            .from('leavePolicy')
            .select('*')
            .order('leaveType', { ascending: true });

        if (error) throw error;

        return {
            policies: data,
            error: null
        };
    } catch (error) {
        return {
            policies: null,
            error: error instanceof Error ? error.message : 'Failed to fetch leave policies'
        };
    }
};