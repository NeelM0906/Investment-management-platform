const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { DocumentService } = require('../../dist/src/services/DocumentService');

const documentService = new DocumentService();

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET /api/documents
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    const documents = await documentService.getDocuments(projectId);
    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/documents/upload
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No document file provided' });
    }

    const documentData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      customName: req.body.customName || req.file.originalname,
      projectId: req.body.projectId,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadPath: `/uploads/documents/${req.file.filename}`
    };

    const document = await documentService.uploadDocument(documentData);
    res.status(201).json({ success: true, data: document });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/documents/:id
router.put('/:id', async (req, res) => {
  try {
    const document = await documentService.updateDocument(req.params.id, req.body);
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
  try {
    const success = await documentService.deleteDocument(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;