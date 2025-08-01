const express = require('express');
const router = express.Router();

// Import the compiled TypeScript modules
const { CustomUnitClassService } = require('../../src/services/CustomUnitClassService');

const customUnitClassService = new CustomUnitClassService();

// GET /api/custom-unit-classes - Get all custom unit class names
router.get('/', async (req, res) => {
  try {
    const customClasses = await customUnitClassService.getAllCustomClasses();
    
    res.json({
      success: true,
      data: customClasses
    });
  } catch (error) {
    console.error('Error fetching custom unit classes:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch custom unit classes',
        details: error.message
      }
    });
  }
});

// POST /api/custom-unit-classes - Create a new custom unit class name
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Custom class name is required and must be a non-empty string'
        }
      });
    }

    const customClass = await customUnitClassService.createCustomClass({ name: name.trim() });
    
    res.status(201).json({
      success: true,
      data: customClass,
      message: 'Custom unit class created successfully'
    });
  } catch (error) {
    console.error('Error creating custom unit class:', error);
    
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Custom class name already exists'
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
          code: 'CREATE_ERROR',
          message: 'Failed to create custom unit class',
          details: error.message
        }
      });
    }
  }
});

// DELETE /api/custom-unit-classes/:id - Delete a custom unit class
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Custom class ID is required'
        }
      });
    }

    await customUnitClassService.deleteCustomClass(id);
    
    res.json({
      success: true,
      message: 'Custom unit class deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting custom unit class:', error);
    
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Custom unit class not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete custom unit class',
          details: error.message
        }
      });
    }
  }
});

module.exports = router;