import * as houseService from '../services/house.service.js';

export const getAllHouses = async (req, res) => {
  try {
    const houses = await houseService.getAllHouses();
    res.json({ success: true, data: houses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createHouse = async (req, res) => {
  try {
    const house = await houseService.createHouse(req.body);
    res.json({ success: true, data: house });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateHouse = async (req, res) => {
  try {
    const { id } = req.params;
    const house = await houseService.updateHouse(id, req.body);
    res.json({ success: true, data: house });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteHouse = async (req, res) => {
  try {
    const { id } = req.params;
    await houseService.deleteHouse(id);
    res.json({ success: true, message: 'House deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
