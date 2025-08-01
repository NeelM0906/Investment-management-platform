import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import './DocumentUpload.css';

interface Project {
  id: string;
  projectName: string;
}

interface DocumentUploadProps {
  selectedProjectId?: string | null;
  onSuccess: () => void;
  onClose: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  selectedProjectId, 
  onSuccess, 
  onClose 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    projectId: selectedProjectId || '',
    customName: '',
    file: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedTypes = [
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.pdf', '.txt', '.rtf', '.odt', '.ods', '.odp',
    '.csv', '.md', '.json', '.xml'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProjects(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectId) {
      newErrors.projectId = 'Please select a project';
    }

    if (!formData.customName.trim()) {
      newErrors.customName = 'Document name is required';
    } else if (formData.customName.length > 100) {
      newErrors.customName = 'Document name must be 100 characters or less';
    }

    if (!formData.file) {
      newErrors.file = 'Please select a file to upload';
    } else {
      // Check file size
      if (formData.file.size > maxFileSize) {
        newErrors.file = 'File size must be 10MB or less';
      }

      // Check file type
      const fileExtension = '.' + formData.file.name.split('.').pop()?.toLowerCase();
      if (!supportedTypes.includes(fileExtension)) {
        newErrors.file = `Unsupported file type. Supported formats: ${supportedTypes.join(', ')}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear upload error
    if (uploadError) {
      setUploadError(null);
    }
  };

  const handleFileSelect = (file: File) => {
    setFormData(prev => ({ ...prev, file }));
    
    // Auto-fill custom name if empty
    if (!formData.customName.trim()) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({ ...prev, customName: nameWithoutExtension }));
    }
    
    // Clear file error
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file!);
      uploadFormData.append('customName', formData.customName.trim());
      uploadFormData.append('projectId', formData.projectId);

      const response = await fetch('http://localhost:3001/api/documents', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        throw new Error(data.error?.message || 'Failed to upload document');
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="document-upload-overlay" onClick={handleOverlayClick}>
      <div className="document-upload-container">
        <div className="upload-header">
          <h2>
            <Upload size={24} />
            Upload Document
          </h2>
          <button onClick={onClose} className="close-btn" type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-content">
            {/* Project Selection */}
            <div className="form-group">
              <label htmlFor="projectId">
                Project <span className="required">*</span>
              </label>
              <select
                id="projectId"
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                className={errors.projectId ? 'error' : ''}
                disabled={isUploading || !!selectedProjectId}
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.projectName}
                  </option>
                ))}
              </select>
              {errors.projectId && <span className="error-message">{errors.projectId}</span>}
            </div>

            {/* Document Name */}
            <div className="form-group">
              <label htmlFor="customName">
                Document Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="customName"
                value={formData.customName}
                onChange={(e) => handleInputChange('customName', e.target.value)}
                className={errors.customName ? 'error' : ''}
                maxLength={100}
                disabled={isUploading}
                placeholder="Enter a descriptive name for the document"
              />
              {errors.customName && <span className="error-message">{errors.customName}</span>}
            </div>

            {/* File Upload */}
            <div className="form-group">
              <label>
                File <span className="required">*</span>
              </label>
              <div 
                className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${errors.file ? 'error' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept={supportedTypes.join(',')}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
                
                {formData.file ? (
                  <div className="file-selected">
                    <FileText size={32} className="file-icon" />
                    <div className="file-info">
                      <div className="file-name">{formData.file.name}</div>
                      <div className="file-size">{formatFileSize(formData.file.size)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="file-upload-prompt">
                    <Upload size={32} className="upload-icon" />
                    <div className="upload-text">
                      <p>Click to select a file or drag and drop</p>
                      <p className="upload-hint">
                        Supported formats: {supportedTypes.join(', ')}
                      </p>
                      <p className="upload-hint">Maximum file size: 10MB</p>
                    </div>
                  </div>
                )}
              </div>
              {errors.file && <span className="error-message">{errors.file}</span>}
            </div>
          </div>

          {/* Upload Error */}
          {uploadError && (
            <div className="upload-error">
              <AlertCircle size={16} />
              <p>{uploadError}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="upload-btn"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="spinner"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUpload;