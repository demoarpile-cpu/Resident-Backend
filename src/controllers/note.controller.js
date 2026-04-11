import prisma from '../config/prisma.js';

export const createNote = async (req, res) => {
  try {
    const { residentId, text, author } = req.body;
    const note = await prisma.note.create({
      data: {
        residentId,
        text,
        author: author || 'Admin'
      }
    });
    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const note = await prisma.note.update({
      where: { id },
      data: { text }
    });
    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.note.delete({ where: { id } });
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
