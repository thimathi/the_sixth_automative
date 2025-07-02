const performanceModel = require('../../models/md/performanceModel');

module.exports = {
    getPerformanceData: async (userId) => {
        try {
            const [
                overallPerformance,
                topPerformers,
                improvementNeeded,
                departmentAverage,
                departmentPerformance,
                kpis,
                performanceMetrics,
                employeePerformance
            ] = await Promise.all([
                performanceModel.getOverallPerformance(),
                performanceModel.getTopPerformers(),
                performanceModel.getImprovementNeeded(),
                performanceModel.getDepartmentAverage(),
                performanceModel.getDepartmentPerformance(),
                performanceModel.getKPIs(),
                performanceModel.getPerformanceMetrics(),
                performanceModel.getEmployeePerformance()
            ]);

            return {
                overallPerformance,
                topPerformers,
                improvementNeeded,
                departmentAverage,
                departmentPerformance,
                kpis,
                performanceMetrics,
                employeePerformance,
                performanceInsights: getDefaultPerformanceInsights(),
                departmentAnalysis: departmentPerformance.map(dept => ({
                    name: dept.name,
                    employees: Math.floor(Math.random() * 20) + 10,
                    overallRating: dept.score,
                    productivity: Math.floor(Math.random() * 20) + 80,
                    qualityScore: Math.floor(Math.random() * 20) + 80,
                    customerSatisfaction: Math.floor(Math.random() * 20) + 80,
                    achievements: getDepartmentAchievements(dept.name)
                })),
                performanceGoals: getDefaultPerformanceGoals()
            };
        } catch (error) {
            console.error('Error in performance service:', error);
            throw error;
        }
    }
};

// Helper functions
function getDepartmentAchievements(department) {
    const achievements = {
        'Service': [
            "Exceeded monthly service targets by 15%",
            "Reduced average service time by 20 minutes"
        ],
        'Parts': [
            "Improved inventory turnover by 12%",
            "Reduced parts shortage incidents by 25%"
        ],
        'Sales': [
            "Increased upselling by 18%",
            "Improved customer follow-up process"
        ],
        'Admin': [
            "Streamlined documentation processes",
            "Reduced processing time by 30%"
        ]
    };
    return achievements[department] || ["No achievements recorded"];
}

function getDefaultPerformanceInsights() {
    return [
        {
            id: 1,
            type: "positive",
            title: "Service Department Exceeding Targets",
            description: "The service department has consistently exceeded efficiency targets for the past 3 months.",
            department: "Service",
            impact: "High",
        }
    ];
}

function getDefaultPerformanceGoals() {
    return [
        {
            id: "1",
            title: "Increase Service Department Efficiency by 20%",
            description: "Implement new tools and processes to improve service completion times and quality.",
            status: "On Track",
            progress: 75,
            department: "Service",
            dueDate: "Dec 31, 2023",
            owner: {
                name: "Michael Chen",
                position: "Service Manager",
                avatar: "/placeholder.svg?height=32&width=32",
            },
        }
    ];
}