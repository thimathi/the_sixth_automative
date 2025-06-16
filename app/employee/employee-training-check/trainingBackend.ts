import { supabase } from "@/utils/supabase";

interface Training {
    trainingId: string;
    title: string;
    provider: string;
    startDate: string;
    endDate: string;
    duration: string;
    format: string;
    status: string;
    progress: number;
    mandatory: boolean;
    completedDate?: string;
    score?: number;
    certificateNumber?: string;
    expiryDate?: string;
    registrationDeadline?: string;
}

interface TrainingStats {
    totalCompleted: number;
    currentEnrollments: number;
    averageScore: number;
    certificatesEarned: number;
}

export const getCurrentTrainings = async (empId: string): Promise<Training[]> => {
    try {
        const { data: employeeTrainings, error } = await supabase
            .from('employeeTraining')
            .select('*, training:trainingId(*)')
            .eq('empId', empId)
            .lte('startTime', new Date().toISOString())
            .gte('endTime', new Date().toISOString())
            .order('startTime', { ascending: true });

        if (error) throw error;

        return employeeTrainings?.map(training => ({
            trainingId: training.trainingId,
            title: training.training?.topic || 'Unnamed Training',
            provider: training.training?.trainer || 'Internal',
            startDate: new Date(training.startTime).toISOString().split('T')[0],
            endDate: new Date(training.endTime).toISOString().split('T')[0],
            duration: `${training.training?.duration || 1} day(s)`,
            format: training.training?.venue?.includes('Online') ? 'Online' : 'Classroom',
            status: 'In Progress',
            progress: 0, // You might calculate this based on time elapsed
            mandatory: true // Default to true or add a field in your DB
        })) || [];
    } catch (error) {
        console.error('Error fetching current trainings:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch current trainings');
    }
};

export const getCompletedTrainings = async (empId: string): Promise<Training[]> => {
    try {
        const { data: employeeTrainings, error } = await supabase
            .from('employeeTraining')
            .select('*, training:trainingId(*)')
            .eq('empId', empId)
            .lt('endTime', new Date().toISOString())
            .order('endTime', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Get KPI ratings for completed trainings
        const { data: kpis, error: kpiError } = await supabase
            .from('kpi')
            .select('*')
            .eq('empId', empId);

        if (kpiError) throw kpiError;
        //@ts-ignore
        return employeeTrainings?.map(training => {
            const trainingKpi = kpis?.find(k => k.trainingId === training.trainingId);
            return {
                trainingId: training.trainingId,
                title: training.training?.topic || 'Unnamed Training',
                provider: training.training?.trainer || 'Internal',
                completedDate: new Date(training.endTime).toISOString().split('T')[0],
                duration: `${training.training?.duration || 1} day(s)`,
                score: trainingKpi?.kpiValue || 0,
                certificateNumber: `CERT-${training.trainingId.slice(0, 8).toUpperCase()}`,
                expiryDate: new Date(new Date(training.endTime).setFullYear(new Date(training.endTime).getFullYear() + 2))
                    .toISOString().split('T')[0],
                status: 'Completed',
                progress: 100,
                mandatory: true
            };
        }) || [];
    } catch (error) {
        console.error('Error fetching completed trainings:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch completed trainings');
    }
};

export const getUpcomingTrainings = async (empId: string): Promise<Training[]> => {
    try {
        const { data: employeeTrainings, error } = await supabase
            .from('employeeTraining')
            .select('*, training:trainingId(*)')
            .eq('empId', empId)
            .gt('startTime', new Date().toISOString())
            .order('startTime', { ascending: true });

        if (error) throw error;

        //@ts-ignore
        return employeeTrainings?.map(training => ({
            trainingId: training.trainingId,
            title: training.training?.topic || 'Unnamed Training',
            provider: training.training?.trainer || 'Internal',
            startDate: new Date(training.startTime).toISOString().split('T')[0],
            duration: `${training.training?.duration || 1} day(s)`,
            format: training.training?.venue?.includes('Online') ? 'Online' : 'Classroom',
            mandatory: true,
            registrationDeadline: new Date(new Date(training.startTime).setDate(new Date(training.startTime).getDate() - 7))
                .toISOString().split('T')[0],
            status: 'Upcoming'
        })) || [];
    } catch (error) {
        console.error('Error fetching upcoming trainings:', error);
        throw error instanceof Error ? error : new Error('Failed to fetch upcoming trainings');
    }
};

export const getTrainingStats = async (empId: string): Promise<TrainingStats> => {
    try {
        const [currentTrainings, completedTrainings] = await Promise.all([
            getCurrentTrainings(empId),
            getCompletedTrainings(empId)
        ]);

        const averageScore = completedTrainings.length > 0
            ? completedTrainings.reduce((sum, training) => sum + (training.score || 0), 0) / completedTrainings.length
            : 0;

        return {
            totalCompleted: completedTrainings.length,
            currentEnrollments: currentTrainings.length,
            averageScore,
            certificatesEarned: completedTrainings.length
        };
    } catch (error) {
        console.error('Error calculating training stats:', error);
        throw error instanceof Error ? error : new Error('Failed to calculate training stats');
    }
};