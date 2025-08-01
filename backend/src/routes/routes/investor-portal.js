const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { InvestorPortalService } = require('../../src/services/InvestorPortalService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'images');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const investorPortalService = new InvestorPortalService();

// Get portal configuration
router.get('/', async (req, res) => {
  try {
    const portal = await investorPortalService.getPortalConfiguration();
    res.json(portal);
  } catch (error) {
    console.error('Error getting portal configuration:', error);
    res.status(500).json({ 
      error: { 
        code: 'PORTAL_FETCH_ERROR', 
        message: 'Failed to retrieve portal configuration' 
      } 
    });
  }
});

// Update complete portal configuration
router.put('/', async (req, res) => {
  try {
    const portal = await investorPortalService.updatePortalConfiguration(req.body);
    res.json(portal);
  } catch (error) {
    console.error('Error updating portal configuration:', error);
    if (error.message.includes('Validation failed')) {
      res.status(400).json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: error.message 
        } 
      });
    } else {
      res.status(500).json({ 
        error: { 
          code: 'PORTAL_UPDATE_ERROR', 
          message: 'Failed to update portal configuration' 
        } 
      });
    }
  }
});

// Update login page assets
router.put('/login-assets', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'background', maxCount: 1 }
]), async (req, res) => {
  try {
    const logoFile = req.files?.logo?.[0];
    const backgroundFile = req.files?.background?.[0];
    const logoAltText = req.body.logoAltText;

    const portal = await investorPortalService.updateLoginPageAssets(
      logoFile,
      backgroundFile,
      logoAltText
    );
    
    res.json(portal);
  } catch (error) {
    console.error('Error updating login page assets:', error);
    if (error.message.includes('validation failed')) {
      res.status(400).json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: error.message 
        } 
      });
    } else {
      res.status(500).json({ 
        error: { 
          code: 'ASSETS_UPDATE_ERROR', 
          message: 'Failed to update login page assets' 
        } 
      });
    }
  }
});

// Update branding
router.put('/branding', upload.single('logo'), async (req, res) => {
  try {
    const logoFile = req.file;
    const branding = {
      primaryColor: req.body.primaryColor,
      secondaryColor: req.body.secondaryColor,
      accentColor: req.body.accentColor,
      fontFamily: req.body.fontFamily
    };

    const portal = await investorPortalService.updateBranding(branding, logoFile);
    res.json(portal);
  } catch (error) {
    console.error('Error updating branding:', error);
    if (error.message.includes('Invalid color values')) {
      res.status(400).json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: error.message 
        } 
      });
    } else {
      res.status(500).json({ 
        error: { 
          code: 'BRANDING_UPDATE_ERROR', 
          message: 'Failed to update branding' 
        } 
      });
    }
  }
});

// Update welcome message
router.put('/welcome-message', async (req, res) => {
  try {
    const portal = await investorPortalService.updateWelcomeMessage(req.body);
    res.json(portal);
  } catch (error) {
    console.error('Error updating welcome message:', error);
    if (error.message.includes('validation failed')) {
      res.status(400).json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: error.message 
        } 
      });
    } else {
      res.status(500).json({ 
        error: { 
          code: 'WELCOME_UPDATE_ERROR', 
          message: 'Failed to update welcome message' 
        } 
      });
    }
  }
});

// Update metrics
router.put('/metrics', async (req, res) => {
  try {
    const portal = await investorPortalService.updateMetrics(req.body);
    res.json(portal);
  } catch (error) {
    console.error('Error updating metrics:', error);
    if (error.message.includes('validation failed')) {
      res.status(400).json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: error.message 
        } 
      });
    } else {
      res.status(500).json({ 
        error: { 
          code: 'METRICS_UPDATE_ERROR', 
          message: 'Failed to update metrics' 
        } 
      });
    }
  }
});

// Add custom metric
router.post('/metrics/custom', async (req, res) => {
  try {
    const portal = await investorPortalService.addCustomMetric(req.body);
    res.json(portal);
  } catch (error) {
    console.error('Error adding custom metric:', error);
    if (error.message.includes('Invalid metric value')) {
      res.status(400).json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: error.message 
        } 
      });
    } else {
      res.status(500).json({ 
        error: { 
          code: 'CUSTOM_METRIC_ERROR', 
          message: 'Failed to add custom metric' 
        } 
      });
    }
  }
});

// Remove custom metric
router.delete('/metrics/custom/:metricId', async (req, res) => {
  try {
    const portal = await investorPortalService.removeCustomMetric(req.params.metricId);
    res.json(portal);
  } catch (error) {
    console.error('Error removing custom metric:', error);
    res.status(500).json({ 
      error: { 
        code: 'CUSTOM_METRIC_REMOVE_ERROR', 
        message: 'Failed to remove custom metric' 
      } 
    });
  }
});

// Get available metrics
router.get('/available-metrics', async (req, res) => {
  try {
    const metrics = await investorPortalService.getAvailableMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error getting available metrics:', error);
    res.status(500).json({ 
      error: { 
        code: 'METRICS_FETCH_ERROR', 
        message: 'Failed to retrieve available metrics' 
      } 
    });
  }
});

// Publish portal
router.post('/publish', async (req, res) => {
  try {
    const portal = await investorPortalService.publishPortal();
    res.json(portal);
  } catch (error) {
    console.error('Error publishing portal:', error);
    if (error.message.includes('must have')) {
      res.status(400).json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: error.message 
        } 
      });
    } else {
      res.status(500).json({ 
        error: { 
          code: 'PUBLISH_ERROR', 
          message: 'Failed to publish portal' 
        } 
      });
    }
  }
});

// Unpublish portal
router.post('/unpublish', async (req, res) => {
  try {
    const portal = await investorPortalService.unpublishPortal();
    res.json(portal);
  } catch (error) {
    console.error('Error unpublishing portal:', error);
    res.status(500).json({ 
      error: { 
        code: 'UNPUBLISH_ERROR', 
        message: 'Failed to unpublish portal' 
      } 
    });
  }
});

// Reset portal configuration
router.post('/reset', async (req, res) => {
  try {
    const portal = await investorPortalService.resetPortalConfiguration();
    res.json(portal);
  } catch (error) {
    console.error('Error resetting portal configuration:', error);
    res.status(500).json({ 
      error: { 
        code: 'RESET_ERROR', 
        message: 'Failed to reset portal configuration' 
      } 
    });
  }
});

// Delete image
router.delete('/images/:imageId', async (req, res) => {
  try {
    await investorPortalService.deleteImage(req.params.imageId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      error: { 
        code: 'IMAGE_DELETE_ERROR', 
        message: 'Failed to delete image' 
      } 
    });
  }
});

module.exports = router;