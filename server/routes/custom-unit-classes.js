const express = require('express');
const router = express.Router();
const { CustomUnitClassService } = require('../../dist/src/services/CustomUnitClassService');

const customUnitClassService = new CustomUnitClassService();

// GET /api/custom-unit-classes
router.get('/', async (req, res) => {
  try {
    const classes = await customUnitClassService.getAllClasses();
    res.json({ success: true, data: classes });
  } catch (error) {
    console.error('Error fetching custom unit classes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/custom-unit-classes
router.post('/', async (req, res) => {
  try {
    const newClass = await customUnitClassService.createClass(req.body);
    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    console.error('Error creating custom unit class:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;