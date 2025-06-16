import { supabase } from "@/utils/supabase";

interface FinancialOverview {
    monthlyPayroll: number;
    bonusPayments: number;
    otPayments: number;
    epfEtfContributions: number;
    pendingIncrements: number;
    pendingLoanRequests: number;
}

interface PendingTask {
    id: string;
    title: string;
    description: string;
    status: 'urgent' | 'in-progress' | 'pending';
    count?: number;
    deadline?: string;
}

interface RecentTransaction {
    id: string;
    type: 'salary' | 'bonus' | 'epf' | 'ot' | 'increment' | 'loan';
    title: string;
    description: string;
    amount: number;
    date: string;
    employeeName?: string;
}

interface QuickAction {
    id: string;
    title: string;
    icon: string;
    route: string;
}

export const getAccountantDashboardData = async (empId: string) => {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        const [
            monthlyPayrollData,
            bonusPaymentsData,
            otPaymentsData,
            epfEtfData,
            pendingIncrementsData,
            pendingLoansData,
            recentSalaries,
            recentBonuses,
            recentOTs,
            recentEpfEtf,
            pendingTasks
        ] = await Promise.all([
            supabase
                .from('salary')
                .select('totalSalary, salaryDate, employee(first_name, last_name)')
                .eq('extract(month from salaryDate)', currentMonth)
                .eq('extract(year from salaryDate)', currentYear),

            supabase
                .from('bonus')
                .select('amount, bonusDate, employee(first_name, last_name)')
                .eq('extract(month from bonusDate)', currentMonth)
                .eq('extract(year from bonusDate)', currentYear),

            supabase
                .from('ot')
                .select('amount, created_at, employee(first_name, last_name)')
                .eq('extract(month from created_at)', currentMonth)
                .eq('extract(year from created_at)', currentYear),

            supabase
                .from('epfNetf')
                .select('epfCalculation, etfCalculation, appliedDate, employee(first_name, last_name)')
                .eq('extract(month from appliedDate)', currentMonth)
                .eq('extract(year from appliedDate)', currentYear),

            supabase
                .from('increment')
                .select('*')
                .eq('approval', 'pending'),

            supabase
                .from('loanRequest')
                .select('*')
                .eq('status', 'pending'),

            supabase
                .from('salary')
                .select('totalSalary, salaryDate, employee(first_name, last_name)')
                .order('salaryDate', { ascending: false })
                .limit(10),

            supabase
                .from('bonus')
                .select('amount, bonusDate, type, employee(first_name, last_name)')
                .order('bonusDate', { ascending: false })
                .limit(10),

            supabase
                .from('ot')
                .select('amount, created_at, otHours, employee(first_name, last_name)')
                .order('created_at', { ascending: false })
                .limit(10),

            supabase
                .from('epfNetf')
                .select('epfCalculation, etfCalculation, appliedDate, employee(first_name, last_name)')
                .order('appliedDate', { ascending: false })
                .limit(10),

            supabase
                .from('employeeTask')
                .select('taskId, startDate, endDate, task(type, description, deadline), employee(first_name, last_name)')
                .lte('endDate', new Date().toISOString())
                .order('endDate', { ascending: true })
                .limit(10)
        ]);

        // @ts-ignore
        const monthlyPayroll = monthlyPayrollData.data?.reduce((sum, item) => sum + (item.totalSalary || 0), 0) || 0;
        // @ts-ignore
        const bonusPayments = bonusPaymentsData.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
        // @ts-ignore
        const otPayments = otPaymentsData.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
        // @ts-ignore
        const epfEtfContributions = epfEtfData.data?.reduce((sum, item) => sum + (item.epfCalculation || 0) + (item.etfCalculation || 0), 0) || 0;
        const pendingIncrements = pendingIncrementsData.data?.length || 0;
        const pendingLoanRequests = pendingLoansData.data?.length || 0;

        const financialOverview: FinancialOverview = {
            monthlyPayroll,
            bonusPayments,
            otPayments,
            epfEtfContributions,
            pendingIncrements,
            pendingLoanRequests
        };

        // @ts-ignore

        const formattedPendingTasks: PendingTask[] = pendingTasks.data?.map(task => ({
            id: task.taskId,
            // @ts-ignore
            title: task.task?.type || 'Task',
            // @ts-ignore
            description: task.task?.description || 'No description',
            status: new Date(task.endDate) < new Date() ? 'urgent' : 'pending',
            deadline: task.endDate,
            // @ts-ignore
            employeeName: `${task.employee?.first_name} ${task.employee?.last_name}`
        })) || [];

        // @ts-ignore
        const recentTransactions: RecentTransaction[] = [
            // @ts-ignore
            ...(recentSalaries.data?.map(salary => ({
                // @ts-ignore
                id: salary.salaryId,
                type: 'salary',
                title: 'Salary processed',
                // @ts-ignore
                description: `${salary.employee?.first_name} ${salary.employee?.last_name}`,
                amount: salary.totalSalary,
                date: salary.salaryDate,
                // @ts-ignore
                employeeName: `${salary.employee?.first_name} ${salary.employee?.last_name}`
            })) || []),
            // @ts-ignore
            ...(recentBonuses.data?.map(bonus => ({
                // @ts-ignore
                id: bonus.bonusId,
                type: 'bonus',
                title: `${bonus.type} bonus`,
                // @ts-ignore
                description: `${bonus.employee?.first_name} ${bonus.employee?.last_name}`,
                amount: bonus.amount,
                date: bonus.bonusDate,
                // @ts-ignore
                employeeName: `${bonus.employee?.first_name} ${bonus.employee?.last_name}`
            })) || []),
            // @ts-ignore
            ...(recentOTs.data?.map(ot => ({
                // @ts-ignore
                id: ot.otId,
                type: 'ot',
                title: 'OT payment',
                description: `${ot.otHours} hours`,
                amount: ot.amount,
                date: ot.created_at,
                // @ts-ignore
                employeeName: `${ot.employee?.first_name} ${ot.employee?.last_name}`
            })) || []),
            // @ts-ignore
            ...(recentEpfEtf.data?.map(epf => ({
                // @ts-ignore
                id: epf.epfAndEtfId,
                type: 'epf',
                title: 'EPF/ETF contribution',
                description: 'Monthly deduction',
                amount: (epf.epfCalculation || 0) + (epf.etfCalculation || 0),
                date: epf.appliedDate,
                // @ts-ignore
                employeeName: `${epf.employee?.first_name} ${epf.employee?.last_name}`
            })) || [])
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        const quickActions: QuickAction[] = [
            { id: '1', title: 'Process Salary', icon: 'Calculator', route: '/accountant/salary-calculation' },
            { id: '2', title: 'Manage Bonuses', icon: 'TrendingUp', route: '/accountant/bonus-calculation' },
            { id: '3', title: 'OT Management', icon: 'Clock', route: '/accountant/ot-calculation' },
            { id: '4', title: 'EPF/ETF', icon: 'PiggyBank', route: '/accountant/epf-etf-management' },
            { id: '5', title: 'Increments', icon: 'TrendingUp', route: '/accountant/increment-management' },
            { id: '6', title: 'Loan Requests', icon: 'CreditCard', route: '/accountant/check-loan-eligibility' }
        ];

        return {
            financialOverview,
            pendingTasks: formattedPendingTasks,
            recentTransactions,
            quickActions,
            pendingIncrementsCount: pendingIncrements,
            pendingLoanRequestsCount: pendingLoanRequests,
            error: null
        };
    } catch (error) {
        console.error('Dashboard data error:', error);
        return {
            financialOverview: null,
            pendingTasks: null,
            recentTransactions: null,
            quickActions: null,
            error: error instanceof Error ? error.message : 'Failed to fetch dashboard data'
        };
    }
};

export const getAccountantDetails = async (empId: string) => {
    try {
        const { data, error } = await supabase
            .from('employee')
            .select(`
        empId,
        first_name,
        last_name,
        email,
        position,
        department,
        status,
        telNumber,
        salary:salary!empId(totalSalary, salaryDate),
        attendance:attendance!empId(status, date),
        kpi:kpi!empId(kpiValue, kpiRanking:kpiRanking(kpiRank))
      `)
            .eq('empId', empId)
            .single();

        if (error) throw error;

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const monthlyAttendance = data.attendance?.filter((att: any) => {
            const attDate = new Date(att.date);
            return attDate.getMonth() + 1 === currentMonth &&
                attDate.getFullYear() === currentYear;
        }) || [];

        const presentDays = monthlyAttendance.filter((att: any) => att.status === 'present').length;
        const absentDays = monthlyAttendance.filter((att: any) => att.status === 'absent').length;

        const latestSalary = data.salary?.[0]?.totalSalary || 0;
        const latestKpi = data.kpi?.[0]?.kpiValue || 0;
        // @ts-ignore
        const kpiRank = data.kpi?.[0]?.kpiRanking?.kpiRank || 'Not rated';

        return {
            details: {
                ...data,
                fullName: `${data.first_name} ${data.last_name}`,
                attendanceStats: {
                    presentDays,
                    absentDays,
                    totalDays: presentDays + absentDays
                },
                salary: latestSalary,
                kpi: {
                    value: latestKpi,
                    rank: kpiRank
                }
            },
            error: null
        };
    } catch (error) {
        return {
            details: null,
            error: error instanceof Error ? error.message : 'Failed to fetch accountant details'
        };
    }
};