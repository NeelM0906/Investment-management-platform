import React, { useState, useEffect, useRef } from 'react';
import './ImageGallery.css';

export interface ImageItem {
  id: string;
  originalName: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  processedAt: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  onImageSelect?: (image: ImageItem) => void;
  onImageDelete?: (imageId: string) => void;
  onImageUpload?: (files: FileList) => void;
  selectedImageId?: string;
  allowMultipleSelection?: boolean;
  showUpload?: boolean;
  maxImages?: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImageSelect,
  onImageDelete,
  onImageUpload,
  selectedImageId,
  allowMultipleSelection = false,
  showUpload = true,
  maxImages
}) => {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [filterType, setFilterType] = useState<'all' | 'jpeg' | 'png' | 'webp'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedImageId) {
      setSelectedImages(new Set([selectedImageId]));
    }
  }, [selectedImageId]);

  const handleImageClick = (image: ImageItem) => {
    if (allowMultipleSelection) {
      const newSelected = new Set(selectedImages);
      if (newSelected.has(image.id)) {
        newSelected.delete(image.id);
      } else {
        newSelected.add(image.id);
      }
      setSelectedImages(newSelected);
    } else {
      setSelectedImages(new Set([image.id]));
      onImageSelect?.(image);
    }
  };

  const handleImageDelete = (imageId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this image?')) {
      onImageDelete?.(imageId);
      const newSelected = new Set(selectedImages);
      newSelected.delete(imageId);
      setSelectedImages(newSelected);
    }
  };

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
    
    if (onImageUpload && e.dataTransfer.files.length > 0) {
      onImageUpload(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onImageUpload && e.target.files) {
      onImageUpload(e.target.files);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredAndSortedImages = (): ImageItem[] => {
    let filtered = images;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(image => 
        image.mimeType.includes(filterType)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.originalName.localeCompare(b.originalName);
        case 'size':
          return b.size - a.size;
        case 'date':
        default:
          return new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime();
      }
    });

    return filtered;
  };

  const filteredImages = getFilteredAndSortedImages();
  const canUploadMore = !maxImages || images.length < maxImages;

  return (
    <div className="image-gallery">
      {/* Gallery Header */}
      <div className="gallery-header">
        <div className="gallery-info">
          <h3>Image Gallery</h3>
          <span className="image-count">
            {filteredImages.length} of {images.length} images
            {maxImages && ` (max ${maxImages})`}
          </span>
        </div>
        
        <div className="gallery-controls">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ⊞
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              ☰
            </button>
          </div>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>

          {/* Filter Options */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
      </div>

      {/* Upload Area */}
      {showUpload && canUploadMore && (
        <div
          className={`upload-area ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <div className="upload-content">
            <div className="upload-icon">📷</div>
            <p>Drop images here or click to browse</p>
            <span className="upload-hint">
              Supports JPEG, PNG, WebP • Max 10MB per file
            </span>
          </div>
        </div>
      )}

      {/* Images Grid/List */}
      <div className={`images-container ${viewMode}`}>
        {filteredImages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🖼️</div>
            <h4>No images found</h4>
            <p>
              {images.length === 0 
                ? 'Upload your first image to get started'
                : 'Try adjusting your filters'
              }
            </p>
          </div>
        ) : (
          filteredImages.map((image) => (
            <div
              key={image.id}
              className={`image-item ${selectedImages.has(image.id) ? 'selected' : ''}`}
              onClick={() => handleImageClick(image)}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="image-thumbnail">
                    <img
                      src={image.url}
                      alt={image.originalName}
                      loading="lazy"
                    />
                    <div className="image-overlay">
                      <button
                        className="delete-button"
                        onClick={(e) => handleImageDelete(image.id, e)}
                        title="Delete image"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="image-info">
                    <div className="image-name" title={image.originalName}>
                      {image.originalName}
                    </div>
                    <div className="image-details">
                      <span>{image.dimensions.width}×{image.dimensions.height}</span>
                      <span>{formatFileSize(image.size)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="image-list-item">
                  <div className="image-thumbnail-small">
                    <img
                      src={image.url}
                      alt={image.originalName}
                      loading="lazy"
                    />
                  </div>
                  <div className="image-details-expanded">
                    <div className="image-name">{image.originalName}</div>
                    <div className="image-meta">
                      <span>{image.dimensions.width}×{image.dimensions.height}</span>
                      <span>{formatFileSize(image.size)}</span>
                      <span>{image.mimeType}</span>
                      <span>{formatDate(image.processedAt)}</span>
                    </div>
                  </div>
                  <div className="image-actions">
                    <button
                      className="delete-button"
                      onClick={(e) => handleImageDelete(image.id, e)}
                      title="Delete image"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Selection Info */}
      {allowMultipleSelection && selectedImages.size > 0 && (
        <div className="selection-info">
          <span>{selectedImages.size} image(s) selected</span>
          <button
            onClick={() => setSelectedImages(new Set())}
            className="clear-selection"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageGallery;