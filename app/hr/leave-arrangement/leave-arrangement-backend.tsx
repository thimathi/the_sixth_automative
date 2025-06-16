import { supabase } from "@/utils/supabase"

export const getLeaveRequests = async (): Promise<any[]> => {
    try {
        const { data, error } = await supabase
            .from('leave')
            .select(`
        leaveId,
        leaveType:leaveTypeId(leaveType),
        startDate:leaveFromDate,
        endDate:leaveToDate,
        duration,
        reason:leaveReason,
        status:leaveStatus,
        employee:empId(
          empId,
          first_name,
          last_name,
          email,
          department
        )
      `)
            .order('leaveFromDate', { ascending: false })

        if (error) throw error

        // @ts-ignore

        return data?.map(item => ({
            leaveId: item.leaveId,
            // @ts-ignore
            leaveType: item.leaveType?.leaveType || 'Unknown',
            startDate: item.startDate,
            endDate: item.endDate,
            duration: item.duration,
            reason: item.reason,
            status: item.status,
            employee: {
                // @ts-ignore
                id: item.employee?.empId,
                // @ts-ignore
                name: `${item.employee?.first_name} ${item.employee?.last_name}`,
                // @ts-ignore
                email: item.employee?.email || '',
                // @ts-ignore
                department: item.employee?.department || 'Unknown'
            }
        })) || []
    } catch (error) {
        console.error('Error fetching leave requests:', error)
        throw error instanceof Error ? error : new Error('Failed to fetch leave requests')
    }
}

export const updateLeaveRequestStatus = async (
    leaveId: string,
    newStatus: "Approved" | "Rejected"
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('leave')
            .update({ leaveStatus: newStatus })
            .eq('leaveId', leaveId)

        if (error) throw error
    } catch (error) {
        console.error('Error updating leave status:', error)
        throw error instanceof Error ? error : new Error('Failed to update leave status')
    }
}

export const getLeaveStats = async (): Promise<any> => {
    try {
        // Get pending requests count
        const { count: pendingRequests } = await supabase
            .from('leave')
            .select('*', { count: 'exact' })
            .eq('leaveStatus', 'Pending')

        // Get approved requests this month
        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear()

        const { count: approvedThisMonth, data: approvedRequests } = await supabase
            .from('leave')
            .select('duration', { count: 'exact' })
            .eq('leaveStatus', 'Approved')
            .gte('leaveFromDate', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
            .lte('leaveFromDate', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`)

        const approvedDaysThisMonth = approvedRequests?.reduce((sum, req) => sum + (req.duration || 0), 0) || 0

        // Get employees currently on leave
        const today = new Date().toISOString().split('T')[0]
        const { count: employeesOnLeave } = await supabase
            .from('leave')
            .select('empId', { count: 'exact' })
            .eq('leaveStatus', 'Approved')
            .lte('leaveFromDate', today)
            .gte('leaveToDate', today)

        // Get average leave balance (simplified calculation)
        const { data: employees } = await supabase
            .from('employee')
            .select('fullDayLeaveBalance, sickLeaveBalance, shortLeaveBalance, maternityLeaveBalance')

        const avgLeaveBalance = employees
            ? employees.reduce((sum, emp) => {
            const totalBalance = (emp.fullDayLeaveBalance || 0) +
                (emp.sickLeaveBalance || 0) +
                (emp.shortLeaveBalance || 0) +
                (emp.maternityLeaveBalance || 0)
            const maxBalance = 21 + 14 + 7 + 84 // Assuming standard entitlements
            return sum + (totalBalance / maxBalance * 100)
        }, 0) / employees.length
            : 0

        return {
            pendingRequests: pendingRequests || 0,
            approvedThisMonth: approvedThisMonth || 0,
            approvedDaysThisMonth,
            employeesOnLeave: employeesOnLeave || 0,
            avgLeaveBalance: Math.round(avgLeaveBalance)
        }
    } catch (error) {
        console.error('Error fetching leave stats:', error)
        throw error instanceof Error ? error : new Error('Failed to fetch leave statistics')
    }
}

export const getLeavePolicies = async (): Promise<any[]> => {
    try {
        const { data, error } = await supabase
            .from('leaveType')
            .select('leaveTypeId, leaveType, totalLeavePerMonth, description')
            .order('leaveType', { ascending: true })

        if (error) throw error

        return data || []
    } catch (error) {
        console.error('Error fetching leave policies:', error)
        throw error instanceof Error ? error : new Error('Failed to fetch leave policies')
    }
}