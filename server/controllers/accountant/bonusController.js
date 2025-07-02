import * as bonusService from '../../services/accountant/bonusService.js';

export const getEmployees = async (req, res) => {
    try {
        const { department, performanceThreshold, year } = req.query;

        const employees = await bonusService.getEmployees({
            department,
            performanceThreshold: performanceThreshold ? Number(performanceThreshold) : null,
            year: year || new Date().getFullYear()
        });

        res.json({
            success: true,
            data: employees,
            meta: {
                count: employees.length,
                departments: [...new Set(employees.map(e => e.department))],
                performanceRange: employees.length > 0 ? {
                    min: Math.min(...employees.map(e => e.performance)),
                    max: Math.max(...employees.map(e => e.performance))
                } : null
            }
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch employees',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const getBonusHistory = async (req, res) => {
    try {
        const {
            year = new Date().getFullYear(),
            employeeId,
            type,
            minAmount,
            maxAmount,
            page = 1,
            pageSize = 10
        } = req.query;

        // Validate pagination
        const validatedPage = Math.max(1, parseInt(page) || 1);
        const validatedPageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 10));

        const history = await bonusService.getBonusHistory({
            year: parseInt(year),
            employeeId,
            type,
            minAmount: minAmount ? parseFloat(minAmount) : null,
            maxAmount: maxAmount ? parseFloat(maxAmount) : null,
            page: validatedPage,
            pageSize: validatedPageSize
        });

        res.json({
            success: true,
            data: history.results,
            pagination: {
                currentPage: validatedPage,
                pageSize: validatedPageSize,
                totalItems: history.totalCount,
                totalPages: Math.ceil(history.totalCount / validatedPageSize)
            },
            summary: {
                totalAmount: history.totalAmount,
                averageAmount: history.averageAmount,
                types: history.types
            }
        });
    } catch (error) {
        console.error('Error fetching bonus history:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch bonus history',
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};

export const processBonus = async (req, res) => {
    try {
        const { employeeId, type, amount, reason } = req.body;
        if (!employeeId || !type || !amount || !reason) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const result = await processBonus(employeeId, type, amount, reason);

        if (result.success) {
            return res.status(201).json({
                success: true,
                message: 'Bonus processed successfully',
                bonusId: result.bonusId
            });
        } else {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error in bonus controller:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};