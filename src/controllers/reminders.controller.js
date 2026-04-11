import * as remindersService from '../services/reminders.service.js';

export const getOverdueResidents = async (req, res) => {
  try {
    const overdue = await remindersService.getOverdueResidents();
    res.json({ success: true, data: overdue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const batchSendReminders = async (req, res) => {
  try {
    const { residentIds, template, signature } = req.body;
    await remindersService.sendReminders(residentIds, { template, signature });
    res.json({ success: true, message: `Successfully updated ${residentIds.length} reminders.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
