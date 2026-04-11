import * as bankService from '../services/bank.service.js';

export const getTransactions = async (req, res) => {
  try {
    const transactions = await bankService.getTransactions();
    // Add suggestions for each unmatched transaction
    const withSuggestions = await Promise.all(transactions.map(async tx => {
      if (tx.status === 'UNMATCHED') {
        const suggestion = await bankService.getSuggestedResident(tx.description);
        return { ...tx, suggestion };
      }
      return tx;
    }));
    res.json({ success: true, data: withSuggestions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const uploadCSV = async (req, res) => {
  try {
    // In a real app, parse req.file. Path is for mock/demo
    // Expecting array of { date, description, amount } in req.body for now
    const transactions = req.body.transactions; 
    const result = await bankService.uploadTransactions(transactions);
    res.json(result);
  } catch (error) {
    console.error('Upload CSV Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const matchTransaction = async (req, res) => {
  try {
    const { transactionId, residentId, allocations } = req.body;
    const payment = await bankService.matchTransaction(transactionId, residentId, allocations);
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const autoReconcile = async (req, res) => {
  try {
    const result = await bankService.autoReconcile();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await bankService.deleteTransaction(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const unmatchTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await bankService.unmatchTransaction(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
