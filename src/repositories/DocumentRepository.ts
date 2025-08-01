import { Document, DocumentFormData, DocumentFilters, ProjectDocumentSummary } from '../models/Document';
import { FileStorage } from '../utils/fileStorage';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export class DocumentRepository {
  private fileStorage: FileStorage<Document>;
  private uploadsDir: string;

  constructor() {
    this.fileStorage = new FileStorage<Document>('data/documents.json');
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async findAll(filters?: DocumentFilters): Promise<Document[]> {
    let documents = await this.fileStorage.readAll();

    // Apply project filter
    if (filters?.projectId) {
      documents = documents.filter(doc => doc.projectId === filters.projectId);
    }

    // Apply search filter
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      documents = documents.filter(doc => 
        doc.customName.toLowerCase().includes(searchTerm) ||
        doc.originalName.toLowerCase().includes(searchTerm)
      );
    }

    // Apply file type filter
    if (filters?.fileType) {
      documents = documents.filter(doc => doc.mimeType.includes(filters.fileType!));
    }

    // Apply sorting
    if (filters?.sortBy) {
      documents.sort((a, b) => {
        let aValue: any = a[filters.sortBy!];
        let bValue: any = b[filters.sortBy!];
        
        // Handle date sorting
        if (filters.sortBy === 'uploadedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        // Handle numeric sorting
        if (filters.sortBy === 'fileSize') {
          return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        }
        
        // Handle string sorting
        if (typeof aValue === 'string') {
          return filters.sortOrder === 'desc' 
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }
        
        return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
    } else {
      // Default sort by upload date (newest first)
      documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }

    return documents;
  }

  async findById(id: string): Promise<Document | null> {
    const documents = await this.fileStorage.readAll();
    return documents.find(doc => doc.id === id) || null;
  }

  async findByProjectId(projectId: string): Promise<Document[]> {
    return this.findAll({ projectId });
  }

  async create(documentData: Omit<Document, 'id' | 'uploadedAt' | 'updatedAt'>): Promise<Document> {
    const documents = await this.fileStorage.readAll();
    
    const newDocument: Document = {
      id: uuidv4(),
      ...documentData,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    documents.push(newDocument);
    await this.fileStorage.writeAll(documents);
    
    return newDocument;
  }

  async update(id: string, documentData: Partial<Omit<Document, 'id' | 'uploadedAt'>>): Promise<Document | null> {
    const documents = await this.fileStorage.readAll();
    const documentIndex = documents.findIndex(doc => doc.id === id);
    
    if (documentIndex === -1) {
      return null;
    }

    const updatedDocument: Document = {
      ...documents[documentIndex],
      ...documentData,
      updatedAt: new Date().toISOString()
    };

    documents[documentIndex] = updatedDocument;
    await this.fileStorage.writeAll(documents);
    
    return updatedDocument;
  }

  async delete(id: string): Promise<boolean> {
    const documents = await this.fileStorage.readAll();
    const documentIndex = documents.findIndex(doc => doc.id === id);
    
    if (documentIndex === -1) {
      return false;
    }

    const document = documents[documentIndex];
    
    // Delete physical file
    const filePath = path.join(this.uploadsDir, document.fileName);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with database deletion even if file deletion fails
    }

    documents.splice(documentIndex, 1);
    await this.fileStorage.writeAll(documents);
    
    return true;
  }

  async getProjectDocumentSummaries(): Promise<ProjectDocumentSummary[]> {
    const documents = await this.fileStorage.readAll();
    const projectMap = new Map<string, Document[]>();

    // Group documents by project
    documents.forEach(doc => {
      if (!projectMap.has(doc.projectId)) {
        projectMap.set(doc.projectId, []);
      }
      projectMap.get(doc.projectId)!.push(doc);
    });

    // Create summaries
    const summaries: ProjectDocumentSummary[] = [];
    
    for (const [projectId, projectDocs] of projectMap.entries()) {
      const sortedDocs = projectDocs.sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      
      const totalSize = projectDocs.reduce((sum, doc) => sum + doc.fileSize, 0);
      const lastUpload = sortedDocs.length > 0 ? sortedDocs[0].uploadedAt : undefined;
      
      summaries.push({
        projectId,
        projectName: '', // Will be populated by service layer
        documentCount: projectDocs.length,
        totalSize,
        lastUpload,
        recentDocuments: sortedDocs.slice(0, 3) // Show 3 most recent
      });
    }

    return summaries.sort((a, b) => {
      if (!a.lastUpload && !b.lastUpload) return 0;
      if (!a.lastUpload) return 1;
      if (!b.lastUpload) return -1;
      return new Date(b.lastUpload).getTime() - new Date(a.lastUpload).getTime();
    });
  }

  async count(): Promise<number> {
    const documents = await this.fileStorage.readAll();
    return documents.length;
  }

  async countByProject(projectId: string): Promise<number> {
    const documents = await this.findByProjectId(projectId);
    return documents.length;
  }

  getFilePath(fileName: string): string {
    return path.join(this.uploadsDir, fileName);
  }
}