export interface Document {
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
export declare const SUPPORTED_FILE_TYPES: {
    'application/msword': string;
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': string;
    'application/vnd.ms-excel': string;
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': string;
    'application/vnd.ms-powerpoint': string;
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': string;
    'application/pdf': string;
    'text/plain': string;
    'application/rtf': string;
    'application/vnd.oasis.opendocument.text': string;
    'application/vnd.oasis.opendocument.spreadsheet': string;
    'application/vnd.oasis.opendocument.presentation': string;
    'text/csv': string;
    'text/markdown': string;
    'application/json': string;
    'text/xml': string;
    'application/xml': string;
};
export declare const MAX_FILE_SIZE: number;
export declare const getFileIcon: (mimeType: string) => string;
//# sourceMappingURL=Document.d.ts.map