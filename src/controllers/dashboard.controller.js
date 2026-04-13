import * as dashboardService from '../services/dashboard.service.js';

export const getStats = async (req, res) => {
  try {
    // NOTE: globalSyncCharges removed from here - it was exhausting the DB connection pool
    // by running N sequential queries per resident on every dashboard load.
    // Charges are synced individually when viewing a resident's ledger page.
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
