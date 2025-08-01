import React, { useState, useRef, useCallback } from 'react';
import './ImageUploadManager.css';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  crop?: CropArea;
}

interface ImageUploadManagerProps {
  onImageUpload: (file: File, options?: ImageUploadOptions) => Promise<void>;
  onImageDelete?: (imageId: string) => Promise<void>;
  currentImage?: {
    id: string;
    url: string;
    originalName: string;
    size: number;
    dimensions: { width: number; height: number };
  };
  maxFileSize?: number;
  allowedTypes?: string[];
  showCropTool?: boolean;
  showResizeOptions?: boolean;
  presetSizes?: { name: string; width: number; height: number }[];
}

const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({
  onImageUpload,
  onImageDelete,
  currentImage,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  showCropTool = true,
  showResizeOptions = true,
  presetSizes = [
    { name: 'Original', width: 0, height: 0 },
    { name: 'Large (1920x1080)', width: 1920, height: 1080 },
    { name: 'Medium (1280x720)', width: 1280, height: 720 },
    { name: 'Small (640x360)', width: 640, height: 360 },
  ]
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [, setShowAdvanced] = useState(false);
  
  // Upload options
  const [uploadOptions] = useState<ImageUploadOptions>({
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    format: 'jpeg'
  });
  
  // Crop tool state
  const [, setCropToolEnabled] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }
    
    if (file.size > maxFileSize) {
      return `File size too large. Maximum size: ${formatFileSize(maxFileSize)}`;
    }
    
    if (file.size < 100) {
      return 'File is too small or corrupted';
    }
    
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      setCropArea({ x: 0, y: 0, width: img.width, height: img.height });
    };
    img.src = url;
  }, [validateFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const options: ImageUploadOptions = { ...uploadOptions };
      
      // Add crop area if crop tool is enabled and has been modified
      if (showCropTool && originalDimensions && 
          (cropArea.x > 0 || cropArea.y > 0 || 
           cropArea.width < originalDimensions.width || 
           cropArea.height < originalDimensions.height)) {
        options.crop = cropArea;
      }

      await onImageUpload(selectedFile, options);
      
      setSuccess('Image uploaded successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      setCropToolEnabled(false);
      setShowAdvanced(false);
      
      // Auto-hide success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCropToolEnabled(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-manager">
      {/* Success/Error Messages */}
      {success && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="dismiss-button">×</button>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="dismiss-button">×</button>
        </div>
      )}

      {/* File Selection Area */}
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="file-selected">
            <div className="preview-container">
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="preview-image" />
              )}
            </div>
            <div className="file-info">
              <h4>{selectedFile.name}</h4>
              <div className="file-details">
                <span>{formatFileSize(selectedFile.size)}</span>
                {originalDimensions && (
                  <span>{originalDimensions.width}×{originalDimensions.height}</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📷</div>
            <h3>Upload Image</h3>
            <p>Drag and drop your image here, or click to browse</p>
            <button onClick={handleBrowseClick} className="browse-button">
              Choose File
            </button>
            <div className="upload-requirements">
              <p>Requirements:</p>
              <ul>
                <li>JPEG, PNG, or WebP format</li>
                <li>Maximum file size: {formatFileSize(maxFileSize)}</li>
                <li>Recommended: High resolution for best quality</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Upload Options */}
      {selectedFile && (
        <div className="upload-options">
          <div className="options-header">
            <h4>Upload Options</h4>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={clearSelection} className="cancel-button" disabled={uploading}>
              Cancel
            </button>
            <button onClick={handleUpload} className="upload-button" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Hidden Canvas for Image Processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageUploadManager;