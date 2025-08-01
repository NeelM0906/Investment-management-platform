import React from 'react';
import ImageUploadManager from './ImageUploadManager';
import './ShowcasePhotoManager.css';

interface ShowcasePhoto {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

interface ShowcasePhotoManagerProps {
  projectId: string;
  showcasePhoto?: ShowcasePhoto;
  onPhotoUpdated: () => void;
}

const ShowcasePhotoManager: React.FC<ShowcasePhotoManagerProps> = ({
  projectId,
  showcasePhoto,
  onPhotoUpdated
}) => {
  const handleImageUpload = async (file: File, options?: any) => {
    const formData = new FormData();
    formData.append('photo', file);
    
    // Add processing options if provided
    if (options) {
      if (options.maxWidth) formData.append('maxWidth', options.maxWidth.toString());
      if (options.maxHeight) formData.append('maxHeight', options.maxHeight.toString());
      if (options.quality) formData.append('quality', options.quality.toString());
      if (options.format) formData.append('format', options.format);
      if (options.crop) formData.append('crop', JSON.stringify(options.crop));
    }

    const response = await fetch(`http://localhost:3001/api/projects/${projectId}/deal-room/showcase-photo`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload photo');
    }

    const data = await response.json();
    if (data.success) {
      onPhotoUpdated();
    }
  };

  const handleImageDelete = async () => {
    const response = await fetch(`http://localhost:3001/api/projects/${projectId}/deal-room/showcase-photo`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to remove photo');
    }

    const data = await response.json();
    if (data.success) {
      onPhotoUpdated();
    }
  };

  // Convert showcasePhoto to the format expected by ImageUploadManager
  const currentImage = showcasePhoto ? {
    id: 'showcase-photo',
    url: `http://localhost:3001/api/projects/${projectId}/deal-room/showcase-photo`,
    originalName: showcasePhoto.originalName,
    size: showcasePhoto.size,
    dimensions: { width: 0, height: 0 } // We don't have dimensions in the current format
  } : undefined;

  return (
    <div className="showcase-photo-manager">
      <div className="section-header">
        <h2>Showcase Photo</h2>
        <p className="section-description">
          Upload a high-quality image to represent your investment opportunity. 
          This photo will be prominently displayed to potential investors.
        </p>
      </div>

      <ImageUploadManager
        onImageUpload={handleImageUpload}
        onImageDelete={handleImageDelete}
        currentImage={currentImage}
        maxFileSize={10 * 1024 * 1024} // 10MB
        allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
        showCropTool={true}
        showResizeOptions={true}
        presetSizes={[
          { name: 'Original', width: 0, height: 0 },
          { name: 'Large (1920x1080)', width: 1920, height: 1080 },
          { name: 'Medium (1280x720)', width: 1280, height: 720 },
          { name: 'Small (640x360)', width: 640, height: 360 },
        ]}
      />
    </div>
  );
};

export default ShowcasePhotoManager;