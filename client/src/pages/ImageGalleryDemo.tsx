import React, { useState, useEffect } from 'react';
import ImageGallery, { ImageItem } from '../components/ImageGallery';
import ImageUploadManager from '../components/ImageUploadManager';

const ImageGalleryDemo: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load images on component mount
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/images');
      if (!response.ok) {
        throw new Error('Failed to load images');
      }

      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('maxWidth', '1920');
      formData.append('maxHeight', '1080');
      formData.append('quality', '85');
      formData.append('format', 'jpeg');

      const response = await fetch('http://localhost:3001/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload image');
      }

      const data = await response.json();
      if (data.success) {
        // Reload images to show the new upload
        await loadImages();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleImageDelete = async (imageId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete image');
      }

      const data = await response.json();
      if (data.success) {
        // Remove the deleted image from the list
        setImages(prev => prev.filter(img => img.id !== imageId));
        if (selectedImage?.id === imageId) {
          setSelectedImage(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image: ImageItem) => {
    setSelectedImage(image);
  };

  const handleAdvancedUpload = async (file: File, options?: any) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);
      
      // Add processing options if provided
      if (options) {
        if (options.maxWidth) formData.append('maxWidth', options.maxWidth.toString());
        if (options.maxHeight) formData.append('maxHeight', options.maxHeight.toString());
        if (options.quality) formData.append('quality', options.quality.toString());
        if (options.format) formData.append('format', options.format);
        if (options.crop) formData.append('crop', JSON.stringify(options.crop));
      }

      const response = await fetch('http://localhost:3001/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload image');
      }

      const data = await response.json();
      if (data.success) {
        // Reload images to show the new upload
        await loadImages();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      throw err; // Re-throw so ImageUploadManager can handle it
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedDelete = async (imageId: string) => {
    await handleImageDelete(imageId);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1>Image Upload and Management System Demo</h1>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          This demo showcases the comprehensive image upload and management system with features like:
          image processing, cropping, resizing, format conversion, and gallery management.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>⚠ {error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              opacity: 0.7
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1d4ed8',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Processing...
        </div>
      )}

      {/* Advanced Image Upload Manager */}
      <div style={{ marginBottom: '32px' }}>
        <h2>Advanced Image Upload</h2>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          Upload images with advanced processing options including cropping, resizing, format conversion, and quality adjustment.
        </p>
        <ImageUploadManager
          onImageUpload={handleAdvancedUpload}
          onImageDelete={selectedImage ? handleAdvancedDelete : undefined}
          currentImage={selectedImage ? {
            id: selectedImage.id,
            url: selectedImage.url,
            originalName: selectedImage.originalName,
            size: selectedImage.size,
            dimensions: selectedImage.dimensions
          } : undefined}
          maxFileSize={10 * 1024 * 1024} // 10MB
          allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
          showCropTool={true}
          showResizeOptions={true}
          presetSizes={[
            { name: 'Original', width: 0, height: 0 },
            { name: 'Large (1920x1080)', width: 1920, height: 1080 },
            { name: 'Medium (1280x720)', width: 1280, height: 720 },
            { name: 'Small (640x360)', width: 640, height: 360 },
            { name: 'Thumbnail (300x300)', width: 300, height: 300 },
          ]}
        />
      </div>

      {/* Image Gallery */}
      <div>
        <h2>Image Gallery</h2>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          Browse, search, and manage your uploaded images. Click on an image to select it for the advanced upload manager above.
        </p>
        <ImageGallery
          images={images}
          onImageSelect={handleImageSelect}
          onImageDelete={handleImageDelete}
          onImageUpload={handleImageUpload}
          selectedImageId={selectedImage?.id}
          allowMultipleSelection={false}
          showUpload={true}
        />
      </div>

      {/* Selected Image Info */}
      {selectedImage && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <h3>Selected Image Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <strong>Name:</strong> {selectedImage.originalName}
            </div>
            <div>
              <strong>Size:</strong> {(selectedImage.size / 1024).toFixed(1)} KB
            </div>
            <div>
              <strong>Dimensions:</strong> {selectedImage.dimensions.width}×{selectedImage.dimensions.height}
            </div>
            <div>
              <strong>Type:</strong> {selectedImage.mimeType}
            </div>
            <div>
              <strong>Uploaded:</strong> {new Date(selectedImage.processedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Feature List */}
      <div style={{ marginTop: '48px', padding: '24px', background: '#f9fafb', borderRadius: '8px' }}>
        <h3>System Features</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '16px' }}>
          <div>
            <h4>🔒 Security Features</h4>
            <ul style={{ color: '#6b7280' }}>
              <li>File type validation</li>
              <li>File size limits</li>
              <li>Malicious file detection</li>
              <li>Secure file storage</li>
            </ul>
          </div>
          <div>
            <h4>🎨 Image Processing</h4>
            <ul style={{ color: '#6b7280' }}>
              <li>Automatic resizing</li>
              <li>Quality optimization</li>
              <li>Format conversion (JPEG, PNG, WebP)</li>
              <li>Image cropping</li>
            </ul>
          </div>
          <div>
            <h4>📱 User Experience</h4>
            <ul style={{ color: '#6b7280' }}>
              <li>Drag and drop upload</li>
              <li>Progress indicators</li>
              <li>Real-time preview</li>
              <li>Responsive design</li>
            </ul>
          </div>
          <div>
            <h4>🗂️ Management</h4>
            <ul style={{ color: '#6b7280' }}>
              <li>Image gallery with search</li>
              <li>Sorting and filtering</li>
              <li>Bulk operations</li>
              <li>Metadata display</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryDemo;