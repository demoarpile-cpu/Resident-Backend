import * as settingsService from '../services/settings.service.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (settings) {
      console.log(`[DEBUG] Updating settings with keys:`, Object.keys(settings));
      const payloadSize = JSON.stringify(settings).length;
      console.log(`[DEBUG] Estimated settings payload size: ${(payloadSize / 1024).toFixed(2)} KB`);
    } else {
      console.warn('[DEBUG] updateSettings called with no settings in payload');
    }

    await settingsService.updateSettings(settings);
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('[SETTINGS ERROR FULL STACK]:', error);
    // Returning the actual error message to help debug 500 error
    res.status(500).json({ success: false, error: `Server Error: ${error.message}` });
  }
};

export const getIntegrations = async (req, res) => {
  try {
    await settingsService.seedSystemConfig(); // Ensure seeds exist
    const integrations = await settingsService.getIntegrations();
    res.json({ success: true, data: integrations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await settingsService.updateIntegration(id, data);
    res.json({ success: true, message: 'Integration updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
