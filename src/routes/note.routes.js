import express from 'express';
import * as noteController from '../controllers/note.controller.js';

const router = express.Router();

router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

export default router;
