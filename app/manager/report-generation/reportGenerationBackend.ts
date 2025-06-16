import { supabase } from "@/utils/supabase"

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    lastUsed: string;
    createdBy: string;
    config: {
        type: string;
        format: string;
        sections: string[];
        dateRange?: {
            from: string;
            to: string;
        };
    };
}

interface RecentReport {
    id: string;
    name: string;
    date: string;
    status: "Completed" | "Processing" | "Failed";
    type: string;
    downloadUrl?: string;
}

interface ScheduledReport {
    id: string;
    name: string;
    schedule: string; // 'daily', 'weekly', 'monthly', 'quarterly'
    recipients: string[];
    nextRun: string;
    type: string;
    active: boolean;
    config: any;
}

interface GenerateReportOptions {
    name: string;
    type: string;
    format: string;
    dateRange?: {
        from: Date;
        to: Date;
    };
    sections: string[];
}

export const getReportTemplates = async (managerId: string): Promise<{ data: ReportTemplate[], error: string | null }> => {
    try {
        const { data, error } = await supabase
            .from('report_templates')
            .select('*')
            .eq('created_by', managerId)
            .order('last_used', { ascending: false })

        if (error) throw error

        const formattedData: ReportTemplate[] = data.map((template: any) => ({
            id: template.id,
            name: template.name,
            description: template.description,
            category: template.category,
            tags: template.tags || [],
            lastUsed: template.last_used,
            createdBy: template.created_by,
            config: template.config
        }))

        return { data: formattedData, error: null }
    } catch (error) {
        console.error('Error fetching report templates:', error)
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch templates'
        }
    }
}

export const getRecentReports = async (managerId: string): Promise<{ data: RecentReport[], error: string | null }> => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('created_by', managerId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const formattedData: RecentReport[] = data
            .filter((report: any) => new Date(report.created_at) >= thirtyDaysAgo)
            .map((report: any) => ({
                id: report.id,
                name: report.name,
                date: report.created_at,
                status: report.status.toLowerCase() as "Completed" | "Processing" | "Failed",
                type: report.type,
                downloadUrl: report.download_url
            }))

        return { data: formattedData, error: null }
    } catch (error) {
        console.error('Error fetching recent reports:', error)
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch recent reports'
        }
    }
}

export const getScheduledReports = async (managerId: string): Promise<{ data: ScheduledReport[], error: string | null }> => {
    try {
        const { data, error } = await supabase
            .from('scheduled_reports')
            .select('*')
            .eq('created_by', managerId)
            .order('next_run', { ascending: true })

        if (error) throw error

        const formattedData: ScheduledReport[] = data.map((report: any) => ({
            id: report.id,
            name: report.name,
            schedule: report.schedule,
            recipients: report.recipients || [],
            nextRun: report.next_run,
            type: report.type,
            active: report.active,
            config: report.config
        }))

        return { data: formattedData, error: null }
    } catch (error) {
        console.error('Error fetching scheduled reports:', error)
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch scheduled reports'
        }
    }
}

export const generateReport = async (
    templateId: string | null,
    managerId: string,
    options?: GenerateReportOptions
): Promise<{ data: RecentReport | null, error: string | null }> => {
    try {
        let reportConfig: any
        let reportName = ""

        if (templateId) {
            // Get template config
            const { data: template, error: templateError } = await supabase
                .from('report_templates')
                .select('*')
                .eq('id', templateId)
                .single()

            if (templateError) throw templateError
            if (!template) throw new Error("Template not found")

            reportConfig = template.config
            reportName = template.name

            // Update last used date
            await supabase
                .from('report_templates')
                .update({ last_used: new Date().toISOString() })
                .eq('id', templateId)
        } else if (options) {
            // Use custom options
            reportConfig = {
                type: options.type,
                format: options.format,
                sections: options.sections,
                dateRange: options.dateRange ? {
                    from: options.dateRange.from.toISOString(),
                    to: options.dateRange.to.toISOString()
                } : undefined
            }
            reportName = options.name
        } else {
            throw new Error("Either templateId or options must be provided")
        }

        // Simulate report generation (in a real app, this would call your report generation service)
        const reportId = `report-${Date.now()}`
        const downloadUrl = `https://example.com/reports/${reportId}.${reportConfig.format}`

        // Save report record
        const { error: insertError } = await supabase
            .from('reports')
            .insert({
                id: reportId,
                name: reportName,
                type: reportConfig.type,
                format: reportConfig.format,
                status: 'processing',
                created_by: managerId,
                download_url: downloadUrl,
                config: reportConfig
            })

        if (insertError) throw insertError

        // Simulate async processing completion
        setTimeout(async () => {
            await supabase
                .from('reports')
                .update({ status: 'completed' })
                .eq('id', reportId)
        }, 3000)

        return {
            data: {
                id: reportId,
                name: reportName,
                date: new Date().toISOString(),
                status: "Processing",
                type: reportConfig.type,
                downloadUrl
            },
            error: null
        }
    } catch (error) {
        console.error('Error generating report:', error)
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to generate report'
        }
    }
}

export const saveReportTemplate = async (
    managerId: string,
    options: GenerateReportOptions
): Promise<{ data: ReportTemplate | null, error: string | null }> => {
    try {
        const templateId = `template-${Date.now()}`

        const templateData = {
            id: templateId,
            name: options.name,
            description: `Custom ${options.type} report`,
            category: options.type,
            tags: options.sections,
            created_by: managerId,
            last_used: new Date().toISOString(),
            config: {
                type: options.type,
                format: options.format,
                sections: options.sections,
                dateRange: options.dateRange ? {
                    from: options.dateRange.from.toISOString(),
                    to: options.dateRange.to.toISOString()
                } : undefined
            }
        }

        const { error } = await supabase
            .from('report_templates')
            .insert(templateData)

        if (error) throw error

        return {
            data: {
                id: templateId,
                name: options.name,
                description: `Custom ${options.type} report`,
                category: options.type,
                tags: options.sections,
                lastUsed: new Date().toISOString(),
                createdBy: managerId,
                config: {
                    type: options.type,
                    format: options.format,
                    sections: options.sections,
                    dateRange: options.dateRange ? {
                        from: options.dateRange.from.toISOString(),
                        to: options.dateRange.to.toISOString()
                    } : undefined
                }
            },
            error: null
        }
    } catch (error) {
        console.error('Error saving report template:', error)
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to save template'
        }
    }
}

export const scheduleReport = async (
    templateId: string,
    managerId: string,
    schedule: string,
    recipients: string[]
): Promise<{ data: ScheduledReport | null, error: string | null }> => {
    try {
        // Get template config
        const { data: template, error: templateError } = await supabase
            .from('report_templates')
            .select('*')
            .eq('id', templateId)
            .single()

        if (templateError) throw templateError
        if (!template) throw new Error("Template not found")

        // Calculate next run date based on schedule
        const nextRun = calculateNextRunDate(schedule)

        const scheduleId = `schedule-${Date.now()}`

        const { error } = await supabase
            .from('scheduled_reports')
            .insert({
                id: scheduleId,
                name: template.name,
                schedule,
                recipients,
                next_run: nextRun,
                type: template.category,
                active: true,
                created_by: managerId,
                config: template.config
            })

        if (error) throw error

        return {
            data: {
                id: scheduleId,
                name: template.name,
                schedule,
                recipients,
                nextRun,
                type: template.category,
                active: true,
                config: template.config
            },
            error: null
        }
    } catch (error) {
        console.error('Error scheduling report:', error)
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to schedule report'
        }
    }
}

function calculateNextRunDate(schedule: string): string {
    const now = new Date()
    switch (schedule) {
        case 'daily':
            now.setDate(now.getDate() + 1)
            break
        case 'weekly':
            now.setDate(now.getDate() + 7)
            break
        case 'monthly':
            now.setMonth(now.getMonth() + 1)
            break
        case 'quarterly':
            now.setMonth(now.getMonth() + 3)
            break
        default:
            now.setDate(now.getDate() + 1)
    }
    return now.toISOString()
}