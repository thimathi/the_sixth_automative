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