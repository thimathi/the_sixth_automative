import { supabase } from "@/utils/supabase"

export const getTrainingSessions = async (): Promise<any[]> => {
    try {
        const { data, error } = await supabase
            .from('training')
            .select(`
        trainingId,
        topic,
        venue,
        trainer,
        duration,
        date,
        empId,
        status:status
      `)
            .order('date', { ascending: true })

        if (error) throw error

        return data?.map(session => ({
            id: session.trainingId,
            title: session.topic,
            department: session.empId?.department || 'All',
            trainer: session.trainer,
            startDate: session.date,
            endDate: new Date(new Date(session.date).getTime() + session.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            duration: `${session.duration} day${session.duration > 1 ? 's' : ''}`,
            location: session.venue,
            participants: 0, // You would typically fetch this from a join table
            status: session.status || 'Upcoming'
        })) || []
    } catch (error) {
        console.error('Error fetching training sessions:', error)
        throw error instanceof Error ? error : new Error('Failed to fetch training sessions')
    }
}

export const createTrainingSession = async (trainingData: any): Promise<void> => {
    try {
        const { error } = await supabase
            .from('training')
            .insert({
                topic: trainingData.title,
                venue: trainingData.location,
                trainer: trainingData.trainer,
                duration: trainingData.duration,
                date: trainingData.startDate,
                empId: trainingData.empId || null,
                status: 'Upcoming'
            })

        if (error) throw error
    } catch (error) {
        console.error('Error creating training session:', error)
        throw error instanceof Error ? error : new Error('Failed to create training session')
    }
}

export const getTrainingStats = async (): Promise<any> => {
    try {
        // Get upcoming trainings count (next 30 days)
        const thirtyDaysLater = new Date()
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

        const { count: upcomingTrainings } = await supabase
            .from('training')
            .select('*', { count: 'exact' })
            .gte('date', new Date().toISOString().split('T')[0])
            .lte('date', thirtyDaysLater.toISOString().split('T')[0])

        // Get completed trainings count (this year)
        const currentYear = new Date().getFullYear()
        const { count: completedTrainings } = await supabase
            .from('training')
            .select('*', { count: 'exact' })
            .eq('status', 'Completed')
            .gte('date', `${currentYear}-01-01`)
            .lte('date', `${currentYear}-12-31`)

        // Get trainers count (simplified)
        const { count: trainersCount } = await supabase
            .from('training')
            .select('trainer', { count: 'exact' })

        return {
            upcomingTrainings: upcomingTrainings || 0,
            completedTrainings: completedTrainings || 0,
            budgetUsed: 15000, // This would typically come from a budget table
            totalBudget: 45000,
            trainersCount: trainersCount || 0
        }
    } catch (error) {
        console.error('Error fetching training stats:', error)
        throw error instanceof Error ? error : new Error('Failed to fetch training statistics')
    }
}

export const getDepartments = async (): Promise<string[]> => {
    try {
        const { data: departments, error } = await supabase
            .from('employee')
            .select('department')
            .neq('department', null)

        if (error) throw error

        // Remove duplicates and return unique departments
        return Array.from(new Set(departments?.map(d => d.department).filter(Boolean))) as string[]
    } catch (error) {
        console.error('Error fetching departments:', error)
        throw error instanceof Error ? error : new Error('Failed to fetch departments')
    }
}