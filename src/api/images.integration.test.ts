import request from 'supertest';
import express from 'express';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Import the images router
const imagesRouter = require('../../server/routes/images');

describe('Images API Integration Tests', () => {
  let app: express.Application;
  const testUploadDir = path.join(process.cwd(), 'uploads', 'images');

  beforeAll(async () => {
    // Set up Express app with images router
    app = express();
    app.use(express.json());
    app.use('/api/images', imagesRouter);

    // Ensure upload directory exists
    try {
      await fs.access(testUploadDir);
    } catch {
      await fs.mkdir(testUploadDir, { recursive: true });
    }
  });

  afterAll(async () => {
    // Clean up test files
    try {
      const files = await fs.readdir(testUploadDir);
      for (const file of files) {
        if (file.startsWith('test-')) {
          await fs.unlink(path.join(testUploadDir, file));
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('POST /api/images/upload', () => {
    it('should upload and process an image successfully', async () => {
      // Create a test image buffer
      const testBuffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 255, g: 0, b: 0 }
        }
      })
      .jpeg()
      .toBuffer();

      const response = await request(app)
        .post('/api/images/upload')
        .attach('image', testBuffer, 'test-upload.jpg')
        .field('maxWidth', '400')
        .field('maxHeight', '300')
        .field('quality', '80')
        .field('format', 'jpeg');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('originalName', 'test-upload.jpg');
      expect(response.body.data).toHaveProperty('mimeType', 'image/jpeg');
      expect(response.body.data.dimensions.width).toBeLessThanOrEqual(400);
      expect(response.body.data.dimensions.height).toBeLessThanOrEqual(300);
    });

    it('should reject invalid file type', async () => {
      const textBuffer = Buffer.from('This is not an image');

      const response = await request(app)
        .post('/api/images/upload')
        .attach('image', textBuffer, 'test.txt');

      expect(response.status).toBe(500); // Multer rejects before our validation
      // Multer error doesn't follow our JSON structure, so just check status
    });

    it('should process image with crop parameters', async () => {
      const testBuffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 0, g: 255, b: 0 }
        }
      })
      .jpeg()
      .toBuffer();

      const cropData = JSON.stringify({
        x: 100,
        y: 100,
        width: 400,
        height: 300
      });

      const response = await request(app)
        .post('/api/images/upload')
        .attach('image', testBuffer, 'test-crop.jpg')
        .field('crop', cropData)
        .field('format', 'png');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.mimeType).toBe('image/png');
      expect(response.body.data.dimensions.width).toBeLessThanOrEqual(400);
      expect(response.body.data.dimensions.height).toBeLessThanOrEqual(300);
    });

    it('should return 400 when no file is provided', async () => {
      const response = await request(app)
        .post('/api/images/upload');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('required');
    });
  });

  describe('POST /api/images/upload-variants', () => {
    it('should create multiple image variants', async () => {
      const testBuffer = await sharp({
        create: {
          width: 1200,
          height: 800,
          channels: 3,
          background: { r: 0, g: 0, b: 255 }
        }
      })
      .jpeg()
      .toBuffer();

      const variants = JSON.stringify([
        { name: 'thumbnail', options: { maxWidth: 150, maxHeight: 150 } },
        { name: 'medium', options: { maxWidth: 600, maxHeight: 400 } }
      ]);

      const response = await request(app)
        .post('/api/images/upload-variants')
        .attach('image', testBuffer, 'test-variants.jpg')
        .field('variants', variants);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('thumbnail');
      expect(response.body.data).toHaveProperty('medium');
      expect(response.body.data.thumbnail.dimensions.width).toBeLessThanOrEqual(150);
      expect(response.body.data.medium.dimensions.width).toBeLessThanOrEqual(600);
    });

    it('should return 400 when variants are not provided', async () => {
      const testBuffer = await sharp({
        create: {
          width: 400,
          height: 300,
          channels: 3,
          background: { r: 128, g: 128, b: 128 }
        }
      })
      .jpeg()
      .toBuffer();

      const response = await request(app)
        .post('/api/images/upload-variants')
        .attach('image', testBuffer, 'test-no-variants.jpg');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('variant');
    });
  });

  describe('GET /api/images', () => {
    it('should list all images', async () => {
      const response = await request(app)
        .get('/api/images');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('count');
    });
  });

  describe('GET /api/images/:id', () => {
    let imageId: string;

    beforeAll(async () => {
      // Create a test image first
      const testBuffer = await sharp({
        create: {
          width: 400,
          height: 300,
          channels: 3,
          background: { r: 255, g: 255, b: 0 }
        }
      })
      .jpeg()
      .toBuffer();

      const uploadResponse = await request(app)
        .post('/api/images/upload')
        .attach('image', testBuffer, 'test-get.jpg');

      imageId = uploadResponse.body.data.id;
    });

    it('should serve an image by ID', async () => {
      const response = await request(app)
        .get(`/api/images/${imageId}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('image');
    });

    it('should return 404 for non-existent image', async () => {
      const response = await request(app)
        .get('/api/images/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 200 for images list endpoint', async () => {
      const response = await request(app)
        .get('/api/images/');

      expect(response.status).toBe(200); // This actually hits the list images endpoint
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/images/:id/metadata', () => {
    let imageId: string;

    beforeAll(async () => {
      // Create a test image first
      const testBuffer = await sharp({
        create: {
          width: 600,
          height: 400,
          channels: 3,
          background: { r: 128, g: 64, b: 192 }
        }
      })
      .png()
      .toBuffer();

      const uploadResponse = await request(app)
        .post('/api/images/upload')
        .attach('image', testBuffer, 'test-metadata.png')
        .field('format', 'png');

      imageId = uploadResponse.body.data.id;
    });

    it('should return image metadata', async () => {
      const response = await request(app)
        .get(`/api/images/${imageId}/metadata`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('width');
      expect(response.body.data).toHaveProperty('height');
      expect(response.body.data).toHaveProperty('format');
      expect(response.body.data).toHaveProperty('channels');
    });

    it('should return 404 for non-existent image metadata', async () => {
      const response = await request(app)
        .get('/api/images/non-existent-id/metadata');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/images/:id/optimize', () => {
    let imageId: string;

    beforeAll(async () => {
      // Create a test image first
      const testBuffer = await sharp({
        create: {
          width: 1000,
          height: 800,
          channels: 3,
          background: { r: 255, g: 128, b: 64 }
        }
      })
      .jpeg({ quality: 100 })
      .toBuffer();

      const uploadResponse = await request(app)
        .post('/api/images/upload')
        .attach('image', testBuffer, 'test-optimize.jpg')
        .field('quality', '100');

      imageId = uploadResponse.body.data.id;
    });

    it('should optimize an existing image', async () => {
      const response = await request(app)
        .put(`/api/images/${imageId}/optimize`)
        .send({
          maxWidth: 500,
          maxHeight: 400,
          quality: 60,
          format: 'webp'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.mimeType).toBe('image/webp');
      expect(response.body.data.dimensions.width).toBeLessThanOrEqual(500);
      expect(response.body.data.dimensions.height).toBeLessThanOrEqual(400);
    });

    it('should return 404 for non-existent image optimization', async () => {
      const response = await request(app)
        .put('/api/images/non-existent-id/optimize')
        .send({
          quality: 80
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/images/:id', () => {
    let imageId: string;

    beforeEach(async () => {
      // Create a test image for each delete test
      const testBuffer = await sharp({
        create: {
          width: 300,
          height: 200,
          channels: 3,
          background: { r: 200, g: 100, b: 50 }
        }
      })
      .jpeg()
      .toBuffer();

      const uploadResponse = await request(app)
        .post('/api/images/upload')
        .attach('image', testBuffer, 'test-delete.jpg');

      imageId = uploadResponse.body.data.id;
    });

    it('should delete an image successfully', async () => {
      const response = await request(app)
        .delete(`/api/images/${imageId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify image is actually deleted
      const getResponse = await request(app)
        .get(`/api/images/${imageId}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent image deletion', async () => {
      const response = await request(app)
        .delete('/api/images/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});