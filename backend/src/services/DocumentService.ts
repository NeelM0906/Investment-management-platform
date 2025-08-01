import { Document, DocumentFormData, DocumentFilters, ProjectDocumentSummary, SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '../models/Document';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { ProjectService } from './ProjectService';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export class DocumentService {
  private documentRepository: DocumentRepository;
  private projectService: ProjectService;

  constructor() {
    this.documentRepository = new DocumentRepository();
    this.projectService = new ProjectService();
  }

  async getAllDocuments(filters?: DocumentFilters): Promise<Document[]> {
    return await this.documentRepository.findAll(filters);
  }

  async getDocument(id: string): Promise<Document> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Document ID is required');
    }

    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  }

  async getDocumentsByProject(projectId: string): Promise<Document[]> {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    // Verify project exists
    try {
      await this.projectService.getProject(projectId);
    } catch (error) {
      throw new Error('Project not found');
    }

    return await this.documentRepository.findByProjectId(projectId);
  }

  async uploadDocument(file: Express.Multer.File, customName: string, projectId: string): Promise<Document> {
    // Validate inputs
    if (!file) {
      throw new Error('No file provided');
    }

    if (!customName || customName.trim() === '') {
      throw new Error('Custom name is required');
    }

    if (!projectId || projectId.trim() === '') {
      throw new Error('Project ID is required');
    }

    // Verify project exists
    try {
      await this.projectService.getProject(projectId);
    } catch (error) {
      throw new Error('Project not found');
    }

    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = this.documentRepository.getFilePath(fileName);

    try {
      // Move file to uploads directory
      fs.writeFileSync(filePath, file.buffer);

      // Create document record
      const document = await this.documentRepository.create({
        projectId,
        originalName: file.originalname,
        customName: customName.trim(),
        fileName,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileExtension
      });

      return document;
    } catch (error) {
      // Clean up file if database operation fails
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
      
      throw new Error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateDocument(id: string, updates: { customName?: string }): Promise<Document> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Document ID is required');
    }

    if (updates.customName !== undefined) {
      if (!updates.customName || updates.customName.trim() === '') {
        throw new Error('Custom name cannot be empty');
      }
      updates.customName = updates.customName.trim();
    }

    const updatedDocument = await this.documentRepository.update(id, updates);
    if (!updatedDocument) {
      throw new Error('Document not found');
    }

    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Document ID is required');
    }

    const deleted = await this.documentRepository.delete(id);
    if (!deleted) {
      throw new Error('Document not found');
    }
  }

  async getProjectDocumentSummaries(): Promise<ProjectDocumentSummary[]> {
    const summaries = await this.documentRepository.getProjectDocumentSummaries();
    
    // Populate project names
    for (const summary of summaries) {
      try {
        const project = await this.projectService.getProject(summary.projectId);
        summary.projectName = project.projectName;
      } catch (error) {
        summary.projectName = 'Unknown Project';
      }
    }

    return summaries;
  }

  async getDocumentFilePath(id: string): Promise<string> {
    const document = await this.getDocument(id);
    const filePath = this.documentRepository.getFilePath(document.fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Document file not found on disk');
    }
    
    return filePath;
  }

  async getDocumentsCount(): Promise<number> {
    return await this.documentRepository.count();
  }

  async getDocumentsCountByProject(projectId: string): Promise<number> {
    return await this.documentRepository.countByProject(projectId);
  }

  async searchDocuments(searchTerm: string): Promise<Document[]> {
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
      return await this.getAllDocuments();
    }

    return await this.documentRepository.findAll({ search: searchTerm.trim() });
  }

  private validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`);
    }

    // Check file type
    if (!SUPPORTED_FILE_TYPES[file.mimetype]) {
      const supportedExtensions = Object.values(SUPPORTED_FILE_TYPES).join(', ');
      throw new Error(`Unsupported file type. Supported formats: ${supportedExtensions}`);
    }

    // Check if file has content
    if (file.size === 0) {
      throw new Error('File is empty');
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}