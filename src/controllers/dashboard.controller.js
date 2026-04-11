import * as chargeService from '../services/charge.service.js';
import * as dashboardService from '../services/dashboard.service.js';

export const getStats = async (req, res) => {
  try {
    // Automatically generate due charges for all residents before fetching stats
    await chargeService.globalSyncCharges();
    
    const stats = await dashboardService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const activity = await dashboardService.getRecentActivity();
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
