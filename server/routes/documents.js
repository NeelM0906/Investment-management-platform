const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { DocumentService } = require('../../src/services/DocumentService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store in memory for processing

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Supported file types
    const supportedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/pdf',
      'text/plain',
      'application/rtf',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',
      'text/csv',
      'text/markdown',
      'application/json',
      'text/xml',
      'application/xml'
    ];

    if (supportedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

const documentService = new DocumentService();

// GET /api/documents - Get all documents with optional filtering
router.get('/', async (req, res) => {
  try {
    const { projectId, search, fileType, sortBy, sortOrder } = req.query;
    
    const filters = {};
    if (projectId) filters.projectId = projectId;
    if (search) filters.search = search;
    if (fileType) filters.fileType = fileType;
    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder;

    const documents = await documentService.getAllDocuments(filters);
    
    res.json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch documents',
        details: error.message
      }
    });
  }
});

// GET /api/documents/summaries - Get project document summaries
router.get('/summaries', async (req, res) => {
  try {
    const summaries = await documentService.getProjectDocumentSummaries();
    
    res.json({
      success: true,
      data: summaries
    });
  } catch (error) {
    console.error('Error fetching document summaries:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch document summaries',
        details: error.message
      }
    });
  }
});

// GET /api/documents/:id - Get a specific document
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await documentService.getDocument(id);
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    
    if (error.message === 'Document not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    } else if (error.message === 'Document ID is required') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Document ID is required'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch document',
          details: error.message
        }
      });
    }
  }
});

// GET /api/documents/:id/download - Download a document
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await documentService.getDocument(id);
    const filePath = await documentService.getDocumentFilePath(id);
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Length', document.fileSize);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            code: 'DOWNLOAD_ERROR',
            message: 'Failed to download document'
          }
        });
      }
    });
    
  } catch (error) {
    console.error('Error downloading document:', error);
    
    if (error.message === 'Document not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    } else if (error.message === 'Document file not found on disk') {
      res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Document file not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'DOWNLOAD_ERROR',
          message: 'Failed to download document',
          details: error.message
        }
      });
    }
  }
});

// POST /api/documents - Upload a new document
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { customName, projectId } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No file provided'
        }
      });
    }
    
    const document = await documentService.uploadDocument(file, customName, projectId);
    
    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    
    if (error.message.includes('required') || 
        error.message.includes('Unsupported file type') ||
        error.message.includes('File size exceeds') ||
        error.message.includes('Project not found') ||
        error.message.includes('File is empty')) {
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
          message: 'Failed to upload document',
          details: error.message
        }
      });
    }
  }
});

// PUT /api/documents/:id - Update a document
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customName } = req.body;
    
    const updatedDocument = await documentService.updateDocument(id, { customName });
    
    res.json({
      success: true,
      data: updatedDocument,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Error updating document:', error);
    
    if (error.message === 'Document not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    } else if (error.message.includes('required') || 
               error.message.includes('cannot be empty')) {
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
          message: 'Failed to update document',
          details: error.message
        }
      });
    }
  }
});

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await documentService.deleteDocument(id);
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    
    if (error.message === 'Document not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    } else if (error.message === 'Document ID is required') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Document ID is required'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete document',
          details: error.message
        }
      });
    }
  }
});

// GET /api/documents/project/:projectId - Get documents for a specific project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const documents = await documentService.getDocumentsByProject(projectId);
    
    res.json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Error fetching project documents:', error);
    
    if (error.message === 'Project not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    } else if (error.message === 'Project ID is required') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Project ID is required'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch project documents',
          details: error.message
        }
      });
    }
  }
});

// GET /api/documents/search/:term - Search documents
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const documents = await documentService.searchDocuments(term);
    
    res.json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: 'Failed to search documents',
        details: error.message
      }
    });
  }
});

module.exports = router;