const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Import the compiled TypeScript modules
const { DealRoomService } = require('../../src/services/DealRoomService');

const dealRoomService = new DealRoomService();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

// GET /api/projects/:id/deal-room - Get deal room data for a project
router.get('/projects/:id/deal-room', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    const dealRoom = await dealRoomService.getOrCreateDealRoom(projectId);
    
    res.json({
      success: true,
      data: dealRoom
    });
  } catch (error) {
    console.error('Error fetching deal room:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch deal room data',
        details: error.message
      }
    });
  }
});

// GET /api/projects/:id/deal-room/completion-status - Get deal room completion status
router.get('/projects/:id/deal-room/completion-status', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    const completionStatus = await dealRoomService.getDealRoomCompletionStatus(projectId);
    
    res.json({
      success: true,
      data: completionStatus
    });
  } catch (error) {
    console.error('Error fetching deal room completion status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch deal room completion status',
        details: error.message
      }
    });
  }
});

// PUT /api/projects/:id/deal-room - Update deal room data
router.put('/projects/:id/deal-room', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const updateData = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    const dealRoom = await dealRoomService.updateDealRoom(projectId, updateData);
    
    res.json({
      success: true,
      data: dealRoom,
      message: 'Deal room updated successfully'
    });
  } catch (error) {
    console.error('Error updating deal room:', error);
    
    if (error.message.includes('Validation failed')) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      });
    } else if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Deal room not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update deal room',
          details: error.message
        }
      });
    }
  }
});

// POST /api/projects/:id/deal-room/showcase-photo - Upload showcase photo
router.post('/projects/:id/deal-room/showcase-photo', upload.single('photo'), async (req, res) => {
  try {
    const { id: projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Photo file is required'
        }
      });
    }

    const dealRoom = await dealRoomService.uploadShowcasePhoto(
      projectId,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    
    res.json({
      success: true,
      data: dealRoom,
      message: 'Showcase photo uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading showcase photo:', error);
    
    if (error.message.includes('Invalid image format') || 
        error.message.includes('File size too large') ||
        error.message.includes('required')) {
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
          code: 'UPLOAD_ERROR',
          message: 'Failed to upload showcase photo',
          details: error.message
        }
      });
    }
  }
});

// DELETE /api/projects/:id/deal-room/showcase-photo - Remove showcase photo
router.delete('/projects/:id/deal-room/showcase-photo', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    const dealRoom = await dealRoomService.removeShowcasePhoto(projectId);
    
    res.json({
      success: true,
      data: dealRoom,
      message: 'Showcase photo removed successfully'
    });
  } catch (error) {
    console.error('Error removing showcase photo:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Deal room not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to remove showcase photo',
          details: error.message
        }
      });
    }
  }
});

// GET /api/projects/:id/deal-room/showcase-photo - Serve showcase photo
router.get('/projects/:id/deal-room/showcase-photo', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    const photoPath = await dealRoomService.getShowcasePhotoPath(projectId);
    
    if (!photoPath) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Showcase photo not found'
        }
      });
    }

    // Check if file exists
    try {
      await fs.access(photoPath);
    } catch {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Showcase photo file not found'
        }
      });
    }

    // Serve the file
    res.sendFile(path.resolve(photoPath));
  } catch (error) {
    console.error('Error serving showcase photo:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVE_ERROR',
        message: 'Failed to serve showcase photo',
        details: error.message
      }
    });
  }
});

// PUT /api/projects/:id/deal-room/investment-blurb - Update investment blurb
router.put('/projects/:id/deal-room/investment-blurb', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { investmentBlurb } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    const dealRoom = await dealRoomService.updateInvestmentBlurb(projectId, investmentBlurb);
    
    res.json({
      success: true,
      data: dealRoom,
      message: 'Investment blurb updated successfully'
    });
  } catch (error) {
    console.error('Error updating investment blurb:', error);
    
    if (error.message.includes('must be less than') || error.message.includes('required')) {
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
          message: 'Failed to update investment blurb',
          details: error.message
        }
      });
    }
  }
});

// PUT /api/projects/:id/deal-room/investment-summary - Update investment summary
router.put('/projects/:id/deal-room/investment-summary', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { investmentSummary } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    const dealRoom = await dealRoomService.updateInvestmentSummary(projectId, investmentSummary);
    
    res.json({
      success: true,
      data: dealRoom,
      message: 'Investment summary updated successfully'
    });
  } catch (error) {
    console.error('Error updating investment summary:', error);
    
    if (error.message.includes('must be less than') || error.message.includes('required')) {
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
          message: 'Failed to update investment summary',
          details: error.message
        }
      });
    }
  }
});

// PUT /api/projects/:id/deal-room/key-info - Update key info
router.put('/projects/:id/deal-room/key-info', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { keyInfo } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    const dealRoom = await dealRoomService.updateKeyInfo(projectId, keyInfo);
    
    res.json({
      success: true,
      data: dealRoom,
      message: 'Key info updated successfully'
    });
  } catch (error) {
    console.error('Error updating key info:', error);
    
    if (error.message.includes('must be') || 
        error.message.includes('required') || 
        error.message.includes('valid URL')) {
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
          message: 'Failed to update key info',
          details: error.message
        }
      });
    }
  }
});

// PUT /api/projects/:id/deal-room/external-links - Update external links
router.put('/projects/:id/deal-room/external-links', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { externalLinks } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    const dealRoom = await dealRoomService.updateExternalLinks(projectId, externalLinks);
    
    res.json({
      success: true,
      data: dealRoom,
      message: 'External links updated successfully'
    });
  } catch (error) {
    console.error('Error updating external links:', error);
    
    if (error.message.includes('must be') || 
        error.message.includes('required') || 
        error.message.includes('valid URL')) {
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
          message: 'Failed to update external links',
          details: error.message
        }
      });
    }
  }
});

// Draft Management Endpoints

// GET /api/projects/:id/deal-room/draft - Get draft for project and session
router.get('/projects/:id/deal-room/draft', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { sessionId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID is required'
        }
      });
    }

    const draft = await dealRoomService.getDraftByProjectAndSession(projectId, sessionId);
    
    res.json({
      success: true,
      data: draft
    });
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch draft',
        details: error.message
      }
    });
  }
});

// POST /api/projects/:id/deal-room/draft - Create or update draft
router.post('/projects/:id/deal-room/draft', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { sessionId, draftData, isAutoSave = true, userId } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID is required'
        }
      });
    }

    const draft = await dealRoomService.createOrUpdateDraft(projectId, sessionId, draftData, isAutoSave, userId);
    
    res.json({
      success: true,
      data: draft,
      message: isAutoSave ? 'Draft auto-saved successfully' : 'Draft saved successfully'
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    
    if (error.message.includes('validation failed')) {
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
          code: 'SAVE_ERROR',
          message: 'Failed to save draft',
          details: error.message
        }
      });
    }
  }
});

// POST /api/projects/:id/deal-room/draft/publish - Publish draft to main deal room
router.post('/projects/:id/deal-room/draft/publish', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { sessionId, changeDescription } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID is required'
        }
      });
    }

    const result = await dealRoomService.publishDraft(projectId, sessionId, changeDescription);
    
    res.json({
      success: true,
      data: result,
      message: 'Draft published successfully'
    });
  } catch (error) {
    console.error('Error publishing draft:', error);
    
    if (error.message.includes('Conflict detected')) {
      const conflictId = error.message.split(': ')[1];
      res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT_ERROR',
          message: 'Conflict detected during publish',
          conflictId: conflictId
        }
      });
    } else if (error.message.includes('No draft found')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No draft found to publish'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'PUBLISH_ERROR',
          message: 'Failed to publish draft',
          details: error.message
        }
      });
    }
  }
});

// GET /api/projects/:id/deal-room/save-status - Get save status for session
router.get('/projects/:id/deal-room/save-status', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { sessionId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID is required'
        }
      });
    }

    const saveStatus = await dealRoomService.getSaveStatus(projectId, sessionId);
    
    res.json({
      success: true,
      data: saveStatus
    });
  } catch (error) {
    console.error('Error fetching save status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch save status',
        details: error.message
      }
    });
  }
});

// GET /api/projects/:id/deal-room/versions - Get version history
router.get('/projects/:id/deal-room/versions', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { limit = 10 } = req.query;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    const versions = await dealRoomService.getVersionHistory(projectId, parseInt(limit));
    
    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    console.error('Error fetching version history:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch version history',
        details: error.message
      }
    });
  }
});

// POST /api/projects/:id/deal-room/restore-version - Restore a specific version
router.post('/projects/:id/deal-room/restore-version', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { versionId, sessionId } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    if (!versionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Version ID is required'
        }
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID is required'
        }
      });
    }

    const dealRoom = await dealRoomService.restoreVersion(projectId, versionId, sessionId);
    
    res.json({
      success: true,
      data: dealRoom,
      message: 'Version restored successfully'
    });
  } catch (error) {
    console.error('Error restoring version:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Version not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'RESTORE_ERROR',
          message: 'Failed to restore version',
          details: error.message
        }
      });
    }
  }
});

// GET /api/projects/:id/deal-room/conflicts - Get unresolved conflicts
router.get('/projects/:id/deal-room/conflicts', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    const conflicts = await dealRoomService.getUnresolvedConflicts(projectId);
    
    res.json({
      success: true,
      data: conflicts
    });
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch conflicts',
        details: error.message
      }
    });
  }
});

// POST /api/projects/:id/deal-room/resolve-conflict - Resolve a conflict
router.post('/projects/:id/deal-room/resolve-conflict', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { conflictId, resolution, customData } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    if (!conflictId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Conflict ID is required'
        }
      });
    }

    if (!resolution || !['use_local', 'use_server', 'merge', 'manual'].includes(resolution)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid resolution strategy is required'
        }
      });
    }

    const result = await dealRoomService.resolveConflict(conflictId, resolution, customData);
    
    res.json({
      success: true,
      data: result,
      message: 'Conflict resolved successfully'
    });
  } catch (error) {
    console.error('Error resolving conflict:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Conflict not found'
        }
      });
    } else if (error.message.includes('already resolved')) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Conflict already resolved'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'RESOLVE_ERROR',
          message: 'Failed to resolve conflict',
          details: error.message
        }
      });
    }
  }
});

// GET /api/projects/:id/deal-room/recover-changes - Recover unsaved changes
router.get('/projects/:id/deal-room/recover-changes', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { sessionId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID is required'
        }
      });
    }

    const recoveredDraft = await dealRoomService.recoverUnsavedChanges(projectId, sessionId);
    
    res.json({
      success: true,
      data: recoveredDraft,
      message: recoveredDraft ? 'Unsaved changes recovered' : 'No unsaved changes found'
    });
  } catch (error) {
    console.error('Error recovering changes:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RECOVER_ERROR',
        message: 'Failed to recover unsaved changes',
        details: error.message
      }
    });
  }
});

// GET /api/projects/:id/investor-dashboard - Get complete investor dashboard data
router.get('/projects/:id/investor-dashboard', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    }

    // Import services
    const { ProjectService } = require('../../src/services/ProjectService');
    const { DealRoomService } = require('../../src/services/DealRoomService');
    const { CompanyProfileService } = require('../../src/services/CompanyProfileService');
    const { InvestorPortalService } = require('../../src/services/InvestorPortalService');
    const { DebtEquityClassService } = require('../../src/services/DebtEquityClassService');

    const projectService = new ProjectService();
    const dealRoomService = new DealRoomService();
    const companyProfileService = new CompanyProfileService();
    const investorPortalService = new InvestorPortalService();
    const debtEquityClassService = new DebtEquityClassService();

    // Fetch all required data for investor dashboard
    const [project, dealRoom, companyProfile, investorPortal, debtEquityClasses] = await Promise.allSettled([
      projectService.getProject(projectId),
      dealRoomService.getOrCreateDealRoom(projectId),
      companyProfileService.getDefaultProfile().catch(() => null),
      investorPortalService.getPortalConfiguration().catch(() => null),
      debtEquityClassService.getClassesByProject(projectId).catch(() => [])
    ]);

    // Extract successful results
    const dashboardData = {
      project: project.status === 'fulfilled' ? project.value : null,
      dealRoom: dealRoom.status === 'fulfilled' ? dealRoom.value : null,
      companyProfile: companyProfile.status === 'fulfilled' ? companyProfile.value : null,
      investorPortal: investorPortal.status === 'fulfilled' ? investorPortal.value : null,
      debtEquityClasses: debtEquityClasses.status === 'fulfilled' ? debtEquityClasses.value : []
    };

    // Calculate KPIs if project data is available
    let kpis = null;
    if (dashboardData.project) {
      const proj = dashboardData.project;
      const fundingPercentage = proj.targetAmount > 0 
        ? Math.round((proj.commitments.totalAmount / proj.targetAmount) * 100) 
        : 0;
      
      const endDate = new Date(proj.timeframe.endDate);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      kpis = {
        totalCommitments: proj.commitments.investorCount,
        totalCommittedAmount: proj.commitments.totalAmount,
        fundingPercentage,
        daysRemaining,
        currency: proj.currency || 'USD'
      };
    }

    res.json({
      success: true,
      data: {
        ...dashboardData,
        kpis
      }
    });
  } catch (error) {
    console.error('Error fetching investor dashboard data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch investor dashboard data',
        details: error.message
      }
    });
  }
});

module.exports = router;