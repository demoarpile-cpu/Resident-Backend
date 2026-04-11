import * as reportsService from '../services/reports.service.js';

export const getFinancialSummary = async (req, res) => {
  try {
    const summary = await reportsService.getFinancialSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMonthlyTrends = async (req, res) => {
  try {
    const trends = await reportsService.getMonthlyTrends();
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
