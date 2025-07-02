import * as bonusModel from '../../models/accountant/bonusModel.js';
import { processBonus as processBonusModel } from '../../models/accountant/bonusModel.js';

export const getEmployees = async (filters = {}) => {
    try {
        // Validate filters
        const validatedFilters = {
            department: filters.department || null,
            performanceThreshold: filters.performanceThreshold && !isNaN(filters.performanceThreshold)
                ? Math.max(0, Math.min(100, filters.performanceThreshold))
                : null,
            year: filters.year && !isNaN(filters.year)
                ? Math.max(2000, Math.min(2100, filters.year))
                : new Date().getFullYear()
        };

        const employees = await bonusModel.fetchEmployees(validatedFilters);

        // Calculate eligibility for bonus
        return employees.map(employee => ({
            ...employee,
            bonusEligible: employee.performance >= 80, // Example threshold
            recentBonuses: employee.recentBonuses || []
        }));
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw new Error('Failed to process employee data');
    }
};

export const getBonusHistory = async (filters) => {
    try {
        // Validate and sanitize filters
        const validatedFilters = {
            year: Math.max(2000, Math.min(2100, filters.year)),
            employeeId: filters.employeeId || null,
            type: filters.type || null,
            minAmount: filters.minAmount && filters.minAmount >= 0 ? filters.minAmount : null,
            maxAmount: filters.maxAmount && filters.maxAmount >= 0 ? filters.maxAmount : null,
            page: filters.page,
            pageSize: filters.pageSize
        };

        // Get data from model
        const history = await bonusModel.fetchBonusHistory(validatedFilters);

        // Calculate summary statistics
        const totalAmount = history.results.reduce((sum, bonus) => sum + bonus.amount, 0);
        const averageAmount = history.results.length > 0
            ? totalAmount / history.results.length
            : 0;

        // Get unique bonus types
        const types = [...new Set(history.results.map(b => b.type))];

        return {
            results: history.results,
            totalCount: history.totalCount,
            totalAmount,
            averageAmount,
            types
        };
    } catch (error) {
        console.error('Error processing bonus history:', error);
        throw new Error('Failed to process bonus history data');
    }
};

export const processBonus = async (employeeId, type, amount, reason) => {
    try {
        // Validate input
        console.log(employeeId);
        console.log(type);
        console.log(amount);
        console.log(reason);
        if (!employeeId || !type || !amount || !reason ) {
            throw new Error('All fields are required');
        }

        if (isNaN(amount) || amount <= 0) {
            throw new Error('Amount must be a positive number');
        }

        // Process bonus through model
        const result = await processBonusModel(employeeId, type, amount, reason);

        if (!result || !result.success) {
            throw new Error(result?.error || 'Failed to process bonus');
        }

        return {
            success: true,
            bonusId: result.bonusId
        };
    } catch (error) {
        console.error('Error in bonus service:', error);
        throw error;
    }
};