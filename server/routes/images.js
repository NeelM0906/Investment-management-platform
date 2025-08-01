const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Import the compiled TypeScript modules
const { ImageProcessingService } = require('../../src/utils/imageProcessing');

const imageProcessingService = new ImageProcessingService();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'));
    }
  }
});

// POST /api/images/upload - Upload and process image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Image file is required'
        }
      });
    }

    // Parse processing options from request body
    const options = {};
    
    if (req.body.maxWidth) {
      options.maxWidth = parseInt(req.body.maxWidth);
    }
    
    if (req.body.maxHeight) {
      options.maxHeight = parseInt(req.body.maxHeight);
    }
    
    if (req.body.quality) {
      options.quality = parseInt(req.body.quality);
    }
    
    if (req.body.format) {
      options.format = req.body.format;
    }
    
    // Parse crop area if provided
    if (req.body.crop) {
      try {
        const crop = JSON.parse(req.body.crop);
        if (crop.x !== undefined && crop.y !== undefined && 
            crop.width !== undefined && crop.height !== undefined) {
          options.crop = crop;
        }
      } catch (error) {
        console.warn('Invalid crop data provided:', req.body.crop);
      }
    }

    // Validate the image
    const validation = imageProcessingService.validateImage(req.file);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.errors.join(', ')
        }
      });
    }

    // Process and save the image
    const processedImage = await imageProcessingService.processAndSaveImage(
      req.file,
      req.file.originalname,
      options
    );

    res.json({
      success: true,
      data: processedImage,
      message: 'Image uploaded and processed successfully',
      warnings: validation.warnings
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    
    if (error.message.includes('Invalid image') || 
        error.message.includes('validation failed') ||
        error.message.includes('File size too large')) {
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
          message: 'Failed to upload and process image',
          details: error.message
        }
      });
    }
  }
});

// POST /api/images/upload-variants - Upload image with multiple variants
router.post('/upload-variants', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Image file is required'
        }
      });
    }

    // Parse variants from request body
    let variants;
    try {
      variants = JSON.parse(req.body.variants || '[]');
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid variants data'
        }
      });
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least one variant must be specified'
        }
      });
    }

    // Validate the image
    const validation = imageProcessingService.validateImage(req.file);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.errors.join(', ')
        }
      });
    }

    // Create image variants
    const processedVariants = await imageProcessingService.createImageVariants(
      req.file,
      req.file.originalname,
      variants
    );

    res.json({
      success: true,
      data: processedVariants,
      message: 'Image variants created successfully',
      warnings: validation.warnings
    });
  } catch (error) {
    console.error('Error creating image variants:', error);
    
    if (error.message.includes('Invalid image') || 
        error.message.includes('validation failed') ||
        error.message.includes('variant')) {
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
          message: 'Failed to create image variants',
          details: error.message
        }
      });
    }
  }
});

// GET /api/images - List all images
router.get('/', async (req, res) => {
  try {
    const images = await imageProcessingService.listImages();
    
    res.json({
      success: true,
      data: images,
      count: images.length
    });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_ERROR',
        message: 'Failed to list images',
        details: error.message
      }
    });
  }
});

// GET /api/images/:id - Get image by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Image ID is required'
        }
      });
    }

    const imagePath = await imageProcessingService.getImagePath(id);
    
    if (!imagePath) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Image not found'
        }
      });
    }

    // Check if file exists
    try {
      await fs.access(imagePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Image file not found'
        }
      });
    }

    // Serve the file
    res.sendFile(path.resolve(imagePath));
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVE_ERROR',
        message: 'Failed to serve image',
        details: error.message
      }
    });
  }
});

// DELETE /api/images/:id - Delete image
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Image ID is required'
        }
      });
    }

    // Check if image exists
    const imagePath = await imageProcessingService.getImagePath(id);
    if (!imagePath) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Image not found'
        }
      });
    }

    // Delete the image
    await imageProcessingService.deleteImage(id);
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete image',
        details: error.message
      }
    });
  }
});

// PUT /api/images/:id/optimize - Optimize existing image
router.put('/:id/optimize', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Image ID is required'
        }
      });
    }

    // Parse optimization options
    const options = {};
    
    if (req.body.maxWidth) {
      options.maxWidth = parseInt(req.body.maxWidth);
    }
    
    if (req.body.maxHeight) {
      options.maxHeight = parseInt(req.body.maxHeight);
    }
    
    if (req.body.quality) {
      options.quality = parseInt(req.body.quality);
    }
    
    if (req.body.format) {
      options.format = req.body.format;
    }

    // Optimize the image
    const optimizedImage = await imageProcessingService.optimizeExistingImage(id, options);
    
    res.json({
      success: true,
      data: optimizedImage,
      message: 'Image optimized successfully'
    });
  } catch (error) {
    console.error('Error optimizing image:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Image not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'OPTIMIZE_ERROR',
          message: 'Failed to optimize image',
          details: error.message
        }
      });
    }
  }
});

// GET /api/images/:id/metadata - Get image metadata
router.get('/:id/metadata', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Image ID is required'
        }
      });
    }

    const imagePath = await imageProcessingService.getImagePath(id);
    
    if (!imagePath) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Image not found'
        }
      });
    }

    // Read image file and get metadata
    const buffer = await fs.readFile(imagePath);
    const metadata = await imageProcessingService.getImageMetadata(buffer);
    
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Error getting image metadata:', error);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Image not found'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'METADATA_ERROR',
          message: 'Failed to get image metadata',
          details: error.message
        }
      });
    }
  }
});

module.exports = router;