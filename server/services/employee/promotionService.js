import * as promotionModel from '../../models/employee/promotionModel.js';

export const getCurrentPosition = async (empId) => {
    try {
        const position = await promotionModel.getCurrentPosition(empId);
        if (!position) {
            throw new Error('Current position data not available');
        }
        return position;
    } catch (error) {
        console.error('Promotion Service Error - getCurrentPosition:', error);
        throw new Error(`Failed to get current position: ${error.message}`);
    }
};

export const getPromotionHistory = async (empId) => {
    try {
        const history = await promotionModel.getPromotionHistory(empId);
        return history || [];
    } catch (error) {
        console.error('Promotion Service Error - getPromotionHistory:', error);
        throw new Error(`Failed to get promotion history: ${error.message}`);
    }
};

export const getEligiblePositions = async (empId) => {
    try {
        const positions = await promotionModel.getEligiblePositions(empId);
        return positions || [];
    } catch (error) {
        console.error('Promotion Service Error - getEligiblePositions:', error);
        throw new Error(`Failed to get eligible positions: ${error.message}`);
    }
};

export const getPromotionCriteria = async (empId) => {
    try {
        const criteria = await promotionModel.getPromotionCriteria(empId);
        return criteria || [];
    } catch (error) {
        console.error('Promotion Service Error - getPromotionCriteria:', error);
        throw new Error(`Failed to get promotion criteria: ${error.message}`);
    }
};