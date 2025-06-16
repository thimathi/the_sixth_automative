import { supabase } from "@/utils/supabase"

interface EmployeeRating {
    id: string;
    name: string;
    position: string;
    department: string;
    rating: number;
    metrics: {
        technical: number;
        customerService: number;
        efficiency: number;
        teamwork?: number;
        sales?: number;
        inventory?: number;
    };
    lastUpdated: string;
    reviewer?: string;
    comments?: string;
}

interface ApiResponse {
    data: EmployeeRating[];
    error: string | null;
}

export const getPerformanceRatings = async (managerId: string): Promise<ApiResponse> => {
    try {
        // First get all employees who report to this manager
        const { data: teamMembers, error: teamError } = await supabase
            .from('employee')
            .select('empId, first_name, last_name, position, department')
            .eq('managerId', managerId)

        if (teamError) throw teamError
        if (!teamMembers || teamMembers.length === 0) {
            return { data: [], error: null }
        }

        // Then get performance data for these employees
        const { data: performanceData, error: perfError } = await supabase
            .from('kpi')
            .select(`
        kpiId,
        kpiValue,
        technicalSkills,
        customerService,
        efficiency,
        teamwork,
        salesPerformance,
        inventoryManagement,
        calculateDate,
        comments,
        employee:empId(first_name, last_name, position, department),
        reviewer:reviewedBy(first_name, last_name)
      `)
            .in('empId', teamMembers.map(member => member.empId))
            .order('calculateDate', { ascending: false })

        if (perfError) throw perfError

        // Format the data for the frontend
        const formattedData: EmployeeRating[] = teamMembers.map(member => {
            // Find the most recent performance review for this employee
            const latestReview = performanceData
                //@ts-ignore
                ?.filter(review => review.employee?.empId === member.empId)
                ?.sort((a, b) => new Date(b.calculateDate).getTime() - new Date(a.calculateDate).getTime())[0]

            return {
                id: member.empId,
                name: `${member.first_name} ${member.last_name}`,
                position: member.position,
                department: member.department,
                rating: latestReview?.kpiValue || 0,
                metrics: {
                    technical: latestReview?.technicalSkills || 0,
                    customerService: latestReview?.customerService || 0,
                    efficiency: latestReview?.efficiency || 0,
                    teamwork: latestReview?.teamwork,
                    sales: latestReview?.salesPerformance,
                    inventory: latestReview?.inventoryManagement,
                },
                lastUpdated: latestReview?.calculateDate || new Date().toISOString(),
                reviewer: latestReview?.reviewer
                    //@ts-ignore
                    ? `${latestReview.reviewer.first_name} ${latestReview.reviewer.last_name}`
                    : undefined,
                comments: latestReview?.comments
            }
        })

        return { data: formattedData, error: null }
    } catch (error) {
        console.error('Error fetching performance ratings:', error)
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch performance data'
        }
    }
}

export const updatePerformanceRating = async (
    employeeId: string,
    managerId: string,
    rating?: number,
    metrics?: Record<string, number>
): Promise<{ error: string | null }> => {
    try {
        // First get the existing KPI record for this employee
        const { data: existingKpi, error: fetchError } = await supabase
            .from('kpi')
            .select('kpiId')
            .eq('empId', employeeId)
            .order('calculateDate', { ascending: false })
            .limit(1)
            .single()

        const kpiData: any = {
            empId: employeeId,
            reviewedBy: managerId,
            calculateDate: new Date().toISOString(),
        }

        if (rating !== undefined) {
            kpiData.kpiValue = rating
        }

        if (metrics) {
            if (metrics.technical !== undefined) kpiData.technicalSkills = metrics.technical
            if (metrics.customerService !== undefined) kpiData.customerService = metrics.customerService
            if (metrics.efficiency !== undefined) kpiData.efficiency = metrics.efficiency
            if (metrics.teamwork !== undefined) kpiData.teamwork = metrics.teamwork
            if (metrics.sales !== undefined) kpiData.salesPerformance = metrics.sales
            if (metrics.inventory !== undefined) kpiData.inventoryManagement = metrics.inventory
        }

        let error
        if (existingKpi?.kpiId) {
            // Update existing record
            const { error: updateError } = await supabase
                .from('kpi')
                .update(kpiData)
                .eq('kpiId', existingKpi.kpiId)
            error = updateError
        } else {
            // Create new record
            const { error: insertError } = await supabase
                .from('kpi')
                .insert(kpiData)
            error = insertError
        }

        if (error) throw error

        return { error: null }
    } catch (error) {
        console.error('Error updating performance rating:', error)
        return {
            error: error instanceof Error ? error.message : 'Failed to update performance rating'
        }
    }
}

export const exportPerformanceData = async (managerId: string): Promise<{ data: string, error: string | null }> => {
    try {
        // Get all performance data for the manager's team
        const response = await getPerformanceRatings(managerId)
        if (response.error) throw new Error(response.error)

        // Convert to CSV
        const headers = [
            'Employee ID',
            'Employee Name',
            'Position',
            'Department',
            'Rating (1-5)',
            'Technical Skills (%)',
            'Customer Service (%)',
            'Efficiency (%)',
            'Teamwork (%)',
            'Sales Performance (%)',
            'Inventory Management (%)',
            'Last Updated',
            'Reviewed By',
            'Comments'
        ]

        const rows = response.data.map(emp => [
            emp.id,
            emp.name,
            emp.position,
            emp.department,
            emp.rating,
            emp.metrics.technical,
            emp.metrics.customerService,
            emp.metrics.efficiency,
            emp.metrics.teamwork || '',
            emp.metrics.sales || '',
            emp.metrics.inventory || '',
            emp.lastUpdated,
            emp.reviewer || '',
            emp.comments || ''
        ])

        // Create CSV content
        let csvContent = headers.join(',') + '\n'
        rows.forEach(row => {
            csvContent += row.map(field =>
                `"${String(field).replace(/"/g, '""')}"`
            ).join(',') + '\n'
        })

        return { data: csvContent, error: null }
    } catch (error) {
        console.error('Error exporting performance data:', error)
        return {
            data: '',
            error: error instanceof Error ? error.message : 'Failed to export performance data'
        }
    }
}