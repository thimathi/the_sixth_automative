import * as performanceService from '../../services/manager/performanceService.js';

export const getPerformanceRatings = async (req, res) => {
    try{
        const ratings = await performanceService.getPerformanceRatings();
        res.json({
            success: true,
            data: ratings,
        });
    }
    catch (error) {
        console.error('Error in getPerformanceRatings:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch performance ratings'
        });
    }
};


export const createPerformanceRating = async (req, res) => {
    try{
        const newRating = await performanceService.createPerformanceData(req.body);
        res.status(200).json({
            success: true,
            message: 'Rating created successfully',
            data: newRating
        });
    }
    catch (error) {
        console.error('Error in createPerformanceRating:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create performance rating'
        });
    }
};