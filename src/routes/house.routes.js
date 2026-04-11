import { Router } from 'express';
import * as houseController from '../controllers/house.controller.js';
const router = Router();
router.get('/', houseController.getAllHouses);
router.post('/', houseController.createHouse);
router.patch('/:id', houseController.updateHouse);
router.delete('/:id', houseController.deleteHouse);
export default router;
