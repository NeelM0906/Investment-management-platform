import { Document, DocumentFilters, ProjectDocumentSummary } from '../models/Document';
export declare class DocumentRepository {
    private fileStorage;
    private uploadsDir;
    constructor();
    private ensureUploadsDirectory;
    findAll(filters?: DocumentFilters): Promise<Document[]>;
    findById(id: string): Promise<Document | null>;
    findByProjectId(projectId: string): Promise<Document[]>;
    create(documentData: Omit<Document, 'id' | 'uploadedAt' | 'updatedAt'>): Promise<Document>;
    update(id: string, documentData: Partial<Omit<Document, 'id' | 'uploadedAt'>>): Promise<Document | null>;
    delete(id: string): Promise<boolean>;
    getProjectDocumentSummaries(): Promise<ProjectDocumentSummary[]>;
    count(): Promise<number>;
    countByProject(projectId: string): Promise<number>;
    getFilePath(fileName: string): string;
}
//# sourceMappingURL=DocumentRepository.d.ts.map