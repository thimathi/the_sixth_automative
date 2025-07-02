import * as performanceModel from '../../models/manager/performanceModel.js';

export const getPerformanceRatings = async (filters) => {
    return performanceModel.getPerformanceRatings(filters);
}

export const updatePerformanceRating = async (rating_id, ratingData) => {
    try{
        return await performanceModel.updatePerformanceRating(rating_id, ratingData);
    }
    catch (error) {
        console.error('Error in employeeService.updatePerformanceRating:', error);
        throw error;
    }
}

export const exportPerformanceData = async (managerId) => {
    return await performanceModel.exportPerformanceData(managerId);
};

export const createPerformanceData = async (ratingData) => {
    try{
        return await performanceModel.createPerformanceRating(ratingData);
    }
    catch (error) {
        console.error('Error in employeeService.createPerformanceData:', error);
        throw error;
    }
}