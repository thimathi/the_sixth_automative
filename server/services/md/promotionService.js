import * as promotionModel from '../../models/md/promotionModel.js';

// Helper functions
function getProposedPosition(currentPosition) {
    const positions = {
        'Senior Mechanic': 'Lead Technician',
        'Service Advisor': 'Service Manager',
        'Parts Specialist': 'Parts Supervisor',
        'Junior Mechanic': 'Mechanic',
        'Mechanic': 'Senior Mechanic'
    };
    return positions[currentPosition] || 'Senior ' + currentPosition;
}

function getReadinessLevel(kpiScore) {
    if (!kpiScore) return 'Developing';
    const rating = kpiScore / 100;
    if (rating >= 4.5) return 'Ready';
    if (rating >= 4.0) return 'Nearly Ready';
    return 'Developing';
}

function getSalaryIncrease(position, currentSalary) {
    if (!currentSalary) return '+15% (N/A)';

    const increases = {
        'Senior Mechanic': 0.15,
        'Service Advisor': 0.20,
        'Parts Specialist': 0.12,
        'Junior Mechanic': 0.18
    };

    const increasePercentage = increases[position] || 0.15;
    const increaseAmount = currentSalary * increasePercentage;

    return `+${Math.round(increasePercentage * 100)}% ($${increaseAmount.toLocaleString()})`;
}

// Main service functions
export const getPromotionData = async (userId) => {
    try {
        const [
            candidates,
            approvers,
            history,
            criteria,
            stats
        ] = await Promise.all([
            promotionModel.getPromotionCandidates(),
            promotionModel.getRequiredApprovers(),
            promotionModel.getPromotionHistory(),
            promotionModel.getPromotionCriteria(),
            promotionModel.getPromotionStats()
        ]);

        // Format dates in a MySQL version-agnostic way
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        // Calculate effective date (2 months from now)
        const effectiveDate = new Date();
        effectiveDate.setMonth(effectiveDate.getMonth() + 2);
        const formattedEffectiveDate = formatDate(effectiveDate);

        return {
            promotionCandidates: candidates.map(emp => ({
                id: emp.empId,
                name: emp.name,
                currentPosition: emp.position,
                proposedPosition: getProposedPosition(emp.position),
                department: emp.department,
                tenure: emp.tenure,
                performanceRating: emp.kpiScore ? (emp.kpiScore / 100) : 0,
                readiness: getReadinessLevel(emp.kpiScore),
                salaryIncrease: getSalaryIncrease(emp.position, emp.currentSalary),
                effectiveDate: formattedEffectiveDate,
                lastReview: formatDate(new Date()),
                avatar: emp.avatar || "/placeholder.svg?height=48&width=48",
                assessment: {
                    skills: Math.floor(Math.random() * 15) + 80,
                    leadership: Math.floor(Math.random() * 20) + 70,
                    experience: Math.floor(Math.random() * 15) + 75
                },
                currentSalary: emp.currentSalary ? `$${emp.currentSalary.toLocaleString()}` : 'N/A'
            })),
            requiredApprovers: approvers.map(approver => ({
                id: approver.empId,
                name: approver.name,
                position: approver.position,
                role: approver.role === 'md' ? 'Final Approver' :
                    approver.role === 'hr_manager' ? 'Policy Review' : 'Performance Review',
                avatar: approver.avatar || "/placeholder.svg?height=32&width=32"
            })),
            promotionHistory: history.map(promo => ({
                id: promo.promotionId,
                employee: {
                    name: `${promo.first_name} ${promo.last_name}`,
                    avatar: promo.avatar || "/placeholder.svg?height=40&width=40"
                },
                fromPosition: promo.oldPosition,
                toPosition: promo.newPosition,
                department: promo.department,
                salaryChange: `+${Math.round(promo.salaryIncrease * 100)}% ($${(promo.salaryIncrease * 50000).toLocaleString()})`,
                status: promo.status === 'Approved' ? 'Completed' : 'Pending',
                date: formatDate(promo.promotionDate),
                effectiveDate: formatDate(promo.promotionDate),
                approvedBy: "Managing Director",
                notes: promo.notes
            })),
            promotionCriteria: criteria.map(criteria => ({
                position: criteria.position,
                requirements: criteria.requirements.split('|'),
                qualifications: criteria.qualifications.split('|'),
                salaryRange: criteria.salary_range
            })),
            stats: {
                candidates: stats.candidates || 12,
                pendingReviews: stats.pendingReviews || 5,
                promotionsThisYear: stats.promotionsThisYear || 18,
                successRate: stats.successRate || 94
            }
        };
    } catch (error) {
        console.error('Error in promotion service:', error);
        throw error;
    }
};

export const initiatePromotion = async (promotionData) => {
    try {
        // Validate required fields
        if (!promotionData.employeeId || !promotionData.oldPosition || !promotionData.newPosition) {
            throw new Error('Missing required promotion data');
        }

        const promotionId = await promotionModel.createPromotion(promotionData);
        return { success: true, promotionId };
    } catch (error) {
        console.error('Error initiating promotion:', error);
        throw error;
    }
};