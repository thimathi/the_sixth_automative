import { supabase } from "@/utils/supabase"

// Type definitions
export interface KPI {
    id: string
    employee: string
    department: string
    position: string
    period: string
    overallScore: number
    metrics: {
        productivity: number
        quality: number
        attendance: number
        teamwork: number
        customerSatisfaction: number
    }
    status: "Completed" | "In Progress" | "Pending"
}

export interface DepartmentKPI {
    name: string
    score: number
    employees: number
    trend: string
}

export interface PerformanceTrend {
    period: string
    score: number
}

export interface PerformanceDistribution {
    range: string
    count: number
}

// Fetch individual KPI data
export const getKPIData = async (
    period: string,
    department: string = "all"
): Promise<KPI[]> => {
    try {
        let query = supabase
            .from('kpi')
            .select(`
        id,
        employee:employee_id(first_name, last_name, department, position),
        period,
        overall_score,
        productivity,
        quality,
        attendance,
        teamwork,
        customer_satisfaction,
        status
      `)
            .eq('period', period)

        if (department !== "all") {
            query = query.eq('employee.department', department)
        }

        const { data, error } = await query

        if (error) throw error

        // @ts-ignore
        return data?.map((item) => ({
            id: item.id,
            // @ts-ignore
            employee: `${item.employee?.first_name} ${item.employee?.last_name}`,
            // @ts-ignore
            department: item.employee?.department || 'Unknown',
            // @ts-ignore
            position: item.employee?.position || 'Unknown',
            period: item.period,
            overallScore: item.overall_score,
            metrics: {
                productivity: item.productivity,
                quality: item.quality,
                attendance: item.attendance,
                teamwork: item.teamwork,
                customerSatisfaction: item.customer_satisfaction,
            },
            status: item.status
        })) || []
    } catch (error) {
        console.error('Error fetching KPI data:', error)
        throw error instanceof Error ? error : new Error('Failed to fetch KPI data')
    }
}

// Fetch department-level KPI data
export const getDepartmentKPIs = async (period: string): Promise<DepartmentKPI[]> => {
    try {
        const { data, error } = await supabase
            .rpc('get_department_kpis', { period_param: period })

        if (error) throw error

        return data?.map((dept: any) => ({
            name: dept.department,
            score: dept.avg_score,
            employees: dept.employee_count,
            trend: dept.trend
        })) || []
    } catch (error) {
        console.error('Error fetching department KPIs:', error)
        throw error instanceof Error ? error : new Error('Failed to fetch department KPIs')
    }
}

// Fetch performance trends
export const getPerformanceTrends = async (): Promise<PerformanceTrend[]> => {
    try {
        const { data, error } = await supabase
            .from('kpi_trends')
            .select('period, avg_score')
            .order('period', { ascending: true })

        if (error) throw error

        return data?.map((trend) => ({
            period: trend.period,
            score: trend.avg_score
        })) || []
    } catch (error) {
        console.error('Error fetching performance trends:', error)
        throw error instanceof Error ? error : new Error('Failed to fetch performance trends')
    }
}

// Fetch performance distribution
export const getPerformanceDistribution = async (period: string): Promise<PerformanceDistribution[]> => {
    try {
        const { data, error } = await supabase
            .rpc('get_performance_distribution', { period_param: period })

        if (error) throw error

        return data || []
    } catch (error) {
        console.error('Error fetching performance distribution:', error)
        throw error instanceof Error ? error : new Error('Failed to fetch performance distribution')
    }
}

// Generate KPI report
export const generateKPIReport = async (period: string, department: string = "all"): Promise<void> => {
    try {
        const { error } = await supabase
            .rpc('generate_kpi_report', {
                period_param: period,
                department_param: department === "all" ? null : department
            })

        if (error) throw error
    } catch (error) {
        console.error('Error generating KPI report:', error)
        throw error instanceof Error ? error : new Error('Failed to generate KPI report')
    }
}

// Export KPI data
export const exportKPIData = async (period: string, department: string = "all"): Promise<void> => {
    try {
        const { error } = await supabase
            .rpc('export_kpi_data', {
                period_param: period,
                department_param: department === "all" ? null : department
            })

        if (error) throw error
    } catch (error) {
        console.error('Error exporting KPI data:', error)
        throw error instanceof Error ? error : new Error('Failed to export KPI data')
    }
}