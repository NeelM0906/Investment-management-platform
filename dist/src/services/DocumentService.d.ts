import { Document, DocumentFilters, ProjectDocumentSummary } from '../models/Document';
export declare class DocumentService {
    private documentRepository;
    private projectService;
    constructor();
    getAllDocuments(filters?: DocumentFilters): Promise<Document[]>;
    getDocument(id: string): Promise<Document>;
    getDocumentsByProject(projectId: string): Promise<Document[]>;
    uploadDocument(file: Express.Multer.File, customName: string, projectId: string): Promise<Document>;
    updateDocument(id: string, updates: {
        customName?: string;
    }): Promise<Document>;
    deleteDocument(id: string): Promise<void>;
    getProjectDocumentSummaries(): Promise<ProjectDocumentSummary[]>;
    getDocumentFilePath(id: string): Promise<string>;
    getDocumentsCount(): Promise<number>;
    getDocumentsCountByProject(projectId: string): Promise<number>;
    searchDocuments(searchTerm: string): Promise<Document[]>;
    private validateFile;
    formatFileSize(bytes: number): string;
}
//# sourceMappingURL=DocumentService.d.ts.map