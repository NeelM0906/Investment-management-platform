const express = require('express');
const router = express.Router();

// Import the compiled TypeScript modules
const { CompanyProfileService } = require('../../src/services/CompanyProfileService');

const companyProfileService = new CompanyProfileService();

// GET /api/company-profile - Get company profile (returns first/default profile)
router.get('/', async (req, res) => {
  try {
    const profile = await companyProfileService.getDefaultProfile();
    
    if (!profile) {
      return res.json({
        success: true,
        data: null
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch company profile',
        details: error.message
      }
    });
  }
});

// GET /api/company-profile/:id - Get a specific company profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await companyProfileService.getProfile(id);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    
    if (error.message === 'Company profile not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Company profile not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch company profile',
          details: error.message
        }
      });
    }
  }
});

// POST /api/company-profile - Create a new company profile
router.post('/', async (req, res) => {
  try {
    const profileData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'address', 'city', 'state', 'country', 'zipCode', 'phoneNumber'];
    const missingFields = requiredFields.filter(field => !profileData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: `Missing fields: ${missingFields.join(', ')}`
        }
      });
    }

    const profile = await companyProfileService.createProfile(profileData);
    
    res.status(201).json({
      success: true,
      data: profile,
      message: 'Company profile created successfully'
    });
  } catch (error) {
    console.error('Error creating company profile:', error);
    
    if (error.message.includes('Validation failed')) {
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
          message: 'Failed to create company profile',
          details: error.message
        }
      });
    }
  }
});

// PUT /api/company-profile/:id - Update a company profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const profile = await companyProfileService.updateProfile(id, updateData);
    
    res.json({
      success: true,
      data: profile,
      message: 'Company profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    
    if (error.message === 'Company profile not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Company profile not found'
        }
      });
    } else if (error.message.includes('Validation failed')) {
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
          message: 'Failed to update company profile',
          details: error.message
        }
      });
    }
  }
});

// DELETE /api/company-profile/:id - Delete a company profile
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await companyProfileService.deleteProfile(id);
    
    res.json({
      success: true,
      message: 'Company profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting company profile:', error);
    
    if (error.message === 'Company profile not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Company profile not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete company profile',
          details: error.message
        }
      });
    }
  }
});

module.exports = router;