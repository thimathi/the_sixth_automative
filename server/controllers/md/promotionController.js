import * as promotionService from '../../services/md/promotionService.js';

export const getPromotionData = async (req, res) => {
    try {
        const { userId } = req.query;
        const data = await promotionService.getPromotionData(userId);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in promotion controller:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch promotion data'
        });
    }
};

export const initiatePromotion = async (req, res) => {
    try {
        const result = await promotionService.initiatePromotion(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error initiating promotion:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to initiate promotion'
        });
    }
};