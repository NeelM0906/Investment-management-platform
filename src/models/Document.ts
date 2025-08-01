export interface Document {
  id: string;
  projectId: string;
  originalName: string;
  customName: string;
  fileName: string; // stored file name
  fileSize: number; // in bytes
  mimeType: string;
  fileExtension: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface DocumentFormData {
  projectId: string;
  customName: string;
  file: File;
}

export interface DocumentFilters {
  projectId?: string;
  search?: string;
  fileType?: string;
  sortBy?: 'customName' | 'originalName' | 'uploadedAt' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectDocumentSummary {
  projectId: string;
  projectName: string;
  documentCount: number;
  totalSize: number;
  lastUpload?: string;
  recentDocuments: Document[];
}

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  // Microsoft Office
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  
  // PDF
  'application/pdf': '.pdf',
  
  // Text files
  'text/plain': '.txt',
  'application/rtf': '.rtf',
  
  // OpenDocument
  'application/vnd.oasis.opendocument.text': '.odt',
  'application/vnd.oasis.opendocument.spreadsheet': '.ods',
  'application/vnd.oasis.opendocument.presentation': '.odp',
  
  // Other common formats
  'text/csv': '.csv',
  'text/markdown': '.md',
  'application/json': '.json',
  'text/xml': '.xml',
  'application/xml': '.xml'
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const getFileIcon = (mimeType: string): string => {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋';
  if (mimeType.includes('text')) return '📃';
  if (mimeType.includes('image')) return '🖼️';
  return '📁';
};