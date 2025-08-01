const express = require('express');
const router = express.Router();
const { DebtEquityClassService } = require('../../dist/src/services/DebtEquityClassService');

const debtEquityClassService = new DebtEquityClassService();

// GET /api/debt-equity-classes
router.get('/', async (req, res) => {
  try {
    const classes = await debtEquityClassService.getAllClasses();
    res.json({ success: true, data: classes });
  } catch (error) {
    console.error('Error fetching debt equity classes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/debt-equity-classes
router.post('/', async (req, res) => {
  try {
    const newClass = await debtEquityClassService.createClass(req.body);
    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    console.error('Error creating debt equity class:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/debt-equity-classes/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedClass = await debtEquityClassService.updateClass(req.params.id, req.body);
    if (!updatedClass) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    res.json({ success: true, data: updatedClass });
  } catch (error) {
    console.error('Error updating debt equity class:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/debt-equity-classes/:id
router.delete('/:id', async (req, res) => {
  try {
    const success = await debtEquityClassService.deleteClass(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting debt equity class:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;