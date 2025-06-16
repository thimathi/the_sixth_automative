import { supabase } from "@/utils/supabase";

interface Report {
    reportId: string;
    name: string;
    description: string;
    type: string;
    period: string;
    generatedDate: string;
    status: string;
    fileSize: string;
    fileUrl: string;
}

interface ReportCategory {
    value: string;
    label: string;
}

interface QuickStats {
    totalReports: number;
    availableReports: number;
    processingReports: number;
    lastGenerated: string;
}

export const getEmployeeReports = async (empId: string): Promise<Report[]> => {
    try {
        const { data: reports, error } = await supabase
            .from('employeeReports')
            .select('*')
            .eq('empId', empId)
            .order('generatedDate', { ascending: false });

        if (error) throw error;

        return reports?.map(report => ({
            reportId: report.reportId,
            name: report.name,
            description: report.description,
            type: report.type,
            period: report.period,
            generatedDate: report.generatedDate,
            status: report.status,
            fileSize: report.fileSize,
            fileUrl: report.fileUrl
        })) || [];
    } catch (error) {
        console.error('Error fetching employee reports:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch employee reports');
    }
};

export const getReportCategories = async (): Promise<ReportCategory[]> => {
    return [
        { value: "all", label: "All Reports" },
        { value: "attendance", label: "Attendance" },
        { value: "payroll", label: "Payroll" },
        { value: "performance", label: "Performance" },
        { value: "training", label: "Training" },
        { value: "leave", label: "Leave" },
        { value: "overtime", label: "Overtime" },
    ];
};

export const getQuickStats = async (empId: string): Promise<QuickStats> => {
    try {
        const reports = await getEmployeeReports(empId);
        const availableReports = reports.filter(r => r.status === "Available").length;
        const processingReports = reports.filter(r => r.status === "Processing").length;
        const lastGenerated = reports.length > 0 ? reports[0].generatedDate : 'N/A';

        return {
            totalReports: reports.length,
            availableReports,
            processingReports,
            lastGenerated
        };
    } catch (error) {
        console.error('Error calculating quick stats:', error);
        throw error instanceof Error ? error : new Error('Failed to calculate quick stats');
    }
};

export const downloadReport = async (reportId: string, empId: string): Promise<void> => {
    try {
        // First verify the report belongs to the employee
        const { data: report, error: verifyError } = await supabase
            .from('employeeReports')
            .select('fileUrl')
            .eq('reportId', reportId)
            .eq('empId', empId)
            .single();

        if (verifyError || !report) {
            throw new Error('Report not found or access denied');
        }

        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = report.fileUrl;
        link.download = report.fileUrl.split('/').pop() || 'report';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading report:', error);
        throw error instanceof Error ? error : new Error('Failed to download report');
    }
};

export const generateReport = async (empId: string, reportType: string): Promise<void> => {
    try {
        // In a real app, this would trigger a server-side report generation
        // For now, we'll simulate it with a timeout
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Simulate adding a new processing report
        console.log(`Report generation requested for ${reportType} for employee ${empId}`);
    } catch (error) {
        console.error('Error generating report:', error);
        throw error instanceof Error ? error : new Error('Failed to generate report');
    }
};