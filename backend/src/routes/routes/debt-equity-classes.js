const express = require('express');
const router = express.Router();

// Import the compiled TypeScript modules
const { DebtEquityClassService } = require('../../src/services/DebtEquityClassService');
const { CustomUnitClassService } = require('../../src/services/CustomUnitClassService');

const debtEquityClassService = new DebtEquityClassService();
const customUnitClassService = new CustomUnitClassService();

// PUT /api/debt-equity-classes/:classId - Update an existing debt or equity class
router.put('/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const updateData = req.body;
    
    const debtEquityClass = await debtEquityClassService.updateClass(classId, updateData);
    
    res.json({
      success: true,
      data: debtEquityClass,
      message: 'Debt equity class updated successfully'
    });
  } catch (error) {
    console.error('Error updating debt equity class:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Debt equity class not found'
        }
      });
    } else if (error.message.includes('Validation failed') || error.message.includes('Invalid')) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update debt equity class',
          details: error.message
        }
      });
    }
  }
});

// DELETE /api/debt-equity-classes/:classId - Delete a debt or equity class
router.delete('/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    
    await debtEquityClassService.deleteClass(classId);
    
    res.json({
      success: true,
      message: 'Debt equity class deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting debt equity class:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Debt equity class not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete debt equity class',
          details: error.message
        }
      });
    }
  }
});



module.exports = router;