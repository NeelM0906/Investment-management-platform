import React, { useState, useEffect } from 'react';
import { Plus, FileText, Download, Edit, Trash2, FolderOpen, Upload } from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';
import ConfirmationDialog from '../components/ConfirmationDialog';
import './DocumentsPage.css';

interface Document {
  id: string;
  projectId: string;
  originalName: string;
  customName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  uploadedAt: string;
  updatedAt: string;
}

interface ProjectDocumentSummary {
  projectId: string;
  projectName: string;
  documentCount: number;
  totalSize: number;
  lastUpload?: string;
  recentDocuments: Document[];
}

const DocumentsPage: React.FC = () => {
  const [view, setView] = useState<'projects' | 'documents'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string>('');
  const [projectSummaries, setProjectSummaries] = useState<ProjectDocumentSummary[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (view === 'projects') {
      fetchProjectSummaries();
    } else if (selectedProjectId) {
      fetchProjectDocuments(selectedProjectId);
    }
  }, [view, selectedProjectId]);

  const fetchProjectSummaries = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/documents/summaries');
      if (!response.ok) {
        throw new Error('Failed to fetch project summaries');
      }

      const data = await response.json();
      if (data.success) {
        setProjectSummaries(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch project summaries');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDocuments = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/documents/project/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project documents');
      }

      const data = await response.json();
      if (data.success) {
        setDocuments(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch project documents');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (summary: ProjectDocumentSummary) => {
    setSelectedProjectId(summary.projectId);
    setSelectedProjectName(summary.projectName);
    setView('documents');
  };

  const handleBackToProjects = () => {
    setView('projects');
    setSelectedProjectId(null);
    setSelectedProjectName('');
    setDocuments([]);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    if (view === 'projects') {
      fetchProjectSummaries();
    } else if (selectedProjectId) {
      fetchProjectDocuments(selectedProjectId);
    }
  };

  const handleDeleteDocument = (doc: Document) => {
    setDocumentToDelete(doc);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      const response = await fetch(`http://localhost:3001/api/documents/${documentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      const data = await response.json();
      if (data.success) {
        setDocuments(documents.filter(d => d.id !== documentToDelete.id));
        setShowDeleteDialog(false);
        setDocumentToDelete(null);
      } else {
        throw new Error(data.error?.message || 'Failed to delete document');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setEditName(doc.customName);
  };

  const handleSaveEdit = async () => {
    if (!editingDocument || !editName.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/documents/${editingDocument.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customName: editName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      const data = await response.json();
      if (data.success) {
        setDocuments(documents.map(d => d.id === editingDocument.id ? data.data : d));
        setEditingDocument(null);
        setEditName('');
      } else {
        throw new Error(data.error?.message || 'Failed to update document');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(`http://localhost:3001/api/documents/${doc.id}/download`);
      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.originalName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋';
    if (mimeType.includes('text')) return '📃';
    return '📁';
  };

  if (loading) {
    return (
      <div className="documents-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-page">
      {/* Header */}
      <div className="documents-header">
        <div className="header-content">
          <div className="header-info">
            {view === 'documents' && (
              <button onClick={handleBackToProjects} className="back-button">
                ← Back to Projects
              </button>
            )}
            <h1>
              {view === 'projects' ? 'Documents' : `${selectedProjectName} Documents`}
            </h1>
            <p className="documents-count">
              {view === 'projects'
                ? `${projectSummaries.length} project${projectSummaries.length !== 1 ? 's' : ''} with documents`
                : `${documents.length} document${documents.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="upload-document-btn"
          >
            <Plus size={20} />
            Upload Document
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Content */}
      <div className="documents-content">
        {view === 'projects' ? (
          // Projects View
          <>
            {projectSummaries.length === 0 ? (
              <div className="empty-state">
                <FolderOpen size={48} className="empty-icon" />
                <h3>No documents found</h3>
                <p>Upload your first document to get started.</p>
                <button onClick={() => setShowUploadModal(true)} className="empty-action-btn">
                  <Upload size={20} />
                  Upload Document
                </button>
              </div>
            ) : (
              <div className="projects-grid">
                {projectSummaries.map((summary) => (
                  <div
                    key={summary.projectId}
                    className="project-card"
                    onClick={() => handleProjectClick(summary)}
                  >
                    <div className="project-header">
                      <div className="project-icon">
                        <FolderOpen size={24} />
                      </div>
                      <div className="project-info">
                        <h3 className="project-name">{summary.projectName}</h3>
                        <p className="project-stats">
                          {summary.documentCount} document{summary.documentCount !== 1 ? 's' : ''} • {formatFileSize(summary.totalSize)}
                        </p>
                      </div>
                    </div>

                    {summary.recentDocuments.length > 0 && (
                      <div className="recent-documents">
                        <h4>Recent Documents</h4>
                        {summary.recentDocuments.map((doc) => (
                          <div key={doc.id} className="recent-doc">
                            <span className="doc-icon">{getFileIcon(doc.mimeType)}</span>
                            <span className="doc-name">{doc.customName}</span>
                            <span className="doc-size">{formatFileSize(doc.fileSize)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {summary.lastUpload && (
                      <div className="last-upload">
                        Last upload: {formatDate(summary.lastUpload)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Documents View
          <>
            {documents.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} className="empty-icon" />
                <h3>No documents in this project</h3>
                <p>Upload documents for {selectedProjectName} to get started.</p>
                <button onClick={() => setShowUploadModal(true)} className="empty-action-btn">
                  <Upload size={20} />
                  Upload Document
                </button>
              </div>
            ) : (
              <div className="documents-table-container">
                <table className="documents-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Original Name</th>
                      <th>Size</th>
                      <th>Uploaded</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id}>
                        <td className="document-name">
                          <div className="name-cell">
                            <span className="doc-icon">{getFileIcon(doc.mimeType)}</span>
                            <div className="name-info">
                              {editingDocument?.id === doc.id ? (
                                <div className="edit-name">
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                    onBlur={handleSaveEdit}
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <div className="document-title">{doc.customName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="original-name">{doc.originalName}</td>
                        <td className="file-size">{formatFileSize(doc.fileSize)}</td>
                        <td className="upload-date">{formatDate(doc.uploadedAt)}</td>
                        <td className="document-actions">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="action-btn download-btn"
                            title="Download document"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleEditDocument(doc)}
                            className="action-btn edit-btn"
                            title="Edit document name"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            className="action-btn delete-btn"
                            title="Delete document"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUpload
          selectedProjectId={selectedProjectId}
          onSuccess={handleUploadSuccess}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && documentToDelete && (
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          title="Delete Document"
          message={`Are you sure you want to delete "${documentToDelete.customName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteDialog(false);
            setDocumentToDelete(null);
          }}
          type="danger"
        />
      )}
    </div>
  );
};

export default DocumentsPage;