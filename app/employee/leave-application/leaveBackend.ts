import { supabase } from "@/utils/supabase";

interface LeaveApplication {
    leaveId: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: string;
    appliedDate: string;
    approver: string;
}

interface LeaveBalance {
    total: number;
    used: number;
    remaining: number;
}

interface LeaveBalances {
    annual: LeaveBalance;
    sick: LeaveBalance;
    personal: LeaveBalance;
    emergency: LeaveBalance;
    maternity?: LeaveBalance;
    paternity?: LeaveBalance;
}

export const getLeaveBalances = async (empId: string): Promise<LeaveBalances> => {
    try {
        const { data: employee, error } = await supabase
            .from('employee')
            .select('sickLeaveBalance, fullDayLeaveBalance, halfDayLeaveBalance, maternityLeaveBalance')
            .eq('empId', empId)
            .single();

        if (error) throw error;

        // These values should be adjusted based on your company's leave policy
        return {
            annual: {
                total: 21,
                used: 21 - (employee.fullDayLeaveBalance || 0),
                remaining: employee.fullDayLeaveBalance || 0
            },
            sick: {
                total: 10,
                used: 10 - (employee.sickLeaveBalance || 0),
                remaining: employee.sickLeaveBalance || 0
            },
            personal: {
                total: 5,
                used: 5 - (employee.halfDayLeaveBalance || 0),
                remaining: employee.halfDayLeaveBalance || 0
            },
            emergency: {
                total: 3,
                used: 0, // Adjust based on your business logic
                remaining: 3
            },
            maternity: {
                total: 84, // Example: 12 weeks
                used: 84 - (employee.maternityLeaveBalance || 0),
                remaining: employee.maternityLeaveBalance || 0
            },
            paternity: {
                total: 14, // Example: 2 weeks
                used: 0, // Adjust based on your business logic
                remaining: 14
            }
        };
    } catch (error) {
        console.error('Error fetching leave balances:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch leave balances');
    }
};

export const getLeaveApplications = async (empId: string): Promise<LeaveApplication[]> => {
    try {
        const { data: leaves, error } = await supabase
            .from('leave')
            .select('*, leaveType:leaveTypeId(*)')
            .eq('empId', empId)
            .order('leaveFromDate', { ascending: false });

        if (error) throw error;

        return leaves?.map(leave => ({
            leaveId: leave.leaveId,
            type: leave.leaveType?.leaveType || 'Unknown',
            startDate: leave.leaveFromDate,
            endDate: leave.leaveToDate,
            days: leave.duration || 0,
            reason: leave.leaveReason || '',
            status: leave.leaveStatus || 'Pending',
            appliedDate: leave.created_at.split('T')[0],
            approver: 'John Smith' // Replace with actual approver from your DB
        })) || [];
    } catch (error) {
        console.error('Error fetching leave applications:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch leave applications');
    }
};

export const submitLeaveApplication = async (
    empId: string,
    leaveData: {
        type: string;
        startDate: string;
        endDate: string;
        reason: string;
        days: number;
    }
): Promise<void> => {
    try {
        // First get the leaveTypeId based on the type
        const { data: leaveType, error: typeError } = await supabase
            .from('leaveType')
            .select('leaveTypeId')
            .eq('leaveType', leaveData.type)
            .single();

        if (typeError) throw typeError;

        const { error } = await supabase
            .from('leave')
            .insert([{
                empId,
                leaveTypeId: leaveType.leaveTypeId,
                leaveFromDate: leaveData.startDate,
                leaveToDate: leaveData.endDate,
                duration: leaveData.days,
                leaveReason: leaveData.reason,
                leaveStatus: 'Pending'
            }]);

        if (error) throw error;

        // Optionally upload attachment if needed
        // await handleLeaveAttachmentUpload(empId, leaveId, file);

    } catch (error) {
        console.error('Error submitting leave application:', error);
        throw error instanceof Error ? error : new Error('Failed to submit leave application');
    }
};

// Optional: For file attachments
export const handleLeaveAttachmentUpload = async (
    empId: string,
    leaveId: string,
    file: File
): Promise<string> => {
    try {
        const filePath = `leave-attachments/${empId}/${leaveId}/${file.name}`;

        const { error: uploadError } = await supabase
            .storage
            .from('leave-attachments')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('leave-attachments')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading leave attachment:', error);
        throw error instanceof Error ? error : new Error('Failed to upload leave attachment');
    }
};