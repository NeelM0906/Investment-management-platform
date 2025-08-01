const express = require('express');
const router = express.Router();

// Import the source modules directly
const { ProjectService } = require('../../src/services/ProjectService');
const { DebtEquityClassService } = require('../../src/services/DebtEquityClassService');

const projectService = new ProjectService();
const debtEquityClassService = new DebtEquityClassService();

// GET /api/projects - Get all projects with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      searchTerm: search
    };

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const result = await projectService.getAllProjects(filters, pagination);
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch projects',
        details: error.message
      }
    });
  }
});

// GET /api/projects/:id - Get a specific project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProject(id);
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    
    if (error.message === 'Project not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch project',
          details: error.message
        }
      });
    }
  }
});

// POST /api/projects - Create a new project
router.post('/', async (req, res) => {
  try {
    const projectData = req.body;
    
    // Validate required fields
    const requiredFields = ['projectName', 'legalProjectName', 'targetAmount', 'startDate', 'endDate'];
    const missingFields = requiredFields.filter(field => !projectData[field]);
    
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

    const project = await projectService.createProject(projectData);
    
    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    
    if (error.message.includes('Validation failed') || error.message.includes('already exists')) {
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
          message: 'Failed to create project',
          details: error.message
        }
      });
    }
  }
});

// PUT /api/projects/:id - Update a project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const project = await projectService.updateProject(id, updateData);
    
    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    
    if (error.message === 'Project not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    } else if (error.message.includes('Validation failed') || error.message.includes('already exists')) {
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
          message: 'Failed to update project',
          details: error.message
        }
      });
    }
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await projectService.deleteProject(id);
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    
    if (error.message === 'Project not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete project',
          details: error.message
        }
      });
    }
  }
});

// PUT /api/projects/:id/commitments - Update project commitments
router.put('/:id/commitments', async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount, investorCount } = req.body;
    
    // Validate required fields
    if (typeof totalAmount !== 'number' || typeof investorCount !== 'number') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'totalAmount and investorCount must be numbers'
        }
      });
    }

    const project = await projectService.updateCommitments(id, {
      totalAmount,
      investorCount
    });
    
    res.json({
      success: true,
      data: project,
      message: 'Commitments updated successfully'
    });
  } catch (error) {
    console.error('Error updating commitments:', error);
    
    if (error.message === 'Project not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
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
          message: 'Failed to update commitments',
          details: error.message
        }
      });
    }
  }
});

// PUT /api/projects/:id/reservations - Update project reservations
router.put('/:id/reservations', async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount, investorCount } = req.body;
    
    // Validate required fields
    if (typeof totalAmount !== 'number' || typeof investorCount !== 'number') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'totalAmount and investorCount must be numbers'
        }
      });
    }

    const project = await projectService.updateReservations(id, {
      totalAmount,
      investorCount
    });
    
    res.json({
      success: true,
      data: project,
      message: 'Reservations updated successfully'
    });
  } catch (error) {
    console.error('Error updating reservations:', error);
    
    if (error.message === 'Project not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
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
          message: 'Failed to update reservations',
          details: error.message
        }
      });
    }
  }
});

// GET /api/projects/:id/kpis - Get project KPIs
router.get('/:id/kpis', async (req, res) => {
  try {
    const { id } = req.params;
    const kpis = await projectService.getProjectKPIs(id);
    
    res.json({
      success: true,
      data: kpis
    });
  } catch (error) {
    console.error('Error fetching project KPIs:', error);
    
    if (error.message === 'Project not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch project KPIs',
          details: error.message
        }
      });
    }
  }
});

// GET /api/projects/:id/debt-equity-classes - Get all debt and equity classes for a project
router.get('/:id/debt-equity-classes', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First verify the project exists
    await projectService.getProject(id);
    
    const classes = await debtEquityClassService.getClassesByProject(id);
    
    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error fetching debt equity classes:', error);
    
    if (error.message === 'Project not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch debt equity classes',
          details: error.message
        }
      });
    }
  }
});

// POST /api/projects/:id/debt-equity-classes - Create a new debt or equity class for a project
router.post('/:id/debt-equity-classes', async (req, res) => {
  try {
    const { id } = req.params;
    const classData = req.body;
    
    // First verify the project exists
    await projectService.getProject(id);
    
    // Validate required fields
    const requiredFields = ['unitClass', 'unitPrice', 'investmentIncrementAmount', 'minInvestmentAmount', 'maxInvestmentAmount'];
    const missingFields = requiredFields.filter(field => classData[field] === undefined || classData[field] === null);
    
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

    const debtEquityClass = await debtEquityClassService.createClass(id, classData);
    
    res.status(201).json({
      success: true,
      data: debtEquityClass,
      message: 'Debt equity class created successfully'
    });
  } catch (error) {
    console.error('Error creating debt equity class:', error);
    
    if (error.message === 'Project not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
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
          message: 'Failed to create debt equity class',
          details: error.message
        }
      });
    }
  }
});

module.exports = router;